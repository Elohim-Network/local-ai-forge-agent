import { useState, useRef, useEffect } from "react";
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
  XCircle
} from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ChatSettings, ChatSettings as ChatSettingsType } from "@/components/chat/ChatSettings";
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

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  type?: "text" | "image";
  imageUrl?: string;
}

const DEFAULT_SETTINGS: ChatSettingsType = {
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
    autoSendThreshold: 15 // Default character threshold for auto-sending
  },
};

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
  const [settings, setSettings] = useState<ChatSettingsType>(DEFAULT_SETTINGS);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileScreen();
  
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId,
    createSession, 
    updateSession, 
    searchQuery, 
    searchResults, 
    searchSessions,
    deleteSession,
    clearAllSessions
  } = useChatMemory({
    enabled: settings.memory.enabled,
    saveHistory: settings.memory.saveHistory
  });
  
  const { 
    isListening, 
    isRecording, 
    isSpeaking,
    transcript, 
    startRecording, 
    stopRecording,
    speak,
    stopSpeaking
  } = useVoice({
    enabled: settings.voice.enabled,
    autoListen: settings.voice.autoListen,
    onSpeechResult: (text) => {
      if (text.trim()) {
        setInput(text);
        // Modified logic to always send automatically after recognizing speech
        if (settings.voice.autoListen || settings.voice.continuousListening || 
            (settings.voice.autoSendThreshold && text.length >= settings.voice.autoSendThreshold)) {
          sendMessage(text);
        }
      }
    },
    volume: settings.voice.volume,
    continuousListening: settings.voice.continuousListening,
    onInterimResult: (text) => {
      if ((settings.voice.continuousListening || settings.voice.autoListen) && text.trim()) {
        setInput(text);
      }
    },
    silenceTimeout: settings.voice.silenceTimeout,
    minConfidence: settings.voice.minConfidence,
    autoSendThreshold: settings.voice.autoSendThreshold
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    if (!settings.voice.enabled && isSpeaking) {
      stopSpeaking();
    }
  }, [settings.voice.enabled]);
  
  useEffect(() => {
    if (settings.voice.enabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.type === "text") {
        // Delay the speech slightly for a more natural interaction
        setTimeout(() => {
          speak(lastMessage.content);
        }, 300);
      }
    }
  }, [messages, settings.voice.enabled]);
  
  useEffect(() => {
    if (settings.memory.enabled) {
      if (!currentSessionId && messages.length > 0) {
        createSession(messages);
      } else if (currentSessionId) {
        updateSession(currentSessionId, messages);
      }
    }
  }, [messages, settings.memory.enabled]);
  
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: "user",
      timestamp: new Date(),
      type: "text"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      const isImageRequest = /generate|create|draw|make|show\s+(an|a)?\s+(image|picture|photo|artwork|drawing)/i.test(messageText);
      
      if (isImageRequest && selectedModel === "stable-diffusion") {
        await generateImage(messageText);
      } else {
        await sendToLocalModel(messageText, selectedModel);
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
      console.error("Error connecting to model:", error);
      
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
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Generating image based on your request...",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
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
      
      const imageBase64 = data.images[0];
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      const imageMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: prompt,
        role: "assistant",
        timestamp: new Date(),
        type: "image",
        imageUrl: imageUrl
      };
      
      setMessages(prev => [...prev.filter(msg => msg.id !== processingMessage.id), imageMessage]);
    } catch (error) {
      console.error("Error generating image:", error);
      
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
    
    if (settings.memory.enabled) {
      createSession([{
        id: "welcome",
        content: "Chat cleared. How can I help you today?",
        role: "assistant",
        timestamp: new Date(),
        type: "text"
      }]);
    }
  };
  
  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setHistoryOpen(false);
    }
  };
  
  const handleSaveSettings = (newSettings: ChatSettingsType) => {
    setSettings(newSettings);
    
    console.log("Settings updated:", newSettings);
    
    if (!newSettings.memory.enabled && settings.memory.enabled) {
      setCurrentSessionId('');
    }
    
    localStorage.setItem('chat-settings', JSON.stringify(newSettings));
  };
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, []);
  
  const toggleVoiceChat = () => {
    setSettings({
      ...settings,
      voice: {
        ...settings.voice,
        enabled: !settings.voice.enabled
      }
    });
    
    if (!settings.voice.enabled) {
      toast({
        title: "Voice chat enabled",
        description: settings.voice.continuousListening 
          ? "Hands-free voice communication is active." 
          : settings.voice.autoSendThreshold > 0
            ? "Auto-reply is active: speech will be sent after " + settings.voice.autoSendThreshold + " characters"
            : "The AI will now read responses out loud."
      });
    } else {
      stopSpeaking();
    }
  };
  
  const renderHistoryList = () => (
    <div className="space-y-2 p-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Chat History</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearAllSessions}
          disabled={sessions.length === 0}
        >
          Clear All
        </Button>
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No chat history yet</p>
          <p className="text-sm">Your conversations will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`p-3 rounded-md hover:bg-muted cursor-pointer flex justify-between ${
                currentSessionId === session.id ? 'bg-muted' : ''
              }`}
              onClick={() => loadSession(session.id)}
            >
              <div>
                <div className="font-medium">{session.title}</div>
                <div className="text-xs text-muted-foreground">
                  {session.timestamp.toLocaleString()} • {session.messages.length} messages
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderSearchResults = () => {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      searchSessions(searchQuery);
    };
    
    return (
      <div className="space-y-4 p-1">
        <h3 className="font-medium text-lg mb-4">Search Chat History</h3>
        
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => searchSessions(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        <div className="mt-4">
          {searchResults.length === 0 && searchQuery && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No results found</p>
            </div>
          )}
          
          {searchResults.map(result => (
            <div key={result.sessionId} className="mb-4">
              <div 
                className="p-2 rounded-md bg-muted cursor-pointer"
                onClick={() => loadSession(result.sessionId)}
              >
                <div className="font-medium">
                  {sessions.find(s => s.id === result.sessionId)?.title || "Unnamed chat"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sessions.find(s => s.id === result.sessionId)?.timestamp.toLocaleString()}
                </div>
              </div>
              
              <div className="pl-2 mt-2 border-l-2 border-muted space-y-2">
                {result.messages.slice(0, 3).map(msg => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">{msg.role === 'user' ? 'You: ' : 'AI: '}</span>
                    {msg.content.length > 100 
                      ? msg.content.substring(0, 100) + "..." 
                      : msg.content}
                  </div>
                ))}
                {result.messages.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{result.messages.length - 3} more messages
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-10rem)]">
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
              
              <div className="space-y-2 mt-6">
                <h3 className="font-medium flex items-center gap-2">
                  <Settings size={16} />
                  <span>Options</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={settings.voice.enabled ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={toggleVoiceChat}
                  >
                    {settings.voice.enabled ? (
                      <Volume2 size={16} />
                    ) : (
                      <VolumeX size={16} />
                    )}
                    <span>Voice {settings.voice.enabled ? "On" : "Off"}</span>
                  </Button>
                  
                  {isMobile ? (
                    <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <Search size={16} />
                          <span>Search</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Search Chat History</DrawerTitle>
                          <DrawerDescription>
                            Find previous conversations
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4">
                          {renderSearchResults()}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <Search size={16} />
                          <span>Search</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="sm:max-w-md">
                        {renderSearchResults()}
                      </SheetContent>
                    </Sheet>
                  )}
                  
                  {isMobile ? (
                    <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <BookOpen size={16} />
                          <span>History</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Chat History</DrawerTitle>
                          <DrawerDescription>
                            Your previous conversations
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4">
                          {renderHistoryList()}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <BookOpen size={16} />
                          <span>History</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="sm:max-w-md">
                        {renderHistoryList()}
                      </SheetContent>
                    </Sheet>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={clearChat}
                  >
                    <RotateCcw size={16} />
                    <span>Clear Chat</span>
                  </Button>
                  
                  <ChatSettings 
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-md">
                  {settings.memory.enabled ? (
                    <p>Memory: <span className="font-medium">Enabled</span></p>
                  ) : (
                    <p>Memory: <span className="text-muted-foreground">Disabled</span></p>
                  )}
                  
                  {settings.voice.enabled ? (
                    <p>Voice: <span className="font-medium">Enabled</span></p>
                  ) : (
                    <p>Voice: <span className="text-muted-foreground">Disabled</span></p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1 flex flex-col h-full">
          <Card className="h-full">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="border-b p-3">
                <h2 className="font-medium flex items-center gap-2">
                  <Bot size={18} className="text-primary" />
                  Chat with {selectedModel === "mistral-7b" ? "Mistral-7B" : selectedModel === "llama-13b" ? "Llama-13B" : selectedModel === "stable-diffusion" ? "Stable Diffusion" : "GPT-3.5 Turbo"}
                  
                  {isListening && (
                    <span className="ml-auto text-xs text-primary animate-pulse flex items-center">
                      <Mic size={14} className="mr-1" /> 
                      {settings.voice.continuousListening ? "Hands-free mode active..." : "Listening..."}
                    </span>
                  )}
                  
                  {isSpeaking && (
                    <span className="ml-auto text-xs text-primary animate-pulse flex items-center">
                      <Volume2 size={14} className="mr-1" /> Speaking...
                    </span>
                  )}
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
                {isRecording && (
                  <div className="mb-2 px-3 py-2 bg-muted rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm">Recording: {transcript}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => stopRecording()}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {settings.voice.continuousListening && settings.voice.enabled && isListening && (
                  <div className="mb-2 px-3 py-2 bg-primary/10 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm">Hands-free mode: {transcript || "Listening..."}</span>
                    </div>
                  </div>
                )}
              
                <div className="flex gap-2">
                  <Input
                    placeholder={settings.voice.continuousListening && settings.voice.enabled ? "Speak or type your message..." : "Type your message..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing || isRecording}
                    className="flex-1"
                  />
                  
                  {settings.voice.enabled && (
                    <Button
                      variant={isRecording || (isListening && settings.voice.continuousListening) ? "default" : "outline"}
                      onClick={() => {
                        if (settings.voice.continuousListening) {
                          if (isListening) {
                            stopRecording();
                            setSettings({
                              ...settings,
                              voice: {
                                ...settings.voice,
                                autoListen: false,
                                continuousListening: false
                              }
                            });
                            toast({
                              title: "Hands-free mode disabled",
                              description: "Returning to manual voice input mode."
                            });
                          } else {
                            setSettings({
                              ...settings,
                              voice: {
                                ...settings.voice,
                                autoListen: true,
                                continuousListening: true
                              }
                            });
                            toast({
                              title: "Hands-free mode enabled",
                              description: "I'm listening continuously for your voice."
                            });
                          }
                        } else if (isRecording) {
                          stopRecording();
                        } else {
                          startRecording();
                          toast({
                            title: "Voice recording started",
                            description: "Speak clearly and I'll automatically reply when you finish.",
                          });
                        }
                      }}
                      disabled={isProcessing}
                      className="shrink-0"
                      title={settings.voice.continuousListening ? "Toggle hands-free mode" : (isRecording ? "Stop Recording" : "Start Recording")}
                    >
                      {isRecording || (isListening && settings.voice.continuousListening) ? <MicOff size={18} /> : <Mic size={18} />}
                      <span className="sr-only">
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </span>
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={isProcessing || isRecording || !input.trim()} 
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
                      disabled={isProcessing || isRecording}
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
