
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";

interface CollapsibleIssuesProps {
  totalIssues: number;
  models: ModelInfo[];
  modules: ModuleStatus[];
  activateModel: (id: string) => void;
  downloadModel: (id: string) => void;
  restartModule: (id: string) => void;
  chatIssuesDetected?: boolean;
  fixChatIssues?: () => void;
}

export function CollapsibleIssues({ 
  totalIssues, 
  models, 
  modules, 
  activateModel, 
  downloadModel, 
  restartModule,
  chatIssuesDetected,
  fixChatIssues
}: CollapsibleIssuesProps) {
  if (totalIssues === 0) return null;
  
  return (
    <Collapsible className="border rounded-lg p-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <span className="font-medium">System Issues ({totalIssues})</span>
        </div>
        <div className="text-sm text-muted-foreground">Click to view</div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        {models.filter(m => m.status !== "active").map(model => (
          <div key={model.id} className="flex justify-between items-center border-b pb-2">
            <div>
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-muted-foreground">
                {model.status === "downloading" ? 
                  `Downloading (${model.progress}%)` : 
                  model.status === "available" ? 
                  "Available but not active" :
                  model.status === "error" ?
                  "Error initializing model" :
                  "Not installed"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {model.status === "downloading" ? (
                <Progress value={model.progress} className="w-24 h-2" />
              ) : (
                model.status === "available" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activateModel(model.id)}
                  >
                    Activate
                  </Button>
                ) : model.status === "not-installed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadModel(model.id)}
                  >
                    Download
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200"
                  >
                    Retry
                  </Button>
                )
              )}
            </div>
          </div>
        ))}
        
        {modules.filter(m => !m.isActive).map(module => (
          <div key={module.id} className="flex justify-between items-center border-b pb-2">
            <div>
              <div className="font-medium">{module.name}</div>
              <div className="text-sm text-muted-foreground">
                {module.error || "Module is inactive"}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restartModule(module.id)}
            >
              Restart
            </Button>
          </div>
        ))}
        
        {chatIssuesDetected && fixChatIssues && (
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <div className="font-medium">Chat System</div>
              <div className="text-sm text-muted-foreground">
                Storage and rendering issues detected
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fixChatIssues}
              className="gap-1"
            >
              <MessageSquare size={12} />
              Fix Chat
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
