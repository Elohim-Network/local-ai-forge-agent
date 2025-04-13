
import React from "react";
import { SystemStatusItem } from "./SystemStatusItem";
import { ComponentItem } from "../SystemComponentStatus";

interface SystemStatusListProps {
  items: ComponentItem[];
  renderActions: (item: ComponentItem) => React.ReactNode;
  emptyMessage?: string;
}

export function SystemStatusList({ 
  items, 
  renderActions,
  emptyMessage = "No items to display"
}: SystemStatusListProps) {
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
