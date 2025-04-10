
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Settings, RotateCcw, BrainCircuit } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("mistral-7b");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Simulate sending the message to the AI model
      // In a real implementation, this would make an API call to your local model
      setTimeout(() => {
        // Create a response message
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: getModelResponse(input, selectedModel),
          role: "assistant",
          timestamp: new Date()
        };
        
        // Add response to the chat
        setMessages(prev => [...prev, responseMessage]);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Mock function to simulate responses from different models
  const getModelResponse = (message: string, model: string) => {
    // This would be replaced with actual API calls to your local models
    switch (model) {
      case "mistral-7b":
        return `Here's a response from Mistral-7B: I've processed your message about "${message}" and generated this response based on my training.`;
      case "llama-13b":
        return `Llama-13B response: I've analyzed your query "${message}" and here's what I can tell you...`;
      case "gpt-3.5":
        return `GPT-3.5 Turbo: Based on your message "${message}", I would suggest the following...`;
      default:
        return `I've received your message about "${message}" and generated this response.`;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Chat cleared. How can I help you today?",
        role: "assistant",
        timestamp: new Date()
      }
    ]);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-10rem)]">
        {/* Sidebar with model selection */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col gap-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <BrainCircuit size={16} />
                  <span>AI Models</span>
                </h3>
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onSelectModel={setSelectedModel} 
                />
              </div>
              
              <div className="mt-auto space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={clearChat}
                >
                  <RotateCcw size={16} />
                  <span>Clear Chat</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                >
                  <Settings size={16} />
                  <span>Chat Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="border-b p-3">
                <h2 className="font-medium flex items-center gap-2">
                  <Bot size={18} className="text-primary" />
                  Chat with {selectedModel === "mistral-7b" ? "Mistral-7B" : selectedModel === "llama-13b" ? "Llama-13B" : "GPT-3.5 Turbo"}
                </h2>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isProcessing || !input.trim()} 
                    className="shrink-0"
                  >
                    <Send size={18} />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Connected to local model at localhost:8000
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
