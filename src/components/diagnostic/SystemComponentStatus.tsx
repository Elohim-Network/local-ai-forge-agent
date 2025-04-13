
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelStatus } from "@/contexts/SystemStatusContext";
import { StatusErrorBoundary } from "./system-status/StatusErrorBoundary";
import { SystemStatusList } from "./system-status/SystemStatusList";

// Create a unified type that combines different component types
export interface ComponentItemBase {
  id: string;
  name: string;
  error?: string;
  isActive?: boolean;
}

export type ComponentItem<TStatus = string | ModelStatus> = ComponentItemBase & {
  status?: TStatus;
  size?: string;
  version?: string;
  port?: number;
  progress?: number;
};

interface SystemComponentStatusProps<T extends ComponentItem<any>> {
  title: string;
  items: T[];
  renderActions: (item: T) => React.ReactNode;
}

export function SystemComponentStatus<T extends ComponentItem<any>>({ 
  title, 
  items, 
  renderActions 
}: SystemComponentStatusProps<T>) {
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
