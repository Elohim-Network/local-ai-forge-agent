
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Server } from "lucide-react";
import { ModelStatus } from "@/contexts/SystemStatusContext";
import { ComponentItem } from "../SystemComponentStatus";

interface SystemStatusItemProps<T extends ComponentItem<any>> {
  item: T;
  renderActions: (item: T) => React.ReactNode;
}

export function SystemStatusItem<T extends ComponentItem<any>>({ 
  item, 
  renderActions 
}: SystemStatusItemProps<T>) {
  // Function to get status badge for an item
  const getStatusBadge = () => {
    try {
      if (item.status === 'active' || item.status === 'available' || 
          item.status === 'downloading' || item.status === 'error') {
        return <ModelStatusBadge status={item.status as ModelStatus} />;
      } else if (item.isActive !== undefined) {
        return item.isActive ? (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">
            Active
          </Badge>
        ) : (
          <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10">
            Inactive
          </Badge>
        );
      } else {
        return <Badge>Unknown</Badge>;
      }
    } catch (error) {
      console.error("Error in getStatusBadge:", error);
      return <Badge>Unknown</Badge>;
    }
  };

  // Function to get status icon for an item
  const getStatusIcon = () => {
    try {
      if (item.status === 'active' || item.status === 'available' || 
          item.status === 'downloading' || item.status === 'error') {
        switch (item.status) {
          case "active":
            return <CheckCircle size={16} className="text-green-500" />;
          case "downloading":
            return <AlertCircle size={16} className="text-blue-500" />;
          case "available":
            return <CheckCircle size={16} className="text-gray-400" />;
          case "error":
            return <XCircle size={16} className="text-red-500" />;
          default:
            return <Server size={16} className="text-gray-400" />;
        }
      } else if (item.isActive !== undefined) {
        return item.isActive ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        );
      } else {
        return <AlertCircle size={16} className="text-yellow-500" />;
      }
    } catch (error) {
      console.error("Error in getStatusIcon:", error);
      return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-2 border-b pb-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{item.name}</span>
        </div>
        {getStatusBadge()}
      </div>

      {item.status === "downloading" && item.progress !== undefined && (
        <div className="space-y-1">
          <Progress value={item.progress} className="h-1" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.progress}% Complete</span>
            <span>{item.size}</span>
          </div>
        </div>
      )}

      {item.status === "active" && item.port && (
        <div className="text-xs text-green-500">
          Running on localhost:{item.port}
        </div>
      )}

      {item.error && (
        <div className="text-xs text-red-500">{item.error}</div>
      )}

      <div className="flex justify-end">
        {renderActions(item)}
      </div>
    </div>
  );
}

// Helper component for model status badges
export function ModelStatusBadge({ status }: { status: ModelStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">Active</Badge>;
    case "downloading":
      return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600/10">Downloading</Badge>;
    case "available":
      return <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/10">Available</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10">Error</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Not Installed</Badge>;
  }
}
