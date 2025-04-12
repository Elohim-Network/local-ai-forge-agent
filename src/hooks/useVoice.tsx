
import { useState, useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    MediaRecorder?: any;
  }
}

// Define SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  speaking?: boolean;
}

// Fixed SpeechRecognitionEvent interface to correctly represent the structure
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const pendingTranscriptRef = useRef<string>('');
  const voicesLoadedRef = useRef<boolean>(false);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!enabled) return;
    
    // Fix for TypeScript and browser compatibility
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI && !useServerTranscription) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        // Process the speech recognition results correctly
        let finalTranscript = '';
        let interimTranscript = '';
        let hasSpeech = false;
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result[0] && result[0].transcript) {
            // Reset silence timer when we get new speech
            lastSpeechRef.current = Date.now();
            hasSpeech = true;
            
            if (result.isFinal) {
              if (result[0].confidence >= minConfidence) {
                finalTranscript += result[0].transcript + ' ';
              }
            } else {
              // For interim results
              interimTranscript = result[0].transcript;
              
              // Keep track of the interim transcript to check for auto-send threshold
              pendingTranscriptRef.current = interimTranscript;
              
              if (onInterimResult && interimTranscript.trim()) {
                onInterimResult(interimTranscript);
              }
              setTranscript(interimTranscript);
              
              // Auto-send if transcript exceeds threshold and contains a natural pause
              if (autoSendThreshold > 0 && 
                  interimTranscript.length > autoSendThreshold &&
                  (interimTranscript.endsWith('.') || 
                   interimTranscript.endsWith('?') || 
                   interimTranscript.endsWith('!') ||
                   /\S+\s+$/.test(interimTranscript))) { // Ends with space after a word
                
                // Clear existing silence timer if any
                if (silenceTimerRef.current) {
                  window.clearTimeout(silenceTimerRef.current);
                }
                
                // Set a small delay before sending to allow for potential continuation
                silenceTimerRef.current = window.setTimeout(() => {
                  if (pendingTranscriptRef.current.trim()) {
                    // Always send with auto-reply when using auto-send threshold
                    onSpeechResult(pendingTranscriptRef.current);
                    pendingTranscriptRef.current = '';
                    setTranscript('');
                    
                    // Restart recognition to clear buffer
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
                }, 500); // Small delay to check if speech continues
              }
            }
          }
        }
        
        // Handle continuous listening mode
        if (continuousListening && hasSpeech) {
          // Clear any existing silence detection timer
          if (silenceTimerRef.current) {
            window.clearTimeout(silenceTimerRef.current);
          }
          
          // Set a new timer to detect when speaking stops
          silenceTimerRef.current = window.setTimeout(() => {
            if (Date.now() - lastSpeechRef.current >= silenceTimeout && pendingTranscriptRef.current.trim()) {
              // If there's been silence for the timeout period and we have interim results,
              // treat the interim transcript as final
              onSpeechResult(pendingTranscriptRef.current);
              pendingTranscriptRef.current = '';
              setTranscript('');
              
              // Restart recognition to clear buffer
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
          
          // If it's recording (not continuous listening) and we have a final result
          if (isRecording && event.results[event.results.length - 1].isFinal) {
            stopRecording();
            onSpeechResult(finalTranscript);
          } else if (continuousListening && finalTranscript.trim()) {
            // In continuous mode, send each final result immediately
            onSpeechResult(finalTranscript);
            setTranscript('');
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
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
    } else if (!SpeechRecognitionAPI && !useServerTranscription) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        availableVoicesRef.current = voices;
        voicesLoadedRef.current = true;
      };
      
      // Chrome loads voices asynchronously
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      // Initial load attempt
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
      
      // Clear any timers
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };
  }, [enabled, minConfidence, silenceTimeout, autoSendThreshold, useServerTranscription]);
  
  // Auto-listen mode
  useEffect(() => {
    if (enabled && autoListen && !isListening) {
      startListening();
    } else if ((!enabled || !autoListen) && isListening) {
      stopListening();
    }
  }, [enabled, autoListen, isListening]);

  const startListening = () => {
    if (!enabled) return;
    
    if (useServerTranscription) {
      startServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (useServerTranscription) {
      stopServerBasedRecording();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        
        // Clear any silence timer
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  };
  
  const startRecording = () => {
    if (!enabled) return;
    
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
      }
    }
  };
  
  const stopRecording = () => {
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
  };
  
  const startServerBasedRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioChunksRef.current = [];
      
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        // Send to server for transcription
        if (audioBlob.size > 0) {
          try {
            setIsProcessing(true);
            const result = await sendAudioToServer(audioBlob);
            setIsProcessing(false);
            
            if (result && result.transcript) {
              setTranscript(result.transcript);
              onSpeechResult(result.transcript);
            }
          } catch (error) {
            setIsProcessing(false);
            console.error("Error transcribing audio:", error);
            toast({
              title: "Transcription Error",
              description: "Failed to transcribe audio. Please try again.",
              variant: "destructive"
            });
          }
        }
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsListening(true);
      
      // Auto-stop after silence timeout
      if (silenceTimeout > 0) {
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
        }
        
        silenceTimerRef.current = window.setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            stopServerBasedRecording();
          }
        }, silenceTimeout);
      }
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
    }
  };
  
  const stopServerBasedRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  };
  
  const sendAudioToServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    try {
      const response = await fetch(transcriptionEndpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error sending audio to server:", error);
      throw error;
    }
  };
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const speak = (text: string) => {
    if (!enabled || !synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    
    // Try to use a more natural voice if available
    const voices = availableVoicesRef.current;
    
    // Choose a preferred voice based on settings and availability
    if (voices.length > 0) {
      // First priority: Use custom voice if requested
      if (useCustomVoice && customVoiceName) {
        // This is just a placeholder - in a real implementation,
        // you would use a more sophisticated voice selection mechanism
        // or connect to a third-party API like ElevenLabs
        utterance.voice = voices.find(v => 
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('natural')
        ) || voices[0];
        
        // Apply some voice modifications to simulate a custom voice
        utterance.pitch = 1.05;
        utterance.rate = 0.95;
      } else {
        // Second priority: Find premium/Google voices for better quality
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Google') || // Google voices tend to be better
          voice.name.includes('Natural') || 
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced')
        );
        
        if (preferredVoices.length > 0) {
          utterance.voice = preferredVoices[0];
        } else {
          // Fallback to any available voice
          utterance.voice = voices[0];
        }
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      
      // Auto-listen after speaking if continuous mode or auto-reply is enabled
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
  };
  
  const stopSpeaking = () => {
    if (!synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

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
