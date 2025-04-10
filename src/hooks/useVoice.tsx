
import { useState, useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
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
}

export function useVoice({ 
  enabled = false, 
  autoListen = false, 
  onSpeechResult,
  volume = 0.8
}: UseVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!enabled) return;
    
    // Fix for TypeScript and browser compatibility
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        // Process the speech recognition results correctly
        let finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result[0] && result[0].transcript) {
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              // For interim results
              const interimTranscript = result[0].transcript;
              setTranscript(interimTranscript);
            }
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          
          // If it's recording (not continuous listening) and we have a final result
          if (isRecording && event.results[event.results.length - 1].isFinal) {
            stopRecording();
            onSpeechResult(finalTranscript);
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
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) {
        stopListening();
        stopRecording();
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, [enabled]);
  
  // Auto-listen mode
  useEffect(() => {
    if (enabled && autoListen && !isListening) {
      startListening();
    } else if ((!enabled || !autoListen) && isListening) {
      stopListening();
    }
  }, [enabled, autoListen, isListening]);

  const startListening = () => {
    if (!enabled || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };
  
  const startRecording = () => {
    if (!enabled || !recognitionRef.current) return;
    
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  const stopRecording = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };
  
  const speak = (text: string) => {
    if (!enabled || !synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
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
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking
  };
}
