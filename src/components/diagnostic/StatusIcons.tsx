
import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface StatusIconProps {
  status: "operational" | "warning" | "critical";
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "operational": return <CheckCircle className="text-green-500" size={24} />;
    case "warning": return <AlertTriangle className="text-amber-500" size={24} />;
    case "critical": return <XCircle className="text-red-500" size={24} />;
    default: return <Info className="text-blue-500" size={24} />;
  }
}

export function getStatusColorClass(status: "operational" | "warning" | "critical") {
  switch (status) {
    case "operational": return "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10";
    case "warning": return "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-600/10";
    case "critical": return "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10";
    default: return "bg-muted text-muted-foreground hover:bg-muted/80";
  }
}
