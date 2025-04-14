
import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bot, Send, Monitor, Smartphone, Tablet, Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { startAudioRecording, sendAudioToServer } from "@/hooks/useVoiceUtils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function WorkspacePreview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Elohim. How may I assist you today?",
      timestamp: formatTime(new Date())
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recordingCleanupRef = useRef<(() => void) | null>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addMessage("user", inputValue);
      generateResponse(inputValue);
      setInputValue("");
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages(prev => [
      ...prev, 
      { role, content, timestamp: formatTime(new Date()) }
    ]);
  };

  const generateResponse = async (userMessage: string) => {
    setIsProcessing(true);
    
    // Generate a contextual response quickly
    setTimeout(() => {
      let response = getContextualResponse(userMessage);
      addMessage("assistant", response);
      
      // Speak the response if needed
      if ('speechSynthesis' in window) {
        speakMessage(response);
      }
      
      setIsProcessing(false);
    }, 500);
  };
  
  const getContextualResponse = (userMessage: string): string => {
    // Quick response generation based on input
    const message = userMessage.toLowerCase();
    
    if (message.includes("hello") || message.includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (message.includes("help")) {
      return "I'd be happy to help. What specific assistance do you need?";
    } else if (message.includes("voice")) {
      return "Voice recognition is active. You can speak to me and I'll transcribe and respond to your requests.";
    } else if (message.includes("capabilities") || message.includes("features")) {
      return "I can assist with text generation, voice interaction, and provide various responses to your queries.";
    } else {
      return "I understand your request about \"" + userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "") + "\". How would you like me to assist with this?";
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      
      const { stopRecording, recordingPromise } = await startAudioRecording();
      recordingCleanupRef.current = stopRecording;
      
      toast({
        title: "Recording started",
        description: "Speak now...",
      });
      
      // Automatically stop recording after 10 seconds to prevent hanging
      const recordingTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);
      
      try {
        const audioBlob = await recordingPromise;
        
        if (audioBlob.size > 0) {
          setIsProcessing(true);
          
          try {
            const transcription = await sendAudioToServer(audioBlob, "/api/transcribe");
            
            if (transcription && transcription.transcript) {
              const transcript = transcription.transcript;
              
              // Add the transcribed message
              addMessage("user", transcript);
              
              // Generate a response
              generateResponse(transcript);
            }
          } catch (error) {
            console.error("Transcription error:", error);
            toast({
              title: "Transcription Error",
              description: "Failed to transcribe audio",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        } else {
          toast({
            title: "Recording Error",
            description: "No audio was captured. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Recording error:", error);
        toast({
          title: "Recording Error",
          description: error.message || "Failed to process recording",
          variant: "destructive"
        });
      } finally {
        clearTimeout(recordingTimeout);
        setIsRecording(false);
        recordingCleanupRef.current = null;
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      toast({
        title: "Microphone Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recordingCleanupRef.current) {
      recordingCleanupRef.current();
      recordingCleanupRef.current = null;
    }
    setIsRecording(false);
  };
  
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Select a good voice if available
      if (voices.length > 0) {
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium')
        );
        
        if (preferredVoices.length > 0) {
          utterance.voice = preferredVoices[0];
        } else {
          utterance.voice = voices[0];
        }
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  return (
    <div className="h-full border-l border-border/30 p-4 bg-gradient-to-br from-background to-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2 text-primary">
          <Monitor size={16} className="text-primary" />
          <span>Preview</span>
        </h3>
        <Select defaultValue="mobile">
          <SelectTrigger className="w-[130px] bg-card/60 border-border/40">
            <SelectValue placeholder="Preview mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desktop"><div className="flex items-center gap-2"><Monitor size={14} /> Desktop</div></SelectItem>
            <SelectItem value="tablet"><div className="flex items-center gap-2"><Tablet size={14} /> Tablet</div></SelectItem>
            <SelectItem value="mobile"><div className="flex items-center gap-2"><Smartphone size={14} /> Mobile</div></SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-background/50 rounded-lg border border-primary/20 h-[calc(100%-3rem)] p-4 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
        <div className="w-full max-w-sm h-[520px] bg-card rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(0,179,255,0.1)] transform perspective-[1000px] rotate-y-[-1deg] rotate-x-[1deg]">
          <div className="h-12 border-b border-border/30 flex items-center px-4 bg-gradient-to-r from-card to-background">
            <span className="text-sm font-medium">ELOHIM</span>
            <span className="text-xs ml-2 text-muted-foreground font-mono">v1.0.3</span>
            <div className="ml-auto flex gap-1">
              {isSpeaking && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400/70 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400/40 animate-pulse delay-150"></div>
                </div>
              )}
              {!isSpeaking && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-[calc(100%-6rem)] p-4 overflow-y-auto bg-card/80 space-y-4">
            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse ml-auto' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'assistant' 
                      ? 'bg-primary/20' 
                      : 'bg-primary/10'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot size={16} className="text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/80"></div>
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-muted/70 rounded-tl-none max-w-[85%] backdrop-blur-sm border border-border/20' 
                      : 'bg-primary text-primary-foreground rounded-tr-none max-w-[85%]'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="flex justify-between items-center mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-0 h-6 w-6 ${
                          message.role === 'assistant' 
                            ? 'text-muted-foreground hover:text-foreground' 
                            : 'text-primary-foreground/70 hover:text-primary-foreground'
                        }`}
                        onClick={() => speakMessage(message.content)}
                        title="Listen to message"
                      >
                        <Volume2 size={14} />
                        <span className="sr-only">Listen</span>
                      </Button>
                      <div className={`text-xs opacity-70 ${
                        message.role === 'assistant' 
                          ? 'text-muted-foreground' 
                          : 'text-primary-foreground/70'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20">
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="bg-muted/70 p-3 rounded-lg rounded-tl-none max-w-[85%] backdrop-blur-sm border border-border/20">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {isRecording && (
                <div className="flex gap-3 ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-500/20 animate-pulse">
                    <Mic size={16} className="text-red-500" />
                  </div>
                  <div className="bg-red-500/10 text-muted-foreground p-3 rounded-lg rounded-tr-none max-w-[85%] border border-red-500/20">
                    <p className="text-sm">Recording...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <form onSubmit={handleInputSubmit} className="h-12 border-t border-border/30 p-2 flex items-center gap-2 bg-card/90">
            <input 
              className="flex-1 bg-muted/30 border-none text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" 
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isRecording || isProcessing}
            />
            <Button type="submit" size="sm" className="h-8 w-8 p-0 bg-primary/90 hover:bg-primary text-primary-foreground" title="Send message" disabled={isRecording || isProcessing}>
              <Send size={14} />
              <span className="sr-only">Send</span>
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant={isRecording ? "destructive" : "ghost"} 
              className={`h-8 w-8 p-0 ${isRecording ? 'animate-pulse' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} className="text-primary" />}
              <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
