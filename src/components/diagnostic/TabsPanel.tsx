
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { StatusIcon } from "./StatusIcons";
import { StatusOverview } from "./StatusOverview";
import { DiagnosticReport } from "./DiagnosticReport";
import { AutoDiagnosticSettings } from "./AutoDiagnosticSettings";

interface TabsPanelProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  systemStatus: "operational" | "warning" | "critical";
  isChecking: boolean;
  lastChecked: Date | null;
  formatLastChecked: () => string;
  totalIssues: number;
  models: ModelInfo[];
  modules: ModuleStatus[];
  useTestComponents: boolean;
  autoScan: boolean;
  setAutoScan: (value: boolean) => void;
  scanInterval: number;
  setScanInterval: (value: number) => void;
  lastAutoScan: Date | null;
  fixAllIssues: () => void;
  activateModel: (id: string) => void;
  downloadModel: (id: string) => void;
  restartModule: (id: string) => void;
}

export function TabsPanel({
  activeTab,
  setActiveTab,
  systemStatus,
  isChecking,
  lastChecked,
  formatLastChecked,
  totalIssues,
  models,
  modules,
  useTestComponents,
  autoScan,
  setAutoScan,
  scanInterval,
  setScanInterval,
  lastAutoScan,
  fixAllIssues,
  activateModel,
  downloadModel,
  restartModule
}: TabsPanelProps) {
  return (
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
          
          <TabsContent value="status">
            <StatusOverview 
              models={models}
              modules={modules}
              useTestComponents={useTestComponents}
              totalIssues={totalIssues}
              activateModel={activateModel}
              downloadModel={downloadModel}
              restartModule={restartModule}
            />
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
  );
}
