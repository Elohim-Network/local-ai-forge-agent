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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("mistral");

  const sendToLocalModel = async (message: string, model: string) => {
    let endpoint = "http://localhost:11434/v1/chat/completions";
    let requestBody: any = {
      model: "mistral",
      messages: [
        {
          role: "system",
          content: "You are Elohim, a helpful AI assistant with enhanced capabilities."
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 800
    };
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error connecting to Ollama model:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I couldn't connect to the local Ollama model at ${endpoint}. Please check that Ollama is running.`,
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Placeholder for ChatPage implementation */}
      <p>ChatPage is a work in progress</p>
    </div>
  );
};

export default ChatPage;
