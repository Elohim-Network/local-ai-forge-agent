
import { Bot, User } from "lucide-react";
import { Message } from "@/pages/ChatPage";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timestamp = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  // Add logging to help debug message rendering
  console.log("Rendering message:", message);
  
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
        "rounded-lg p-3 max-w-[85%] backdrop-blur-sm transition-all duration-200",
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
        <div className={cn(
          "text-xs mt-1 opacity-70 text-right",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {timestamp}
        </div>
      </div>
    </div>
  );
}
