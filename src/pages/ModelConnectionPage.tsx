
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Image, Wand2, Cpu, ServerCog, Settings2, Play, Terminal, Database, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ModelConnectionPage = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [mistralEndpoint, setMistralEndpoint] = useState("http://localhost:8000");
  const [sdEndpoint, setSDEndpoint] = useState("http://localhost:7860");
  const [testingConnection, setTestingConnection] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    mistral: "",
    openai: "",
    stability: ""
  });
  
  const handleTestConnection = (type: string) => {
    setTestingConnection(true);
    
    // Simulate testing connection
    setTimeout(() => {
      setTestingConnection(false);
      
      // Simulate successful connection
      toast({
        title: "Connection Successful",
        description: `Successfully connected to local ${type === "text" ? "Mistral-7B" : "Stable Diffusion"} model.`,
      });
    }, 2000);
  };
  
  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "Your model connection settings have been saved.",
    });
  };
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI Model Connections</h1>
        <p className="text-muted-foreground">Configure local and cloud-based AI model connections</p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <BrainCircuit size={16} />
            Text Models
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image size={16} />
            Image Models
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings2 size={16} />
            Advanced Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mistral-7B</CardTitle>
                  <CardDescription>Configure your local Mistral-7B connection</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Local
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mistral-endpoint">API Endpoint</Label>
                <Input 
                  id="mistral-endpoint" 
                  placeholder="http://localhost:8000" 
                  value={mistralEndpoint}
                  onChange={(e) => setMistralEndpoint(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The endpoint where your local Mistral-7B model is running
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mistral-api-key">API Key (Optional)</Label>
                <Input 
                  id="mistral-api-key" 
                  type="password" 
                  placeholder="Enter API key if required" 
                  value={apiKeys.mistral}
                  onChange={(e) => setApiKeys({...apiKeys, mistral: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mistral-model">Model Version</Label>
                  <Select defaultValue="mistral-7b-v0.2">
                    <SelectTrigger id="mistral-model">
                      <SelectValue placeholder="Select model version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral-7b-v0.2">Mistral-7B-v0.2</SelectItem>
                      <SelectItem value="mistral-7b-v0.1">Mistral-7B-v0.1</SelectItem>
                      <SelectItem value="mistral-7b-instruct">Mistral-7B-Instruct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mistral-quantization">Quantization</Label>
                  <Select defaultValue="q4_k_m">
                    <SelectTrigger id="mistral-quantization">
                      <SelectValue placeholder="Select quantization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q4_k_m">Q4_K_M (4-bit)</SelectItem>
                      <SelectItem value="q5_k_m">Q5_K_M (5-bit)</SelectItem>
                      <SelectItem value="q8_0">Q8_0 (8-bit)</SelectItem>
                      <SelectItem value="f16">F16 (16-bit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mistral-autostart" className="cursor-pointer">
                    Auto-start on application launch
                  </Label>
                  <Switch id="mistral-autostart" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2" onClick={() => handleTestConnection("text")} disabled={testingConnection}>
                {testingConnection ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Connection
                  </>
                )}
              </Button>
              <Button onClick={handleSaveConfig}>Save Configuration</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>OpenAI Models</CardTitle>
                  <CardDescription>Configure OpenAI API for cloud models</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  Cloud
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <Input 
                  id="openai-api-key" 
                  type="password" 
                  placeholder="Enter your OpenAI API key" 
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openai-model">Default Model</Label>
                <Select defaultValue="gpt-3.5-turbo">
                  <SelectTrigger id="openai-model">
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-32k">GPT-4 (32k context)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-fallback" className="cursor-pointer">
                    Use as fallback when local models fail
                  </Label>
                  <Switch id="openai-fallback" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} className="ml-auto">Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Stable Diffusion</CardTitle>
                  <CardDescription>Configure your local Stable Diffusion model</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Local
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sd-endpoint">API Endpoint</Label>
                <Input 
                  id="sd-endpoint" 
                  placeholder="http://localhost:7860" 
                  value={sdEndpoint}
                  onChange={(e) => setSDEndpoint(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The endpoint where your local Stable Diffusion model is running
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sd-model">Model Version</Label>
                  <Select defaultValue="sdxl">
                    <SelectTrigger id="sd-model">
                      <SelectValue placeholder="Select model version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                      <SelectItem value="sd2.1">Stable Diffusion 2.1</SelectItem>
                      <SelectItem value="sd1.5">Stable Diffusion 1.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sd-precision">Precision</Label>
                  <Select defaultValue="fp16">
                    <SelectTrigger id="sd-precision">
                      <SelectValue placeholder="Select precision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fp16">FP16 (Half precision)</SelectItem>
                      <SelectItem value="fp32">FP32 (Full precision)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sd-autostart" className="cursor-pointer">
                    Auto-start on application launch
                  </Label>
                  <Switch id="sd-autostart" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2" onClick={() => handleTestConnection("image")} disabled={testingConnection}>
                {testingConnection ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Connection
                  </>
                )}
              </Button>
              <Button onClick={handleSaveConfig}>Save Configuration</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Stability AI</CardTitle>
                  <CardDescription>Configure Stability AI for cloud image generation</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  Cloud
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stability-api-key">Stability AI API Key</Label>
                <Input 
                  id="stability-api-key" 
                  type="password" 
                  placeholder="Enter your Stability AI API key" 
                  value={apiKeys.stability}
                  onChange={(e) => setApiKeys({...apiKeys, stability: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stability-model">Default Model</Label>
                <Select defaultValue="stable-diffusion-xl">
                  <SelectTrigger id="stability-model">
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable-diffusion-xl">Stable Diffusion XL</SelectItem>
                    <SelectItem value="stable-diffusion-512-v2-1">Stable Diffusion 2.1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stability-fallback" className="cursor-pointer">
                    Use as fallback when local models fail
                  </Label>
                  <Switch id="stability-fallback" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} className="ml-auto">Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Configure how system resources are allocated to AI models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>CPU Allocation</Label>
                  <span className="text-sm font-medium">8 cores</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: "66%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>RAM Allocation</Label>
                  <span className="text-sm font-medium">8 GB</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>GPU Memory</Label>
                  <span className="text-sm font-medium">6 GB</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 block">Hardware Acceleration</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cuda" className="cursor-pointer">
                      CUDA (NVIDIA)
                    </Label>
                    <Switch id="cuda" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rocm" className="cursor-pointer">
                      ROCm (AMD)
                    </Label>
                    <Switch id="rocm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mps" className="cursor-pointer">
                      MPS (Apple Silicon)
                    </Label>
                    <Switch id="mps" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Custom Configuration</CardTitle>
              <CardDescription>Advanced settings for model customization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-args">Custom Launch Arguments</Label>
                <Textarea 
                  id="custom-args" 
                  placeholder="--server.port 8000 --llama.context_size 4096" 
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Additional command-line arguments when launching model servers
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-env">Environment Variables</Label>
                <Textarea 
                  id="custom-env" 
                  placeholder="CUDA_VISIBLE_DEVICES=0,1&#10;THREADS=4" 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logging-level">Logging Level</Label>
                <Select defaultValue="info">
                  <SelectTrigger id="logging-level">
                    <SelectValue placeholder="Select logging level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} className="ml-auto">Save Configuration</Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Cache</CardTitle>
                <CardDescription>Manage downloaded model cache</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Size</span>
                    <span className="text-sm font-medium">15.3 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Location</span>
                    <span className="text-sm font-medium text-muted-foreground">/home/user/.cache/localforge</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Clear Cache</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Info</CardTitle>
                <CardDescription>Hardware information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Cpu size={14} />
                      CPU
                    </span>
                    <span className="text-sm font-medium">Intel i7-12700K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9h18v10H3z"></path>
                        <path d="M7 3v6"></path>
                        <path d="M17 3v6"></path>
                      </svg>
                      GPU
                    </span>
                    <span className="text-sm font-medium">NVIDIA RTX 3070</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Database size={14} />
                      RAM
                    </span>
                    <span className="text-sm font-medium">32 GB</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Terminal size={14} />
                  Hardware Diagnostic
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelConnectionPage;
