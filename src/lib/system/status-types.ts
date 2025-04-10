
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";

// Type guard to determine if item is a ModelInfo
export const isModelInfo = (item: ModelInfo | ModuleStatus): item is ModelInfo => {
  return 'status' in item && typeof item.status === 'string';
};

// Get color class based on system status
export const getSystemStatusClass = (status: "operational" | "warning" | "critical") => {
  switch (status) {
    case "operational": 
      return "text-green-500";
    case "warning": 
      return "text-amber-500";
    case "critical": 
      return "text-red-500";
    default: 
      return "text-muted-foreground";
  }
};

// Get component status display info
export const getComponentStatusInfo = (item: ModelInfo | ModuleStatus) => {
  if (isModelInfo(item)) {
    const model = item as ModelInfo;
    return {
      isActive: model.status === "active",
      statusText: model.status.charAt(0).toUpperCase() + model.status.slice(1),
      hasError: model.status === "error",
      errorMessage: model.status === "error" ? "Error loading model" : null
    };
  } else {
    const module = item as ModuleStatus;
    return {
      isActive: module.isActive,
      statusText: module.isActive ? "Active" : "Inactive",
      hasError: !module.isActive && !!module.error,
      errorMessage: module.error || null
    };
  }
};
