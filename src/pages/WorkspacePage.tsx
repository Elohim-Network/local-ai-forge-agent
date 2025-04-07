
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Bot,
  Code,
  PlayCircle,
  Save,
  Settings,
  PanelRight,
  Cpu,
  Image as ImageIcon,
  Workflow
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const WorkspacePage = () => {
  const [showPreview, setShowPreview] = useState(true);
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-6 -mt-6">
      <div className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium">Customer Support Agent</h1>
          <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
            <Bot size={12} />
            AI Agent
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Save size={14} />
            Save
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings size={14} />
            Configure
          </Button>
          <Button size="sm" className="gap-2">
            <PlayCircle size={14} />
            Run
          </Button>
        </div>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                      <Bot size={18} className="text-primary" />
                    </div>
                    <Select defaultValue="mistral">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mistral">Mistral-7B-v0.2</SelectItem>
                        <SelectItem value="phi">Phi-3</SelectItem>
                        <SelectItem value="llama">CodeLlama-7B</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-600/10">
                      Active
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <PanelRight size={16} />
                  </Button>
                </div>
                
                {/* Workspace Visualization */}
                <div className="h-[calc(100%-3.5rem)] border border-border rounded-lg overflow-hidden glass-panel">
                  {/* Placeholder for workspace canvas */}
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-medium mb-2">Agent Workflow</h3>
                      <p className="text-muted-foreground text-sm">
                        Design your agent's workflow by adding components and connecting them.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mt-6">
                        {[
                          { name: "Input", icon: Bot },
                          { name: "Memory", icon: Cpu },
                          { name: "Process", icon: Workflow },
                          { name: "Output", icon: ImageIcon },
                          { name: "Code", icon: Code }
                        ].map(item => (
                          <Button 
                            key={item.name}
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                          >
                            <item.icon size={14} />
                            {item.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30}>
              <div className="p-4 h-full">
                <Tabs defaultValue="code" className="h-full flex flex-col">
                  <TabsList className="mb-4">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code" className="flex-1 overflow-auto">
                    <div className="bg-card rounded-md p-4 text-sm font-mono h-full overflow-auto">
                      <pre className="text-xs text-muted-foreground">
{`import { useEffect, useState } from "react";

// Customer Support Agent component
export default function CustomerSupportAgent() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Connect to local LLM endpoint
  const processMessage = async (message) => {
    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:8000/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-7b-v0.2",
          messages: [
            {
              role: "system",
              content: "You are a helpful customer support agent."
            },
            ...messages,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I'm having trouble connecting to the AI model.";
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: "user", content: userInput }
    ];
    setMessages(newMessages);
    setUserInput("");
    
    // Process with AI
    const response = await processMessage(userInput);
    setMessages([
      ...newMessages,
      { role: "assistant", content: response }
    ]);
  };

  return (
    // JSX for rendering the chat UI
  );
}`}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="settings">
                    <div className="space-y-4">
                      <div className="text-sm">Agent configuration settings will appear here.</div>
                    </div>
                  </TabsContent>
                  <TabsContent value="logs">
                    <div className="bg-card rounded-md p-4 h-full overflow-auto">
                      <div className="text-xs font-mono space-y-2 text-muted-foreground">
                        <div>[12:45:32] Initializing agent...</div>
                        <div>[12:45:33] Connecting to Mistral-7B on localhost:8000</div>
                        <div>[12:45:34] Connection established successfully</div>
                        <div>[12:45:35] Loading knowledge base from /data/support-kb.json</div>
                        <div>[12:45:36] Agent ready to process requests</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {showPreview && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <div className="h-full border-l border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Preview</h3>
                  <Select defaultValue="mobile">
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Preview mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-background rounded-lg border border-border h-[calc(100%-3rem)] p-4 flex items-center justify-center">
                  <div className="w-full max-w-sm h-[520px] bg-card rounded-lg overflow-hidden">
                    <div className="h-12 border-b border-border flex items-center px-4">
                      <span className="text-sm font-medium">Customer Support</span>
                    </div>
                    <div className="h-[calc(100%-6rem)] p-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-2 rounded-lg max-w-[80%] ml-auto">
                          <p className="text-sm">Hi, I'm having trouble canceling my subscription.</p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-lg max-w-[80%]">
                          <p className="text-sm">I'm sorry to hear that you're having issues. I'd be happy to help you cancel your subscription. Could you please tell me which plan you're currently subscribed to?</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-12 border-t border-border p-2 flex items-center gap-2">
                      <input 
                        className="flex-1 bg-muted/50 border-none text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" 
                        placeholder="Type your message..."
                      />
                      <Button size="sm" className="h-8 w-8 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WorkspacePage;
