
import { useState, useCallback, useRef, useEffect } from "react";
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
import { Mic, Volume2 } from "lucide-react";
import { testVoiceRecording } from "@/helpers/transcriptionTester";
import { toast } from "@/hooks/use-toast";

const WorkspacePage = () => {
  const [showPreview, setShowPreview] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  
  // Use refs to maintain stable references to functions
  const testVoiceRef = useRef<() => void>(() => {
    console.log("Testing voice recording functionality");
    setIsTesting(true);
    setTestResults(null);
    
    toast({
      title: "Voice Test",
      description: "Testing microphone access and audio recording..."
    });
    
    // Run the test and handle results
    testVoiceRecording()
      .then(result => {
        console.log("Voice test completed successfully:", result);
        setTestResults("Voice recording test successful!");
        toast({
          title: "Voice Test Complete",
          description: "Microphone and recording functionality working correctly."
        });
      })
      .catch(error => {
        console.error("Voice test failed:", error);
        setTestResults(`Test failed: ${error.message}`);
        toast({
          title: "Voice Test Failed",
          description: error.message,
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsTesting(false);
      });
  });
  
  // Make sure callbacks are stable across renders using useCallback
  const handleTestVoice = useCallback(() => {
    testVoiceRef.current();
  }, []);
  
  const togglePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-6 -mt-6">
      <WorkspaceHeader title="Customer Support Agent" type="AI Agent">
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${isTesting ? 'bg-primary/10 text-primary animate-pulse' : ''}`} 
          onClick={handleTestVoice}
          disabled={isTesting}
        >
          {isTesting ? <Volume2 size={16} /> : <Mic size={16} />}
          {isTesting ? "Testing..." : "Test Voice"}
        </Button>
      </WorkspaceHeader>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="p-6">
                <ModelSelector 
                  showPreview={showPreview} 
                  togglePreview={togglePreview} 
                />
                
                <WorkspaceCanvas />
                
                {testResults && (
                  <div className={`mt-4 p-4 rounded-md ${
                    testResults.includes('failed') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    {testResults}
                  </div>
                )}
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
