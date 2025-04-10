
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Zap, AlertTriangle, Info, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSystemStatus, ModelStatus, ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { useToast } from "@/hooks/use-toast";
import { DiagnosticReport } from "@/components/diagnostic/DiagnosticReport";
import { SystemComponentStatus } from "@/components/diagnostic/SystemComponentStatus";
import { AutoDiagnosticSettings } from "@/components/diagnostic/AutoDiagnosticSettings";

const DiagnosticAgentPage = () => {
  const { models, modules, isChecking, lastChecked, checkSystem, activateModel, downloadModel, restartModule, fixAllIssues } = useSystemStatus();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("status");
  const [autoScan, setAutoScan] = useState(false);
  const [scanInterval, setScanInterval] = useState(60); // Minutes
  const [lastAutoScan, setLastAutoScan] = useState<Date | null>(null);

  // Count issues
  const modelIssues = models.filter(m => m.status !== "active").length;
  const moduleIssues = modules.filter(m => !m.isActive).length;
  const totalIssues = modelIssues + moduleIssues;

  // Status indicators
  const systemStatus = totalIssues === 0 ? "operational" : totalIssues < 3 ? "warning" : "critical";

  // Run system check on page load
  useEffect(() => {
    runDiagnostic();
  }, []);

  // Set up interval-based scanning if enabled
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

  // Run diagnostic function
  const runDiagnostic = async () => {
    await checkSystem();
  };

  // Format last checked time
  const formatLastChecked = () => {
    if (!lastChecked) return "Never";
    
    const minutes = Math.floor((new Date().getTime() - lastChecked.getTime()) / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    return lastChecked.toLocaleTimeString();
  };

  // Get status color class
  const getStatusColorClass = (status: "operational" | "warning" | "critical") => {
    switch (status) {
      case "operational": return "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10";
      case "warning": return "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-600/10";
      case "critical": return "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10";
      default: return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  // Get status icon
  const StatusIcon = ({ status }: { status: "operational" | "warning" | "critical" }) => {
    switch (status) {
      case "operational": return <CheckCircle className="text-green-500" size={24} />;
      case "warning": return <AlertTriangle className="text-amber-500" size={24} />;
      case "critical": return <XCircle className="text-red-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnostic Agent</h1>
          <p className="text-muted-foreground">Monitor and troubleshoot your LocalForge environment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColorClass(systemStatus)}>
            {systemStatus === "operational" ? "All Systems Operational" : 
             systemStatus === "warning" ? "Minor Issues Detected" : 
             "Critical Issues Detected"}
          </Badge>
          <Button 
            onClick={runDiagnostic} 
            className="gap-2" 
            disabled={isChecking}
          >
            <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
            {isChecking ? "Running Diagnostics..." : "Run Diagnostic"}
          </Button>
        </div>
      </div>

      <Card className="border-muted/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon status={systemStatus} />
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Last checked: {isChecking ? "Checking now..." : formatLastChecked()}
                </CardDescription>
              </div>
            </div>
            {totalIssues > 0 && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={fixAllIssues}
              >
                <Zap size={16} />
                Fix All Issues
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="status">Status Overview</TabsTrigger>
              <TabsTrigger value="report">Diagnostic Report</TabsTrigger>
              <TabsTrigger value="settings">Auto-Diagnostic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <SystemComponentStatus<ModelInfo>
                  title="AI Models"
                  items={models}
                  renderActions={(model) => {
                    if (model.status === "available") {
                      return (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => activateModel(model.id)}
                        >
                          Activate
                        </Button>
                      );
                    } else if (model.status === "not-installed") {
                      return (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => downloadModel(model.id)}
                        >
                          Download
                        </Button>
                      );
                    } else if (model.status === "error") {
                      return (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="gap-1"
                        >
                          <RefreshCw size={12} />
                          <span>Retry</span>
                        </Button>
                      );
                    }
                    return null;
                  }}
                />
                
                <SystemComponentStatus<ModuleStatus>
                  title="System Modules"
                  items={modules}
                  renderActions={(module) => {
                    if (!module.isActive) {
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restartModule(module.id)}
                        >
                          Restart
                        </Button>
                      );
                    }
                    return null;
                  }}
                />
              </div>
              
              {totalIssues > 0 && (
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
                  </CollapsibleContent>
                </Collapsible>
              )}
            </TabsContent>
            
            <TabsContent value="report">
              <DiagnosticReport
                models={models}
                modules={modules}
                systemStatus={systemStatus}
                lastChecked={lastChecked}
              />
            </TabsContent>
            
            <TabsContent value="settings">
              <AutoDiagnosticSettings
                autoScan={autoScan}
                setAutoScan={setAutoScan}
                scanInterval={scanInterval}
                setScanInterval={setScanInterval}
                lastAutoScan={lastAutoScan}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticAgentPage;
