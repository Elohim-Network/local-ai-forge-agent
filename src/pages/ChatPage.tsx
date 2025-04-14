import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Settings, 
  RotateCcw, 
  BrainCircuit, 
  ImageIcon, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Search,
  BookOpen,
  Clock,
  Trash,
  XCircle,
  Maximize2,
  Minimize2,
  PinOff,
  Pin,
  CalendarPlus,
  ArrowUpFromLine,
  Download,
  Mail,
  ChevronRight,
  Shield,
  Zap,
  Server
} from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatSettings } from "@/components/chat/ChatSettings";
import { toast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import { useChatMemory } from "@/hooks/useChatMemory";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMobileScreen } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sendToMistralStream } from "@/api/sendToMistral";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  type?: "text" | "image";
  imageUrl?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  added: Date;
}

const DEFAULT_SETTINGS: ChatSettings = {
  memory: {
    enabled: true,
    saveHistory: true,
  },
  voice: {
    enabled: false,
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah by default
    autoListen: false,
    volume: 0.8,
    continuousListening: false,
    silenceTimeout: 1500,
    minConfidence: 0.5,
    autoSendThreshold: 15, // Default character threshold for auto-sending
    useCustomVoice: false,
    customVoiceId: "",
    customVoiceName: "",
    autoReplyEnabled: true
  },
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);
    setCurrentStreamingMessage("");

    try {
      // Create temporary message for streaming
      const tempMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: tempMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      }]);

      await sendToMistralStream(inputValue, (token) => {
        setCurrentStreamingMessage(prev => prev + token);
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...msg, content: prev.find(m => m.id === tempMessageId)?.content + token } 
            : msg
        ));
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Mistral. Please ensure the local model is running.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setCurrentStreamingMessage("");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <ModelSelector onModelChange={() => {}} selectedModel="mistral" />
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? <Bot className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChatPage;
