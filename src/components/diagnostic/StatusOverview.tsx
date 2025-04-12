
import React from "react";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CollapsibleIssues } from "./CollapsibleIssues";
import { SystemComponentStatus, ComponentItem } from "./SystemComponentStatus";
import { TestComponentStatus } from "./TestComponentStatus";
import { toast } from "@/hooks/use-toast";

interface StatusOverviewProps {
  models: ModelInfo[];
  modules: ModuleStatus[];
  useTestComponents: boolean;
  totalIssues: number;
  activateModel: (id: string) => void;
  downloadModel: (id: string) => void;
  restartModule: (id: string) => void;
  chatIssuesDetected?: boolean;
  fixChatIssues?: () => void;
}

export function StatusOverview({ 
  models, 
  modules, 
  useTestComponents,
  totalIssues,
  activateModel,
  downloadModel,
  restartModule,
  chatIssuesDetected,
  fixChatIssues
}: StatusOverviewProps) {
  // Transform ModelInfo and ModuleStatus to ComponentItem
  const modelItems: ComponentItem[] = models.map(model => ({
    ...model,
    isActive: model.status === 'active'
  }));

  const moduleItems: ComponentItem[] = modules.map(module => ({
    ...module,
    status: module.isActive ? 'active' : 'inactive'
  }));

  // Create handler wrappers with logging to debug button functionality issues
  const handleModelAction = (model: ComponentItem) => {
    console.log("Model action triggered for:", model.id);
    if (model.status !== 'active') {
      console.log("Activating model:", model.id);
      activateModel(model.id);
      toast({
        title: "Action triggered",
        description: `Activating model: ${model.name}`,
      });
    } else {
      console.log("Restarting active model:", model.id);
      // For active models, we'll implement a restart
      toast({
        title: "Action triggered",
        description: `Restarting model: ${model.name}`,
      });
    }
  };

  const handleModuleRestart = (moduleId: string) => {
    console.log("Module restart triggered for:", moduleId);
    restartModule(moduleId);
    toast({
      title: "Action triggered",
      description: "Module restart initiated",
    });
  };

  return (
    <div className="space-y-6">
      {useTestComponents ? (
        <TestComponentStatus title="Test Components Status" />
      ) : (
        <div className="space-y-4">
          <SystemComponentStatus 
            title="Models"
            items={modelItems}
            renderActions={(model) => (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleModelAction(model)}
              >
                {model.status === 'active' ? "Restart" : "Fix"}
              </Button>
            )}
          />
          <SystemComponentStatus 
            title="Modules"
            items={moduleItems}
            renderActions={(module) => (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleModuleRestart(module.id)}
              >
                Restart
              </Button>
            )}
          />
        </div>
      )}
      
      {chatIssuesDetected && fixChatIssues && (
        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-amber-500" size={18} />
              <div>
                <h3 className="font-medium">Chat System Issues Detected</h3>
                <p className="text-sm text-muted-foreground">
                  Problems found with the chat feature that need fixing
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-amber-200"
              onClick={() => {
                console.log("Fix chat issues triggered");
                if (fixChatIssues) {
                  fixChatIssues();
                  toast({
                    title: "Chat Fix Initiated",
                    description: "Attempting to resolve chat system issues",
                  });
                }
              }}
            >
              <MessageSquare size={14} />
              Fix Chat
            </Button>
          </div>
        </Card>
      )}
      
      <CollapsibleIssues
        totalIssues={totalIssues} 
        models={models} 
        modules={modules} 
        activateModel={activateModel}
        downloadModel={downloadModel}
        restartModule={restartModule}
        chatIssuesDetected={chatIssuesDetected}
        fixChatIssues={fixChatIssues}
      />
    </div>
  );
}
