
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Server } from "lucide-react";
import { ModelInfo, ModuleStatus, ModelStatus } from "@/contexts/SystemStatusContext";

type ComponentItem = ModelInfo | ModuleStatus;

interface SystemComponentStatusProps {
  title: string;
  items: ComponentItem[];
  renderActions: (item: ComponentItem) => React.ReactNode;
}

export function SystemComponentStatus({ title, items, renderActions }: SystemComponentStatusProps) {
  // Type guard to determine if item is a ModelInfo
  const isModelInfo = (item: ComponentItem): item is ModelInfo => {
    return 'status' in item && typeof item.status === 'string';
  };

  // Function to get status badge for an item
  const getStatusBadge = (item: ComponentItem) => {
    if (isModelInfo(item)) {
      return <ModelStatusBadge status={item.status} />;
    } else {
      return item.isActive ? (
        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">
          Active
        </Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600/10">
          Inactive
        </Badge>
      );
    }
  };

  // Function to get status icon for an item
  const getStatusIcon = (item: ComponentItem) => {
    if (isModelInfo(item)) {
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
    } else {
      return item.isActive ? (
        <CheckCircle size={16} className="text-green-500" />
      ) : (
        <XCircle size={16} className="text-red-500" />
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col gap-2 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(item)}
                <span className="font-medium">{item.name}</span>
              </div>
              {getStatusBadge(item)}
            </div>

            {isModelInfo(item) && item.status === "downloading" && item.progress !== undefined && (
              <div className="space-y-1">
                <Progress value={item.progress} className="h-1" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.progress}% Complete</span>
                  <span>{item.size}</span>
                </div>
              </div>
            )}

            {isModelInfo(item) && item.status === "active" && item.port && (
              <div className="text-xs text-green-500">
                Running on localhost:{item.port}
              </div>
            )}

            {!isModelInfo(item) && item.error && (
              <div className="text-xs text-red-500">{item.error}</div>
            )}

            <div className="flex justify-end">
              {renderActions(item)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Helper component for model status badges
function ModelStatusBadge({ status }: { status: ModelStatus }) {
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
