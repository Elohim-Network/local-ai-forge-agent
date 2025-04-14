
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  BarChart4, 
  Users,
  FileAudio,
  Brain
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ModuleScaffoldProps {
  isActive?: boolean;
  onActivate?: () => void;
}

export function ModuleScaffold({ isActive = false, onActivate }: ModuleScaffoldProps) {
  const [activeTab, setActiveTab] = React.useState("voice");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`Module tab changed to: ${value}`);
    toast({
      title: "Module Selected",
      description: `${value.charAt(0).toUpperCase() + value.slice(1)} module activated`,
    });
  };
  
  const handleActivate = () => {
    if (onActivate) {
      onActivate();
    }
    toast({
      title: "Module Activated",
      description: "Module system is now ready to use",
    });
  };
  
  return (
    <Card className="border-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Elohim Module System
          {!isActive && (
            <Button size="sm" onClick={handleActivate}>
              Activate
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Access specialized AI capabilities through these module interfaces
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isActive ? (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic size={16} />
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="ebook" className="flex items-center gap-2">
                <BookOpen size={16} />
                <span className="hidden sm:inline">eBook</span>
              </TabsTrigger>
              <TabsTrigger value="podcast" className="flex items-center gap-2">
                <FileAudio size={16} />
                <span className="hidden sm:inline">Podcast</span>
              </TabsTrigger>
              <TabsTrigger value="cloning" className="flex items-center gap-2">
                <Brain size={16} />
                <span className="hidden sm:inline">Voice AI</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="voice" className="p-4 bg-muted/30 rounded-md">
              <h3 className="text-lg font-medium mb-2">Voice Processing</h3>
              <p className="text-muted-foreground mb-4">
                Two-way voice communication and transcription services.
              </p>
              <Button className="gap-2">
                <Mic size={16} />
                Initialize Voice System
              </Button>
            </TabsContent>
            
            <TabsContent value="ebook" className="p-4 bg-muted/30 rounded-md">
              <h3 className="text-lg font-medium mb-2">eBook Generator</h3>
              <p className="text-muted-foreground mb-4">
                Create fully formatted eBooks from your content or prompts.
              </p>
              <Button className="gap-2">
                <BookOpen size={16} />
                Create New eBook
              </Button>
            </TabsContent>
            
            <TabsContent value="podcast" className="p-4 bg-muted/30 rounded-md">
              <h3 className="text-lg font-medium mb-2">Podcast Studio</h3>
              <p className="text-muted-foreground mb-4">
                Generate podcast episodes with AI voices and content.
              </p>
              <Button className="gap-2">
                <FileAudio size={16} />
                Create New Episode
              </Button>
            </TabsContent>
            
            <TabsContent value="cloning" className="p-4 bg-muted/30 rounded-md">
              <h3 className="text-lg font-medium mb-2">Voice Cloning</h3>
              <p className="text-muted-foreground mb-4">
                Clone voices or train custom voice models for your content.
              </p>
              <Button className="gap-2">
                <Brain size={16} />
                Train New Voice
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Module system is currently inactive. Activate to access specialized AI capabilities.
            </p>
            <Button onClick={handleActivate} className="mx-auto">
              Initialize Module System
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Elohim Module System v1.0</span>
          <Button variant="ghost" size="sm" className="gap-1 h-auto p-0">
            <Settings size={14} />
            Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
