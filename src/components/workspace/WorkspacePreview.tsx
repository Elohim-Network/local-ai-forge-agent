
import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bot, Send, Zap, Shield, Monitor, Smartphone, Tablet, Mic, MicOff, Volume, VolumeX } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { toast } from "@/hooks/use-toast";

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
  const [recordingAttempted, setRecordingAttempted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Set up voice features
  const { 
    isListening, 
    isRecording, 
    isSpeaking, 
    transcript, 
    isProcessing: isVoiceProcessing,
    startRecording, 
    stopRecording, 
    speak 
  } = useVoice({
    enabled: true,
    autoListen: false,
    useServerTranscription: true,
    transcriptionEndpoint: "/api/transcribe",
    onSpeechResult: (text) => {
      handleTranscription(text);
    },
    volume: 0.8,
    continuousListening: false
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting on load
  useEffect(() => {
    // Slight delay to ensure the voice is ready
    const timer = setTimeout(() => {
      console.log("Attempting to speak welcome message");
      speak("Welcome to Elohim. How may I assist you today?");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [speak]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTranscription = (text: string) => {
    if (text.trim()) {
      console.log("Received transcription:", text);
      addMessage("user", text);
      generateResponse(text);
    } else {
      console.warn("Received empty transcription");
      toast({
        title: "Empty Transcription",
        description: "No speech was detected. Please try speaking again.",
        variant: "destructive"
      });
    }
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
    
    // Simulate AI thinking time
    setTimeout(() => {
      // Generate a contextual response
      let response = "I'm analyzing your request...";
      
      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        response = "Hello! How can I assist you today?";
      } else if (userMessage.toLowerCase().includes("help")) {
        response = "I'd be happy to help. What specific assistance do you need?";
      } else if (userMessage.toLowerCase().includes("ebook") || userMessage.toLowerCase().includes("book")) {
        response = "I can help you generate an ebook. Would you like me to explain how the ebook generator works?";
      } else if (userMessage.toLowerCase().includes("podcast")) {
        response = "The podcast creator allows you to convert text to engaging audio content. Would you like me to show you how it works?";
      } else if (userMessage.toLowerCase().includes("voice")) {
        response = "Voice recognition is active. You can speak to me and I'll transcribe and respond to your requests.";
      } else if (userMessage.toLowerCase().includes("capabilities") || userMessage.toLowerCase().includes("features")) {
        response = "I can assist with text generation, voice interaction, ebook creation, podcast production, and various business automation tools.";
      } else {
        response = "I understand your request about \"" + userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "") + "\". How would you like me to assist with this?";
      }
      
      addMessage("assistant", response);
      speak(response); // Speak the response
      setIsProcessing(false);
    }, 1500);
  };

  const toggleRecording = () => {
    setRecordingAttempted(true);
    
    if (isRecording) {
      console.log("Stopping recording");
      stopRecording();
    } else {
      console.log("Starting recording");
      startRecording();
      
      // Set a safety timeout in case recording doesn't stop automatically
      setTimeout(() => {
        if (isRecording) {
          console.log("Safety timeout: forcing recording to stop");
          stopRecording();
        }
      }, 10000);
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
            <Shield className="w-4 h-4 text-primary mr-2" />
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
                    <div className={`text-xs mt-1 opacity-70 text-right ${
                      message.role === 'assistant' 
                        ? 'text-muted-foreground' 
                        : 'text-primary-foreground/70'
                    }`}>
                      {message.timestamp}
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
              
              {(isRecording || isVoiceProcessing) && (
                <div className="flex gap-3 ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-500/20 animate-pulse">
                    <Mic size={16} className="text-red-500" />
                  </div>
                  <div className="bg-red-500/10 text-muted-foreground p-3 rounded-lg rounded-tr-none max-w-[85%] border border-red-500/20">
                    <p className="text-sm">
                      {isVoiceProcessing ? "Processing..." : isRecording ? (transcript ? `Recording: ${transcript}` : "Recording...") : ""}
                    </p>
                  </div>
                </div>
              )}
              
              {recordingAttempted && !isRecording && !transcript && messages.length <= 1 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                  <p className="flex items-center gap-1.5">
                    <Mic size={16} className="text-amber-500" />
                    <span className="text-amber-600 font-medium">Microphone Tips:</span>
                  </p>
                  <ul className="mt-2 space-y-1 pl-5 list-disc text-muted-foreground">
                    <li>Check that your browser has microphone permissions</li>
                    <li>Speak clearly into your microphone</li>
                    <li>Try using Chrome or Edge for best compatibility</li>
                    <li>Click and hold the mic button while speaking</li>
                  </ul>
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
              disabled={isRecording}
            />
            <Button type="submit" size="sm" className="h-8 w-8 p-0 bg-primary/90 hover:bg-primary text-primary-foreground">
              <Send size={14} />
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant={isRecording ? "destructive" : "ghost"} 
              className={`h-8 w-8 p-0 ${isRecording ? 'animate-pulse' : ''}`}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} className="text-primary" />}
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => {
                const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
                if (lastAssistantMessage) {
                  speak(lastAssistantMessage.content);
                }
              }}
            >
              {isSpeaking ? <VolumeX size={14} className="text-primary" /> : <Volume size={14} className="text-primary" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
