
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { StatusErrorBoundary } from "./system-status/StatusErrorBoundary";
import { SystemStatusList } from "./system-status/SystemStatusList";

type ComponentItem = ModelInfo | ModuleStatus;

interface SystemComponentStatusProps<T extends ComponentItem> {
  title: string;
  items: T[];
  renderActions: (item: T) => React.ReactNode;
}

export function SystemComponentStatus<T extends ComponentItem>({ 
  title, 
  items, 
  renderActions 
}: SystemComponentStatusProps<T>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("SystemComponentStatus mounted with:", { title, items, renderActions });
    setMounted(true);
    return () => {
      console.log("SystemComponentStatus unmounting");
    };
  }, [title, items]);

  console.log("SystemComponentStatus rendering with items:", items);
  
  if (!mounted) {
    console.log("SystemComponentStatus not mounted yet, returning null");
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
