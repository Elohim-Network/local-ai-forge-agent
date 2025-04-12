
import { useState } from "react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { ModelSelector } from "@/components/workspace/ModelSelector";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { WorkspaceCodePanel } from "@/components/workspace/WorkspaceCodePanel";
import { WorkspacePreview } from "@/components/workspace/WorkspacePreview";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { testVoiceRecording } from "@/helpers/transcriptionTester";
import { toast } from "@/hooks/use-toast";

const WorkspacePage = () => {
  const [showPreview, setShowPreview] = useState(true);
  
  const handleTestVoice = () => {
    console.log("Testing voice recording functionality");
    toast({
      title: "Voice Test",
      description: "Testing microphone access and audio recording..."
    });
    testVoiceRecording();
  };
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-6 -mt-6">
      <WorkspaceHeader title="Customer Support Agent" type="AI Agent">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2" 
          onClick={handleTestVoice}
        >
          <Mic size={16} />
          Test Voice
        </Button>
      </WorkspaceHeader>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="p-6">
                <ModelSelector 
                  showPreview={showPreview} 
                  togglePreview={() => setShowPreview(!showPreview)} 
                />
                
                <WorkspaceCanvas />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30}>
              <WorkspaceCodePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {showPreview && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <WorkspacePreview />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WorkspacePage;
