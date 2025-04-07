
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  Download, 
  ExternalLink, 
  Image, 
  Search, 
  Sliders 
} from "lucide-react";

const ModelsPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Models</h1>
        <Button variant="outline" className="gap-2">
          <Sliders size={16} />
          <span>Configure</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search models..." 
            className="pl-9 bg-muted/50 border-muted w-full" 
          />
        </div>
      </div>
      
      <Tabs defaultValue="installed" className="w-full">
        <TabsList className="bg-muted/50 w-full justify-start">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="text">Text Models</TabsTrigger>
          <TabsTrigger value="image">Image Models</TabsTrigger>
          <TabsTrigger value="audio">Audio Models</TabsTrigger>
        </TabsList>
        
        <TabsContent value="installed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModelCard 
              name="Mistral-7B-v0.2" 
              type="text"
              size="4.1 GB"
              status="active"
              description="High-quality language model for text generation and reasoning tasks"
              lastUsed="4 minutes ago"
              config={{ 
                endpoint: "http://localhost:8000", 
                maxTokens: 2048,
                temperature: 0.7,
                topP: 0.9
              }}
            />
            
            <ModelCard 
              name="Stable Diffusion XL" 
              type="image"
              size="6.8 GB"
              status="available"
              description="Text-to-image generation model for creating high-quality images"
              lastUsed="2 days ago"
              config={{ 
                endpoint: "http://localhost:8001", 
                width: 1024,
                height: 1024,
                cfgScale: 7.5
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModelCard 
              name="Phi-3"
              type="text"
              size="3.8 GB"
              status="downloading"
              progress={65}
              description="Microsoft's compact yet powerful language model with strong reasoning capabilities"
              lastUsed="Never"
              config={{}}
            />
            
            <ModelCard 
              name="CodeLlama-7B"
              type="text"
              size="4.3 GB"
              status="not-installed"
              description="Specialized language model for code completion and generation"
              lastUsed="Never"
              config={{}}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="text">
          {/* Text Models */}
        </TabsContent>
        
        <TabsContent value="image">
          {/* Image Models */}
        </TabsContent>
        
        <TabsContent value="audio">
          {/* Audio Models */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ModelCardProps {
  name: string;
  type: "text" | "image" | "audio";
  size: string;
  status: "active" | "downloading" | "available" | "not-installed";
  progress?: number;
  description: string;
  lastUsed: string;
  config: Record<string, any>;
}

function ModelCard({ name, type, size, status, progress = 0, description, lastUsed, config }: ModelCardProps) {
  const typeIcons = {
    text: BrainCircuit,
    image: Image,
    audio: BrainCircuit
  };
  
  const TypeIcon = typeIcons[type];
  
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md p-1.5 bg-muted">
              <TypeIcon size={16} className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">{name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{size}</span>
                <ModelStatusBadge status={status} />
              </div>
            </div>
          </div>
          <Button 
            variant={status === "not-installed" ? "default" : "outline"} 
            size="sm" 
            className="h-8 gap-1"
          >
            {status === "not-installed" && <Download size={14} />}
            {status === "not-installed" ? "Install" : 
             status === "active" ? "Configure" : 
             status === "available" ? "Activate" : ""}
          </Button>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "downloading" && (
          <div className="w-full bg-muted rounded-full h-2.5 mb-3">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
            <div className="text-xs text-muted-foreground mt-1">{progress}% Downloaded</div>
          </div>
        )}
        
        {(status === "active" || status === "available") && Object.keys(config).length > 0 && (
          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Configuration</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                <ExternalLink size={12} />
                <span>Edit</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}: </span>
                  <span>{value.toString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {status !== "not-installed" && `Last used: ${lastUsed}`}
      </CardFooter>
    </Card>
  );
}

function ModelStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">Active</Badge>;
    case "downloading":
      return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600/10">Downloading</Badge>;
    case "available":
      return <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/10">Available</Badge>;
    case "not-installed":
      return <Badge variant="outline" className="text-muted-foreground">Not Installed</Badge>;
    default:
      return null;
  }
}

export default ModelsPage;
