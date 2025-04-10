
import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSystemStatus } from "@/contexts/SystemStatusContext";
import { useToast } from "@/hooks/use-toast";
import { useEnv } from "@/lib/config/useEnv";
import { HeaderSection } from "@/components/diagnostic/HeaderSection";
import { TabsPanel } from "@/components/diagnostic/TabsPanel";
import { DebugToggle } from "@/components/diagnostic/DebugToggle";
import { getStatusColorClass } from "@/components/diagnostic/StatusIcons";

function DiagnosticAgentPage() {
  try {
    console.log("DiagnosticAgentPage rendering...");
    const { 
      models, 
      modules, 
      isChecking, 
      lastChecked, 
      checkSystem, 
      activateModel, 
      downloadModel, 
      restartModule, 
      fixAllIssues 
    } = useSystemStatus();
    const { toast } = useToast();
    const { env } = useEnv();
    
    console.log("Models:", models);
    console.log("Modules:", modules);
    
    const [activeTab, setActiveTab] = useState("status");
    const [autoScan, setAutoScan] = useState(false);
    const [scanInterval, setScanInterval] = useState(env.SCAN_INTERVAL_MINUTES);
    const [lastAutoScan, setLastAutoScan] = useState<Date | null>(null);
    const [useTestComponents, setUseTestComponents] = useState(false);

    const modelIssues = models.filter(m => m.status !== "active").length;
    const moduleIssues = modules.filter(m => !m.isActive).length;
    const totalIssues = modelIssues + moduleIssues;

    const systemStatus = totalIssues === 0 ? "operational" : totalIssues < 3 ? "warning" : "critical";

    useEffect(() => {
      runDiagnostic();
    }, []);

    useEffect(() => {
      let intervalId: number | undefined;
      
      if (autoScan && scanInterval > 0) {
        intervalId = window.setInterval(() => {
          runDiagnostic();
          setLastAutoScan(new Date());
          toast({
            title: "Auto-diagnostic completed",
            description: `Found ${totalIssues} issue${totalIssues !== 1 ? 's' : ''}`,
          });
        }, scanInterval * 60 * 1000);
      }
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [autoScan, scanInterval, totalIssues]);

    const runDiagnostic = async () => {
      try {
        await checkSystem();
      } catch (error) {
        console.error("Error running diagnostic:", error);
        toast({
          title: "Diagnostic Error",
          description: "Failed to run system diagnostic",
          variant: "destructive",
        });
      }
    };

    const formatLastChecked = () => {
      if (!lastChecked) return "Never";
      
      const minutes = Math.floor((new Date().getTime() - lastChecked.getTime()) / 60000);
      if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      
      return lastChecked.toLocaleTimeString();
    };

    return (
      <div className="container mx-auto max-w-7xl py-6 space-y-8">
        <HeaderSection 
          systemStatus={systemStatus}
          isChecking={isChecking}
          totalIssues={totalIssues}
          runDiagnostic={runDiagnostic}
          getStatusColorClass={getStatusColorClass}
        />

        <DebugToggle 
          useTestComponents={useTestComponents}
          setUseTestComponents={setUseTestComponents}
        />

        <TabsPanel 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          systemStatus={systemStatus}
          isChecking={isChecking}
          lastChecked={lastChecked}
          formatLastChecked={formatLastChecked}
          totalIssues={totalIssues}
          models={models}
          modules={modules}
          useTestComponents={useTestComponents}
          autoScan={autoScan}
          setAutoScan={setAutoScan}
          scanInterval={scanInterval}
          setScanInterval={setScanInterval}
          lastAutoScan={lastAutoScan}
          fixAllIssues={fixAllIssues}
          activateModel={activateModel}
          downloadModel={downloadModel}
          restartModule={restartModule}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in DiagnosticAgentPage:", error);
    return (
      <div className="container mx-auto max-w-7xl py-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Diagnostic Agent Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>An error occurred while rendering the diagnostic page:</p>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-red-500 text-sm overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function ErrorFallbackComponent({ error }: { error: Error }) {
  return (
    <div className="container mx-auto max-w-7xl py-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>
            An error occurred while rendering the diagnostic page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error?.message || "Unknown error"}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DiagnosticAgentPageWithErrorBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <DiagnosticAgentPage />
    </ErrorBoundary>
  );
}
