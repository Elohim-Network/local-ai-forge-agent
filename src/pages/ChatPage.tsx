
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Settings, RotateCcw, BrainCircuit, Image as ImageIcon } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  type?: "text" | "image";
  imageUrl?: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("mistral-7b");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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
      timestamp: new Date(),
      type: "text"
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // Check if the message is requesting an image
      const isImageRequest = /generate|create|draw|make|show\s+(an|a)?\s+(image|picture|photo|artwork|drawing)/i.test(input);
      
      if (isImageRequest && selectedModel === "stable-diffusion") {
        // Handle image generation
        await generateImage(input);
      } else {
        // Send message to local Mistral model
        await sendToLocalModel(input, selectedModel);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your model connection.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  const sendToLocalModel = async (message: string, model: string) => {
    let endpoint = "";
    let requestBody: any = {};
    
    // Configure endpoint and request body based on selected model
    if (model === "mistral-7b") {
      endpoint = "http://localhost:8000/v1/chat/completions";
      requestBody = {
        model: "mistral-7b-v0.2",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant powered by the Mistral-7B model."
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
    } else if (model === "llama-13b") {
      endpoint = "http://localhost:8000/v1/chat/completions";
      requestBody = {
        model: "llama-13b",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant powered by the Llama-13B model."
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
    }
    
    try {
      // Actually make the API call
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
      
      // Create a response message
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      // Add response to the chat
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error connecting to model:", error);
      
      // Add error response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I couldn't connect to the local model. Please check that your model server is running at http://localhost:8000",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const generateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    
    try {
      // Let the user know we're generating the image
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Generating image based on your request...",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // Connect to the Stable Diffusion API
      const response = await fetch("http://localhost:7860/sdapi/v1/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: "blurry, bad quality, distorted",
          steps: 20,
          width: 512,
          height: 512,
          cfg_scale: 7
        })
      });
      
      if (!response.ok) {
        throw new Error(`Image generation API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The API returns a base64 encoded image
      const imageBase64 = data.images[0];
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      // Create an image message
      const imageMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: prompt,
        role: "assistant",
        timestamp: new Date(),
        type: "image",
        imageUrl: imageUrl
      };
      
      // Add image to the chat
      setMessages(prev => [...prev.filter(msg => msg.id !== processingMessage.id), imageMessage]);
    } catch (error) {
      console.error("Error generating image:", error);
      
      // Add error response
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I couldn't generate the image. Please check that Stable Diffusion is running at http://localhost:7860",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev.filter(msg => msg.content.includes("Generating image")), errorMessage]);
    } finally {
      setIsGeneratingImage(false);
      setIsProcessing(false);
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
        timestamp: new Date(),
        type: "text"
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
                  Chat with {selectedModel === "mistral-7b" ? "Mistral-7B" : selectedModel === "llama-13b" ? "Llama-13B" : selectedModel === "stable-diffusion" ? "Stable Diffusion" : "GPT-3.5 Turbo"}
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
                  
                  {selectedModel === "stable-diffusion" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInput(prev => prev ? prev + " Generate an image of " : "Generate an image of ");
                      }}
                      className="shrink-0"
                      title="Generate image"
                    >
                      <ImageIcon size={18} />
                      <span className="sr-only">Generate image</span>
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Connected to local model at {selectedModel === "stable-diffusion" ? "localhost:7860" : "localhost:8000"}
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
