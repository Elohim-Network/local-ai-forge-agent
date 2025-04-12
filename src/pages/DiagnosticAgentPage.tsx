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
import { TestRunDialog } from "@/components/system/TestRunDialog";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
    
    console.log("Models:", models);
    console.log("Modules:", modules);
    
    const [activeTab, setActiveTab] = useState("status");
    const [autoScan, setAutoScan] = useState(false);
    const [scanInterval, setScanInterval] = useState(env.SCAN_INTERVAL_MINUTES);
    const [lastAutoScan, setLastAutoScan] = useState<Date | null>(null);
    const [useTestComponents, setUseTestComponents] = useState(false);
    const [isTestRunOpen, setIsTestRunOpen] = useState(false);
    const [chatIssuesDetected, setChatIssuesDetected] = useState(false);

    const modelIssues = models.filter(m => m.status !== "active").length;
    const moduleIssues = modules.filter(m => !m.isActive).length;
    const totalIssues = modelIssues + moduleIssues + (chatIssuesDetected ? 1 : 0);

    const systemStatus = totalIssues === 0 ? "operational" : totalIssues < 3 ? "warning" : "critical";

    useEffect(() => {
      runDiagnostic();
      detectChatIssues();
    }, []);

    useEffect(() => {
      let intervalId: number | undefined;
      
      if (autoScan && scanInterval > 0) {
        intervalId = window.setInterval(() => {
          runDiagnostic();
          detectChatIssues();
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

    const detectChatIssues = async () => {
      try {
        // Check for common chat issues
        const hasStorageIssues = !localStorage.getItem('chat-sessions');
        const hasConsoleErrors = document.querySelectorAll('.chat-error-indicator').length > 0;
        const lastChatError = localStorage.getItem('last-chat-error');
        
        // Set chat issues detected flag
        setChatIssuesDetected(hasStorageIssues || hasConsoleErrors || !!lastChatError);
        
        if (hasStorageIssues || hasConsoleErrors || lastChatError) {
          toast({
            title: "Chat Issues Detected",
            description: "Problems found with the chat feature. Click 'Fix Issues' to repair.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error detecting chat issues:", error);
      }
    };

    const fixChatIssues = () => {
      try {
        // Initialize empty chat sessions if missing
        if (!localStorage.getItem('chat-sessions')) {
          localStorage.setItem('chat-sessions', JSON.stringify([]));
        }
        
        // Navigate to chat page to force a refresh
        toast({
          title: "Chat Repair Complete",
          description: "Fixed chat storage issues. Please test the chat feature now.",
        });
        
        setChatIssuesDetected(false);
        navigate("/chat");
      } catch (error) {
        console.error("Error fixing chat issues:", error);
        toast({
          title: "Repair Failed",
          description: "Could not fix chat issues. Please try again.",
          variant: "destructive",
        });
      }
    };

    const runTestChat = () => {
      setIsTestRunOpen(true);
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
          runTestChat={runTestChat}
          chatIssuesDetected={chatIssuesDetected}
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
          chatIssuesDetected={chatIssuesDetected}
          fixChatIssues={fixChatIssues}
        />
        
        <TestRunDialog 
          open={isTestRunOpen} 
          onOpenChange={setIsTestRunOpen} 
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
