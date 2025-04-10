
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
  
  return (
    <div className={cn(
      "flex gap-3 group",
      isUser ? "flex-row-reverse" : ""
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-primary/10" : "bg-primary/20"
      )}>
        {isUser ? <User size={16} className="text-primary" /> : <Bot size={16} className="text-primary" />}
      </div>
      
      <div className={cn(
        "rounded-lg p-3 max-w-[85%]",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted rounded-tl-none"
      )}>
        {message.type === "image" && message.imageUrl && (
          <div className="mb-2">
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
