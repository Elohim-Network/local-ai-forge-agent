
import React from "react";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CollapsibleIssues } from "./CollapsibleIssues";
import { SystemComponentStatus } from "./SystemComponentStatus";
import { TestComponentStatus } from "./TestComponentStatus";

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
  return (
    <div className="space-y-6">
      {useTestComponents ? (
        <TestComponentStatus />
      ) : (
        <SystemComponentStatus 
          models={models} 
          modules={modules} 
        />
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
              onClick={fixChatIssues}
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
