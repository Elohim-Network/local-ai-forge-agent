
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { StatusErrorBoundary } from "./system-status/StatusErrorBoundary";
import { SystemStatusList } from "./system-status/SystemStatusList";

// Make all properties optional by creating a partial type
interface ComponentItem {
  id: string;
  name: string;
  // ModelInfo properties
  status?: string;
  size?: string;
  version?: string;
  port?: number;
  progress?: number;
  error?: string;
  // ModuleStatus properties
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
