
import { Bot, User, Volume2 } from "lucide-react";
import { Message } from "@/pages/ChatPage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timestamp = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Add logging to help debug message rendering
  console.log("Rendering message:", message);
  
  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(message.content);
      
      // Try to get a better voice if available
      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices.length);
      
      const preferredVoices = voices.filter(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium')
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
        console.log("Using preferred voice:", preferredVoices[0].name);
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser");
    }
  };
  
  return (
    <div className={cn(
      "flex gap-3 group transition-all duration-300 transform hover:translate-y-[-2px]",
      isUser ? "flex-row-reverse" : ""
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md",
        isUser 
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10" 
          : "bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20"
      )}>
        {isUser ? (
          <div className="w-4 h-4 rounded-full bg-primary/80"></div>
        ) : (
          <Bot size={16} className="text-primary" />
        )}
      </div>
      
      <div className={cn(
        "rounded-lg p-3 max-w-[85%] backdrop-blur-sm transition-all duration-200 relative",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-none border border-primary/10 shadow-[0_0_15px_rgba(0,179,255,0.15)]" 
          : "bg-gradient-to-br from-muted/70 to-muted/50 rounded-tl-none border border-primary/10 shadow-md"
      )}>
        {message.type === "image" && message.imageUrl && (
          <div className="mb-2 rounded-md overflow-hidden border border-primary/10">
            <img 
              src={message.imageUrl} 
              alt={message.content}
              className="rounded-md max-w-full max-h-[300px] object-contain"
            />
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="flex justify-between items-center mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "p-0 h-6 w-6",
              isUser ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              isSpeaking ? "animate-pulse" : ""
            )}
            onClick={speakMessage}
            disabled={isSpeaking}
            title="Listen to message"
          >
            <Volume2 size={14} className={isSpeaking ? "animate-pulse" : ""} />
            <span className="sr-only">Listen</span>
          </Button>
          <div className={cn(
            "text-xs opacity-70",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
