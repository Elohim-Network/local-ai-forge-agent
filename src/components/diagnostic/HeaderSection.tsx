
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { useEnv } from "@/lib/config/useEnv";

interface HeaderSectionProps {
  systemStatus: "operational" | "warning" | "critical";
  isChecking: boolean;
  totalIssues: number;
  runDiagnostic: () => void;
  getStatusColorClass: (status: "operational" | "warning" | "critical") => string;
}

export function HeaderSection({ 
  systemStatus, 
  isChecking, 
  totalIssues, 
  runDiagnostic, 
  getStatusColorClass 
}: HeaderSectionProps) {
  const { env } = useEnv();
  
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {env.REBRAND_MODE ? `${env.SYSTEM_NAME} Diagnostics` : 'Diagnostic Agent'}
        </h1>
        <p className="text-muted-foreground">
          Monitor and troubleshoot your {env.REBRAND_MODE ? env.SYSTEM_NAME : 'LocalForge'} environment
        </p>
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
  );
}
