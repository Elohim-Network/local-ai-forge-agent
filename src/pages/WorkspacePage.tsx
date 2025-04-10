
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

const WorkspacePage = () => {
  const [showPreview, setShowPreview] = useState(true);
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-6 -mt-6">
      <WorkspaceHeader title="Customer Support Agent" type="AI Agent" />
      
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
