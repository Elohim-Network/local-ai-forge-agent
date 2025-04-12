
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelInfo, ModuleStatus, ModelStatus } from "@/contexts/SystemStatusContext";
import { StatusErrorBoundary } from "./system-status/StatusErrorBoundary";
import { SystemStatusList } from "./system-status/SystemStatusList";

// Create a unified type that combines ModelInfo and ModuleStatus
export interface ComponentItem {
  id: string;
  name: string;
  status?: ModelStatus | string;
  size?: string;
  version?: string;
  port?: number;
  progress?: number;
  error?: string;
  isActive?: boolean;
}

interface SystemComponentStatusProps {
  title: string;
  items: ComponentItem[];
  renderActions: (item: ComponentItem) => React.ReactNode;
}

export function SystemComponentStatus({ 
  title, 
  items, 
  renderActions 
}: SystemComponentStatusProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("SystemComponentStatus mounted with:", { title, items });
    setMounted(true);
    return () => {
      console.log("SystemComponentStatus unmounting");
    };
  }, [title, items]);

  if (!mounted) {
    return null;
  }

  return (
    <StatusErrorBoundary>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SystemStatusList 
            items={items} 
            renderActions={renderActions} 
          />
        </CardContent>
      </Card>
    </StatusErrorBoundary>
  );
}
