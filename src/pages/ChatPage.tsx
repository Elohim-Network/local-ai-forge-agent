
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
  XCircle,
  Maximize2,
  Minimize2,
  PinOff,
  Pin,
  CalendarPlus,
  ArrowUpFromLine,
  Download,
  Mail
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
    autoSendThreshold: 15, // Default character threshold for auto-sending
    useCustomVoice: false,
    customVoiceId: "",
    customVoiceName: "",
    autoReplyEnabled: true
  },
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm Elohim, your AI assistant. How can I help you today?",
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
  const [reminderOpen, setReminderOpen] = useState(false);
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);
  const [isPopout, setIsPopout] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<{title: string, description: string, date: string}>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileScreen();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
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
        // Always send automatically after recognizing speech
        sendMessage(text);
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
    autoSendThreshold: settings.voice.autoSendThreshold,
    useCustomVoice: settings.voice.useCustomVoice,
    customVoiceName: settings.voice.customVoiceName,
    autoReplyEnabled: settings.voice.autoReplyEnabled
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

  // Handle popout window
  useEffect(() => {
    // Clean up popout window on unmount
    return () => {
      if (popoutWindow && !popoutWindow.closed) {
        popoutWindow.close();
      }
    };
  }, [popoutWindow]);

  const openPopoutWindow = () => {
    // Check if window is already open
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.focus();
      return;
    }

    // Create a new window
    const newWindow = window.open('', 'ElohimChat', 'width=400,height=600,resizable=yes');
    
    if (newWindow) {
      setPopoutWindow(newWindow);
      
      // Set HTML content for the popup window
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Elohim Chat</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 0;
              margin: 0;
              background-color: #f8f9fa;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              height: 100vh;
            }
            #chat-header {
              background-color: #0f172a;
              color: white;
              padding: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              user-select: none;
              cursor: move;
            }
            #chat-messages {
              flex: 1;
              overflow-y: auto;
              padding: 10px;
            }
            .message {
              margin-bottom: 10px;
              padding: 8px 12px;
              border-radius: 8px;
              max-width: 80%;
              word-wrap: break-word;
            }
            .user {
              background-color: #e2e8f0;
              margin-left: auto;
            }
            .assistant {
              background-color: #dbeafe;
            }
            #chat-input {
              display: flex;
              padding: 10px;
              background: white;
              border-top: 1px solid #e2e8f0;
            }
            #message-input {
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              margin-right: 8px;
            }
            #send-button {
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 8px 16px;
              cursor: pointer;
            }
            .controls {
              display: flex;
              gap: 8px;
            }
            .control-button {
              background: none;
              border: none;
              cursor: pointer;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
            }
            .always-on-top {
              color: #60a5fa;
            }
          </style>
        </head>
        <body>
          <div id="chat-header">
            <div>Elohim Chat</div>
            <div class="controls">
              <button id="pin-button" class="control-button">📌</button>
              <button id="minimize-button" class="control-button">_</button>
              <button id="close-button" class="control-button">✕</button>
            </div>
          </div>
          <div id="chat-messages"></div>
          <div id="chat-input">
            <input id="message-input" type="text" placeholder="Type your message...">
            <button id="send-button">Send</button>
          </div>
          <script>
            // Make the window draggable
            const header = document.getElementById('chat-header');
            let isDragging = false;
            let offsetX, offsetY;

            header.addEventListener('mousedown', (e) => {
              isDragging = true;
              offsetX = e.clientX;
              offsetY = e.clientY;
            });

            document.addEventListener('mousemove', (e) => {
              if (isDragging) {
                window.moveBy(e.clientX - offsetX, e.clientY - offsetY);
              }
            });

            document.addEventListener('mouseup', () => {
              isDragging = false;
            });

            // Handle controls
            document.getElementById('close-button').addEventListener('click', () => {
              window.close();
            });

            let isAlwaysOnTop = false;
            document.getElementById('pin-button').addEventListener('click', () => {
              // We can't set alwaysOnTop from JS directly, so we send a message to the parent
              window.opener.postMessage({ type: 'toggleAlwaysOnTop' }, '*');
              isAlwaysOnTop = !isAlwaysOnTop;
              document.getElementById('pin-button').classList.toggle('always-on-top', isAlwaysOnTop);
            });

            let isMinimized = false;
            document.getElementById('minimize-button').addEventListener('click', () => {
              window.opener.postMessage({ type: 'minimizeWindow' }, '*');
            });

            // Handle sending messages
            document.getElementById('send-button').addEventListener('click', sendMessage);
            document.getElementById('message-input').addEventListener('keypress', (e) => {
              if (e.key === 'Enter') sendMessage();
            });

            function sendMessage() {
              const input = document.getElementById('message-input');
              const message = input.value.trim();
              
              if (message) {
                // Send to parent window to process
                window.opener.postMessage({ type: 'sendMessage', message }, '*');
                input.value = '';
              }
            }

            // Receive messages from parent
            window.addEventListener('message', (event) => {
              if (event.data.type === 'newMessage') {
                const { role, content } = event.data;
                addMessage(role, content);
              } else if (event.data.type === 'updateAlwaysOnTop') {
                isAlwaysOnTop = event.data.value;
                document.getElementById('pin-button').classList.toggle('always-on-top', isAlwaysOnTop);
              }
            });

            function addMessage(role, content) {
              const messagesContainer = document.getElementById('chat-messages');
              const messageElement = document.createElement('div');
              messageElement.className = \`message \${role}\`;
              messageElement.textContent = content;
              messagesContainer.appendChild(messageElement);
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            // Initial load of messages
            window.opener.postMessage({ type: 'requestMessages' }, '*');
          </script>
        </body>
        </html>
      `);
      
      newWindow.document.close();
      setIsPopout(true);
      
      // Handle window close
      newWindow.onbeforeunload = () => {
        setPopoutWindow(null);
        setIsPopout(false);
      };
    }
  };

  // Handle messages from popout window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sendMessage') {
        sendMessage(event.data.message);
      } else if (event.data.type === 'toggleAlwaysOnTop') {
        toggleAlwaysOnTop();
      } else if (event.data.type === 'minimizeWindow') {
        toggleMinimized();
      } else if (event.data.type === 'requestMessages') {
        // Send existing messages to the popout window
        messages.forEach(msg => {
          popoutWindow?.postMessage({
            type: 'newMessage',
            role: msg.role,
            content: msg.content
          }, '*');
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [messages, popoutWindow]);

  // Update popout window with new messages
  useEffect(() => {
    if (popoutWindow && !popoutWindow.closed && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      popoutWindow.postMessage({
        type: 'newMessage',
        role: lastMessage.role,
        content: lastMessage.content
      }, '*');
    }
  }, [messages, popoutWindow]);

  const toggleAlwaysOnTop = () => {
    setAlwaysOnTop(!alwaysOnTop);
    
    // Send update to popout window
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.postMessage({
        type: 'updateAlwaysOnTop',
        value: !alwaysOnTop
      }, '*');
    }
    
    // Note: We can't actually make the window always-on-top from browser JS
    // This would require a desktop application or browser extension
    toast({
      title: !alwaysOnTop ? "Always on top enabled" : "Always on top disabled",
      description: !alwaysOnTop 
        ? "Chat window will stay on top of other windows (simulated)" 
        : "Chat window will behave normally"
    });
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    
    if (chatContainerRef.current) {
      if (!isMinimized) {
        // Minimize
        chatContainerRef.current.style.height = '60px';
        chatContainerRef.current.style.width = '200px';
        chatContainerRef.current.style.position = 'fixed';
        chatContainerRef.current.style.bottom = '20px';
        chatContainerRef.current.style.right = '20px';
        chatContainerRef.current.style.zIndex = '9999';
        chatContainerRef.current.style.overflow = 'hidden';
        chatContainerRef.current.style.transition = 'all 0.3s ease';
      } else {
        // Restore
        chatContainerRef.current.style.height = '';
        chatContainerRef.current.style.width = '';
        chatContainerRef.current.style.position = '';
        chatContainerRef.current.style.bottom = '';
        chatContainerRef.current.style.right = '';
        chatContainerRef.current.style.zIndex = '';
        chatContainerRef.current.style.overflow = '';
      }
    }
  };
  
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
      // Check for calendar/reminder requests
      const isReminderRequest = /remind|reminder|schedule|appointment|meeting|calendar|event/i.test(messageText.toLowerCase());
      
      if (isReminderRequest) {
        // Process reminder request
        processReminderRequest(messageText);
      } else {
        const isImageRequest = /generate|create|draw|make|show\s+(an|a)?\s+(image|picture|photo|artwork|drawing)/i.test(messageText);
        
        if (isImageRequest && selectedModel === "stable-diffusion") {
          await generateImage(messageText);
        } else {
          await sendToLocalModel(messageText, selectedModel);
        }
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

  const processReminderRequest = (message: string) => {
    // This is a simplified implementation - in a real app this would use NLP to extract details
    let title = "New reminder";
    let description = message;
    let date = new Date();
    
    // Add a day to the default date
    date.setDate(date.getDate() + 1);
    
    // Create a response message
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: `I've detected a reminder request. Would you like to create a reminder based on: "${message}"?`,
      role: "assistant",
      timestamp: new Date(),
      type: "text"
    };
    
    setMessages(prev => [...prev, responseMessage]);
    setIsProcessing(false);
    
    // Open the reminder dialog with extracted information
    setNewReminder({
      title,
      description,
      date: date.toISOString().split('T')[0]
    });
    
    // Open reminder dialog
    setTimeout(() => {
      setReminderOpen(true);
    }, 500);
  };
  
  const addReminder = () => {
    // Create a new reminder
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      date: new Date(newReminder.date),
      added: new Date()
    };
    
    setReminders(prev => [...prev, reminder]);
    
    // Save to localStorage
    const savedReminders = localStorage.getItem('chat-reminders');
    const existingReminders = savedReminders ? JSON.parse(savedReminders) : [];
    localStorage.setItem('chat-reminders', JSON.stringify([...existingReminders, reminder]));
    
    // Confirm to user
    const confirmationMessage: Message = {
      id: (Date.now() + 2).toString(),
      content: `✅ I've added a reminder: "${newReminder.title}" for ${new Date(newReminder.date).toLocaleDateString()}.`,
      role: "assistant",
      timestamp: new Date(),
      type: "text"
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Reset form and close dialog
    setNewReminder({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    
    setReminderOpen(false);
  };
  
  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('chat-reminders');
    if (savedReminders) {
      try {
        const parsedReminders = JSON.parse(savedReminders, (key, value) => {
          if (key === 'date' || key === 'added') return new Date(value);
          return value;
        });
        setReminders(parsedReminders);
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    }
  }, []);
  
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
    } else if (model === "llama-13b") {
      endpoint = "http://localhost:8000/v1/chat/completions";
      requestBody = {
        model: "llama-13b",
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

  const exportConversation = () => {
    // Format conversation as text
    const conversationText = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Elohim';
      const time = msg.timestamp.toLocaleTimeString();
      return `[${time}] ${role}: ${msg.content}`;
    }).join('\n\n');
    
    // Create a blob and download link
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elohim-Chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Conversation exported",
      description: "Your chat has been saved as a text file."
    });
  };

  const emailConversation = () => {
    // This is a simulated email function
    // In a real implementation, this would connect to an API or email service
    
    toast({
      title: "Email feature activated",
      description: "This would send the conversation to your configured email address."
    });
    
    // Simulate success after a delay
    setTimeout(() => {
      toast({
        title: "Email sent successfully",
        description: "Conversation has been emailed to the admin address."
      });
    }, 2000);
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
  
  // If minimized, show only a minimal interface
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-5 right-5 bg-primary text-white p-2 rounded-full shadow-lg cursor-pointer"
        onClick={toggleMinimized}
      >
        <Bot size={24} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6" ref={chatContainerRef}>
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
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                      >
                        <CalendarPlus size={16} />
                        <span>Reminders</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h3 className="font-medium">Your Reminders</h3>
                        {reminders.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No reminders yet</p>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto space-y-2">
                            {reminders.map(reminder => (
                              <div key={reminder.id} className="p-2 border rounded-md">
                                <div className="font-medium">{reminder.title}</div>
                                <div className="text-xs">{reminder.date.toLocaleDateString()}</div>
                                {reminder.description && (
                                  <div className="text-sm mt-1">{reminder.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
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
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={openPopoutWindow}
                    disabled={isPopout}
                  >
                    <Maximize2 size={16} />
                    <span>Pop Out</span>
                  </Button>
                  
                  <Button
                    variant={alwaysOnTop ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={toggleAlwaysOnTop}
                  >
                    {alwaysOnTop ? <Pin size={16} /> : <PinOff size={16} />}
                    <span>Pin Window</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={toggleMinimized}
                  >
                    <Minimize2 size={16} />
                    <span>Minimize</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={exportConversation}
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={emailConversation}
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </Button>
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
                  
                  {settings.voice.enabled && settings.voice.continuousListening && (
                    <p>Mode: <span className="font-medium">Hands-free</span></p>
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
                  Chat with Elohim
                  
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

      {/* Reminder Dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Add details for your reminder. This will be saved locally.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Details
              </label>
              <Input
                id="description"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addReminder}>Add Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
