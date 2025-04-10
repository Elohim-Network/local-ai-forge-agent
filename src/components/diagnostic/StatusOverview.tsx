
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { SystemComponentStatus } from "@/components/diagnostic/SystemComponentStatus";
import { TestComponentStatus } from "@/components/diagnostic/TestComponentStatus";
import { CollapsibleIssues } from "./CollapsibleIssues";

interface StatusOverviewProps {
  models: ModelInfo[];
  modules: ModuleStatus[];
  useTestComponents: boolean;
  totalIssues: number;
  activateModel: (id: string) => void;
  downloadModel: (id: string) => void;
  restartModule: (id: string) => void;
}

export function StatusOverview({ 
  models, 
  modules, 
  useTestComponents, 
  totalIssues,
  activateModel,
  downloadModel,
  restartModule
}: StatusOverviewProps) {
  // Define typed components to avoid JSX parsing issues with inline generics
  const ModelComponentStatus = SystemComponentStatus as React.ComponentType<{
    title: string;
    items: ModelInfo[];
    renderActions: (item: ModelInfo) => React.ReactNode;
  }>;

  const ModuleComponentStatus = SystemComponentStatus as React.ComponentType<{
    title: string;
    items: ModuleStatus[];
    renderActions: (item: ModuleStatus) => React.ReactNode;
  }>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ErrorBoundary FallbackComponent={ErrorFallback} key="models-component">
          {useTestComponents ? (
            <TestComponentStatus title="AI Models Test" />
          ) : (
            <ModelComponentStatus
              title="AI Models"
              items={models}
              renderActions={(model) => {
                if (model.status === "available") {
                  return (
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 text-xs px-3"
                      onClick={() => activateModel(model.id)}
                    >
                      Activate
                    </button>
                  );
                } else if (model.status === "not-installed") {
                  return (
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 text-xs px-3 gap-1"
                      onClick={() => downloadModel(model.id)}
                    >
                      Download
                    </button>
                  );
                } else if (model.status === "error") {
                  return (
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 text-xs px-3 gap-1"
                    >
                      Retry
                    </button>
                  );
                }
                return null;
              }}
            />
          )}
        </ErrorBoundary>
        
        <ErrorBoundary FallbackComponent={ErrorFallback} key="modules-component">
          {useTestComponents ? (
            <TestComponentStatus title="System Modules Test" />
          ) : (
            <ModuleComponentStatus
              title="System Modules"
              items={modules}
              renderActions={(module) => {
                if (!module.isActive) {
                  return (
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 text-xs px-3"
                      onClick={() => restartModule(module.id)}
                    >
                      Restart
                    </button>
                  );
                }
                return null;
              }}
            />
          )}
        </ErrorBoundary>
      </div>
      
      <CollapsibleIssues
        totalIssues={totalIssues}
        models={models}
        modules={modules}
        activateModel={activateModel}
        downloadModel={downloadModel}
        restartModule={restartModule}
      />
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="border border-red-300 bg-red-50 p-4 rounded-md">
      <h3 className="text-red-700 font-medium">Component Error</h3>
      <p className="text-sm text-red-600">
        {error?.message || "An unknown error occurred"}
      </p>
    </div>
  );
}
