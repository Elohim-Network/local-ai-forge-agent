import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { startAudioRecording, sendAudioToServer } from './useVoiceUtils';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    MediaRecorder?: any;
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface UseVoiceProps {
  enabled: boolean;
  autoListen: boolean;
  onSpeechResult: (text: string) => void;
  volume: number;
  continuousListening?: boolean;
  onInterimResult?: (text: string) => void;
  silenceTimeout?: number;
  minConfidence?: number;
  autoSendThreshold?: number;
  useCustomVoice?: boolean;
  customVoiceName?: string;
  autoReplyEnabled?: boolean;
  useServerTranscription?: boolean;
  transcriptionEndpoint?: string;
}

export function useVoice({ 
  enabled = false, 
  autoListen = false, 
  onSpeechResult,
  volume = 0.8,
  continuousListening = false,
  onInterimResult,
  silenceTimeout = 1500,
  minConfidence = 0.5,
  autoSendThreshold = 15,
  useCustomVoice = false,
  customVoiceName = "",
  autoReplyEnabled = true,
  useServerTranscription = false,
  transcriptionEndpoint = "/api/transcribe"
}: UseVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const pendingTranscriptRef = useRef<string>('');
  const voicesLoadedRef = useRef<boolean>(false);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingCleanupRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI && !useServerTranscription) {
      try {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let hasSpeech = false;
          
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result[0] && result[0].transcript) {
              lastSpeechRef.current = Date.now();
              hasSpeech = true;
              
              if (result.isFinal) {
                if (result[0].confidence >= minConfidence) {
                  finalTranscript += result[0].transcript + ' ';
                }
              } else {
                interimTranscript = result[0].transcript;
                
                pendingTranscriptRef.current = interimTranscript;
                
                if (onInterimResult && interimTranscript.trim()) {
                  onInterimResult(interimTranscript);
                }
                setTranscript(interimTranscript);
                
                if (autoSendThreshold > 0 && 
                    interimTranscript.length > autoSendThreshold &&
                    (interimTranscript.endsWith('.') || 
                     interimTranscript.endsWith('?') || 
                     interimTranscript.endsWith('!') ||
                     /\S+\s+$/.test(interimTranscript))) {
                  
                  if (silenceTimerRef.current) {
                    window.clearTimeout(silenceTimerRef.current);
                  }
                  
                  silenceTimerRef.current = window.setTimeout(() => {
                    if (pendingTranscriptRef.current.trim()) {
                      onSpeechResult(pendingTranscriptRef.current);
                      pendingTranscriptRef.current = '';
                      setTranscript('');
                      
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                          setTimeout(() => {
                            if (recognitionRef.current && isListening) {
                              recognitionRef.current.start();
                            }
                          }, 100);
                        } catch (error) {
                          console.error("Error restarting recognition:", error);
                        }
                      }
                    }
                  }, 500);
                }
              }
            }
          }
          
          if (continuousListening && hasSpeech) {
            if (silenceTimerRef.current) {
              window.clearTimeout(silenceTimerRef.current);
            }
            
            silenceTimerRef.current = window.setTimeout(() => {
              if (Date.now() - lastSpeechRef.current >= silenceTimeout && pendingTranscriptRef.current.trim()) {
                onSpeechResult(pendingTranscriptRef.current);
                pendingTranscriptRef.current = '';
                setTranscript('');
                
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                      if (recognitionRef.current && isListening) {
                        recognitionRef.current.start();
                      }
                    }, 100);
                  } catch (error) {
                    console.error("Error restarting recognition:", error);
                  }
                }
              }
            }, silenceTimeout);
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
            
            if (isRecording && event.results[event.results.length - 1].isFinal) {
              stopRecording();
              onSpeechResult(finalTranscript);
            } else if (continuousListening && finalTranscript.trim()) {
              onSpeechResult(finalTranscript);
              setTranscript('');
            }
          }
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice features.",
              variant: "destructive"
            });
          }
          stopListening();
          stopRecording();
        };
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
      }
    } else if (!SpeechRecognitionAPI && !useServerTranscription) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Using server-based transcription instead.",
        variant: "destructive"
      });
    }
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        availableVoicesRef.current = voices;
        voicesLoadedRef.current = true;
        console.log("Loaded speech synthesis voices:", voices.length);
      };
      
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
    
    return () => {
      if (recognitionRef.current) {
        stopListening();
        stopRecording();
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      
      if (recordingCleanupRef.current) {
        recordingCleanupRef.current();
      }
    };
  }, [enabled, minConfidence, silenceTimeout, autoSendThreshold, useServerTranscription, continuousListening, isListening, isRecording, onInterimResult, onSpeechResult]);
  
  useEffect(() => {
    if (enabled && autoListen && !isListening) {
      startListening();
    } else if ((!enabled || !autoListen) && isListening) {
      stopListening();
    }
  }, [enabled, autoListen, isListening]);

  const startListening = useCallback(() => {
    if (!enabled) return;
    
    console.log("Starting listening session", { useServerTranscription });
    
    if (useServerTranscription) {
      startServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        console.log("Starting browser speech recognition");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({
          title: "Speech Recognition Error",
          description: "Failed to start listening. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [enabled, useServerTranscription]);

  const stopListening = useCallback(() => {
    console.log("Stopping listening session", { useServerTranscription });
    
    if (useServerTranscription) {
      stopServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  }, [useServerTranscription]);
  
  const startRecording = useCallback(() => {
    if (!enabled) return;
    
    console.log("Starting recording session", { useServerTranscription });
    
    pendingTranscriptRef.current = '';
    setTranscript('');
    
    if (useServerTranscription) {
      startServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Recording Error",
          description: "Failed to start recording. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [enabled, useServerTranscription]);
  
  const stopRecording = useCallback(() => {
    console.log("Stopping recording session", { useServerTranscription });
    
    if (useServerTranscription) {
      stopServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }
  }, [useServerTranscription]);
  
  const startServerBasedRecording = async () => {
    try {
      console.log("Starting server-based recording");
      setIsProcessing(true);
      
      const { mediaRecorder, recordingPromise, stopRecording } = await startAudioRecording();
      mediaRecorderRef.current = mediaRecorder;
      
      recordingCleanupRef.current = stopRecording;
      
      setIsRecording(true);
      setIsListening(true);
      
      if (silenceTimeout > 0) {
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
        }
        
        silenceTimerRef.current = window.setTimeout(() => {
          if (isRecording) {
            console.log("Auto-stopping recording due to silence timeout");
            stopServerBasedRecording();
          }
        }, silenceTimeout);
      }
      
      recordingPromise.then(async (audioBlob) => {
        console.log("Recording completed, processing audio blob", { size: audioBlob.size });
        
        if (audioBlob.size > 0) {
          try {
            console.log("Sending audio to transcription endpoint:", transcriptionEndpoint);
            const result = await sendAudioToServer(audioBlob, transcriptionEndpoint);
            
            console.log("Transcription result:", result);
            
            if (result && result.transcript) {
              setTranscript(result.transcript);
              onSpeechResult(result.transcript);
            } else {
              console.error("No transcript in response:", result);
              toast({
                title: "Transcription Error",
                description: "No transcript returned from server",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error("Error transcribing audio:", error);
            
            toast({
              title: "Transcription Error",
              description: "Failed to transcribe audio. Please try again.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        } else {
          console.warn("Audio blob is empty");
          setIsProcessing(false);
          
          toast({
            title: "Recording Error",
            description: "No audio was recorded. Please check your microphone and try again.",
            variant: "destructive"
          });
        }
      }).catch(error => {
        console.error("Error in recording promise:", error);
        setIsProcessing(false);
        
        toast({
          title: "Recording Error",
          description: "Failed to process recording. Please try again.",
          variant: "destructive"
        });
      });
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsProcessing(false);
      
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
    }
  };
  
  const stopServerBasedRecording = () => {
    console.log("Stopping server-based recording");
    
    if (recordingCleanupRef.current) {
      recordingCleanupRef.current();
      recordingCleanupRef.current = null;
    }
    
    setIsRecording(false);
    setIsListening(false);
    
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  const speak = useCallback((text: string) => {
    if (!enabled || !synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    console.log("Speaking text:", text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    
    const voices = availableVoicesRef.current;
    
    if (voices.length > 0) {
      if (useCustomVoice && customVoiceName) {
        utterance.voice = voices.find(v => 
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('natural')
        ) || voices[0];
        
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      } else {
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced')
        );
        
        if (preferredVoices.length > 0) {
          utterance.voice = preferredVoices[0];
        } else {
          utterance.voice = voices[0];
        }
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      
      if (autoReplyEnabled && (continuousListening || autoListen) && !isListening) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  }, [enabled, volume, useCustomVoice, customVoiceName, autoReplyEnabled, continuousListening, autoListen, isListening, startListening]);
  
  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isRecording,
    isSpeaking,
    transcript,
    isProcessing,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking
  };
}
