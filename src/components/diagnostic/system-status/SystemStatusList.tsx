
import React from "react";
import { SystemStatusItem } from "./SystemStatusItem";
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";

type ComponentItem = ModelInfo | ModuleStatus;

interface SystemStatusListProps<T extends ComponentItem> {
  items: T[];
  renderActions: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function SystemStatusList<T extends ComponentItem>({ 
  items, 
  renderActions,
  emptyMessage = "No items to display"
}: SystemStatusListProps<T>) {
  if (!items || !Array.isArray(items)) {
    console.error("SystemStatusList: items is not an array:", items);
    return (
      <div className="text-red-500">Error: Invalid items data provided</div>
    );
  }
  
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-muted-foreground text-sm">{emptyMessage}</div>
      ) : (
        items.map(item => (
          <SystemStatusItem 
            key={item.id} 
            item={item} 
            renderActions={renderActions}
          />
        ))
      )}
    </div>
  );
}
