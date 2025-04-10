
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Server } from "lucide-react";
import { ModelInfo, ModuleStatus, ModelStatus } from "@/contexts/SystemStatusContext";

type ComponentItem = ModelInfo | ModuleStatus;

interface SystemComponentStatusProps<T extends ComponentItem> {
  title: string;
  items: T[];
  renderActions: (item: T) => React.ReactNode;
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SystemComponentStatus error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-300 bg-red-50 p-4 rounded-md">
          <h3 className="text-red-700 font-medium">Component Error</h3>
          <p className="text-sm text-red-600">
            {this.state.error?.message || "An unknown error occurred"}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
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
  
  // Type guard to determine if item is a ModelInfo
  const isModelInfo = (item: ComponentItem): item is ModelInfo => {
    return 'status' in item && typeof item.status === 'string';
  };

  // Function to get status badge for an item
  const getStatusBadge = (item: ComponentItem) => {
    try {
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
    } catch (error) {
      console.error("Error in getStatusBadge:", error);
      return <Badge>Unknown</Badge>;
    }
  };

  // Function to get status icon for an item
  const getStatusIcon = (item: ComponentItem) => {
    try {
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
    } catch (error) {
      console.error("Error in getStatusIcon:", error);
      return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  // Guard against items being undefined or not an array
  if (!items || !Array.isArray(items)) {
    console.error("SystemComponentStatus: items is not an array:", items);
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: Invalid items data provided</div>
        </CardContent>
      </Card>
    );
  }

  if (!mounted) {
    console.log("SystemComponentStatus not mounted yet, returning null");
    return null;
  }

  const renderItem = (item: T) => {
    try {
      return (
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
      );
    } catch (error) {
      console.error("Error rendering item:", item, error);
      return (
        <div key={item.id || 'error-item'} className="border border-red-200 p-2 rounded">
          <p className="text-red-500">Error rendering this item</p>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="text-muted-foreground text-sm">No items to display</div>
          ) : (
            items.map(item => renderItem(item))
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
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
