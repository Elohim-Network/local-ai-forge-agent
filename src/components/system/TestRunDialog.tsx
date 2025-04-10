import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, CheckCircle, Download, RefreshCw, Server, XCircle } from "lucide-react";
import { useSystemStatus, ModelStatus } from "@/contexts/SystemStatusContext";

interface TestRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestRunDialog({ open, onOpenChange }: TestRunDialogProps) {
  const { models, modules, isChecking, lastChecked, checkSystem, activateModel, downloadModel, restartModule, fixAllIssues } = useSystemStatus();
  const [activeTab, setActiveTab] = useState("system");
  const [isOpenErrors, setIsOpenErrors] = useState(true);
  
  // Count issues
  const modelIssues = models.filter(m => m.status !== "active").length;
  const moduleIssues = modules.filter(m => !m.isActive).length;
  const totalIssues = modelIssues + moduleIssues;
  
  // Format last checked time
  const formatLastChecked = () => {
    if (!lastChecked) return "Never";
    
    // If within the last hour, show "X minutes ago"
    const minutes = Math.floor((new Date().getTime() - lastChecked.getTime()) / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show the time
    return lastChecked.toLocaleTimeString();
  };

  // Get status color for model
  const getModelStatusColor = (status: ModelStatus) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10";
      case "downloading": return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600/10";
      case "available": return "bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/10";
      case "error": return "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10";
      default: return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  // Model action button
  const ModelActionButton = ({ model }: { model: typeof models[0] }) => {
    switch (model.status) {
      case "active":
        return (
          <Button variant="outline" size="sm" className="h-7 gap-1">
            <RefreshCw size={12} />
            <span>Restart</span>
          </Button>
        );
      case "available":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7"
            onClick={() => activateModel(model.id)}
          >
            Activate
          </Button>
        );
      case "not-installed":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1"
            onClick={() => downloadModel(model.id)}
          >
            <Download size={12} />
            <span>Download</span>
          </Button>
        );
      case "error":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1 border-red-200 hover:bg-red-50"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Test Run Diagnostics</span>
            {isChecking ? (
              <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600/10">
                Checking...
              </Badge>
            ) : totalIssues > 0 ? (
              <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-600/10">
                {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found
              </Badge>
            ) : (
              <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">
                All systems operational
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Last checked: {isChecking ? "Checking now..." : formatLastChecked()}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="system">System Status</TabsTrigger>
              <TabsTrigger value="agent">Agent Validation</TabsTrigger>
              <TabsTrigger value="workflow">Workflow Check</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Models</h4>
                  <div className="space-y-3">
                    {models.map(model => (
                      <div key={model.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Server size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.size}</span>
                          </div>
                          <Badge className={getModelStatusColor(model.status)}>
                            {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {model.status === "downloading" && (
                          <div className="space-y-1">
                            <Progress value={model.progress} className="h-1" />
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{model.progress}% Downloaded</span>
                              {model.port && <span>Port: {model.port}</span>}
                            </div>
                          </div>
                        )}
                        
                        {model.status === "active" && model.port && (
                          <div className="text-xs text-green-500">
                            Running on localhost:{model.port}
                          </div>
                        )}
                        
                        {model.status !== "downloading" && (
                          <div className="flex justify-end">
                            <ModelActionButton model={model} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Modules</h4>
                  <div className="space-y-2">
                    {modules.map(module => (
                      <div key={module.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {module.isActive ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )}
                          <span className="text-sm">{module.name}</span>
                        </div>
                        
                        {!module.isActive && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => restartModule(module.id)}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {totalIssues > 0 && (
                <Collapsible open={isOpenErrors} onOpenChange={setIsOpenErrors}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        <span>System Issues ({totalIssues})</span>
                      </div>
                      <span className="text-xs">{isOpenErrors ? "Hide" : "Show"}</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2 rounded-md border p-4">
                    {models.filter(m => m.status !== "active").map(model => (
                      <div key={model.id} className="text-sm flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}:</span>
                          <span className="text-muted-foreground">
                            {model.status === "available" ? "Available but not active" : 
                             model.status === "downloading" ? `Downloading (${model.progress}%)` : 
                             model.status === "error" ? "Error connecting to model" :
                             "Not installed"}
                          </span>
                        </div>
                        <ModelActionButton model={model} />
                      </div>
                    ))}
                    
                    {modules.filter(m => !m.isActive).map(module => (
                      <div key={module.id} className="text-sm flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.name}:</span>
                          <span className="text-muted-foreground">
                            {module.error || "Inactive"}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
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
            
            <TabsContent value="agent">
              <div className="rounded-lg border p-4 text-center py-8">
                <div className="text-amber-500 flex justify-center mb-2">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-medium">Agent Validation</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  No active agent workflow found. Please select or create an agent to validate.
                </p>
                <Button variant="outline" size="sm">
                  Select Agent
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="workflow">
              <div className="rounded-lg border p-4 text-center py-8">
                <div className="text-amber-500 flex justify-center mb-2">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-medium">Workflow Check</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  No active workflow found. Please select or create a workflow to validate.
                </p>
                <Button variant="outline" size="sm">
                  Select Workflow
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => checkSystem()}
            disabled={isChecking}
          >
            <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
            <span className="ml-2">{isChecking ? "Checking..." : "Check Again"}</span>
          </Button>
          {totalIssues > 0 && (
            <Button onClick={() => fixAllIssues()} disabled={isChecking}>
              Fix All Issues
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
