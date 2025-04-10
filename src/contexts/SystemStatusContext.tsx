
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for our system status
export type ModelStatus = "active" | "downloading" | "available" | "not-installed" | "error";

export interface ModelInfo {
  id: string;
  name: string;
  status: ModelStatus;
  size: string;
  version?: string;
  port?: number;
  progress?: number;
  error?: string;
}

export interface ModuleStatus {
  id: string;
  name: string;
  isActive: boolean;
  error?: string;
}

export interface SystemStatusContextType {
  models: ModelInfo[];
  modules: ModuleStatus[];
  isChecking: boolean;
  lastChecked: Date | null;
  checkSystem: () => Promise<void>;
  activateModel: (modelId: string) => Promise<void>;
  downloadModel: (modelId: string) => Promise<void>;
  restartModule: (moduleId: string) => Promise<void>;
  fixAllIssues: () => Promise<void>;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export const useSystemStatus = () => {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error("useSystemStatus must be used within a SystemStatusProvider");
  }
  return context;
};

export const SystemStatusProvider = ({ children }: { children: ReactNode }) => {
  // Sample data - in a real app, this would come from an API or local service
  const [models, setModels] = useState<ModelInfo[]>([
    {
      id: "mistral-7b",
      name: "Mistral-7B-v0.2",
      status: "active",
      size: "4.1GB",
      version: "0.2",
      port: 8000
    },
    {
      id: "sdxl",
      name: "Stable Diffusion XL",
      status: "available",
      size: "6.8GB",
      version: "1.0"
    },
    {
      id: "phi-3",
      name: "Phi-3",
      status: "downloading",
      size: "3.8GB",
      version: "1.0",
      progress: 65
    },
    {
      id: "codellama",
      name: "CodeLlama-7B",
      status: "not-installed",
      size: "4.3GB",
      version: "1.0"
    }
  ]);
  
  const [modules, setModules] = useState<ModuleStatus[]>([
    { id: "chat", name: "Chat Interface", isActive: true },
    { id: "agents", name: "AI Agents", isActive: true },
    { id: "web-apps", name: "Web Apps", isActive: false, error: "Missing dependencies" },
    { id: "workflows", name: "Workflows", isActive: true },
    { id: "integrations", name: "External Integrations", isActive: false, error: "Configuration required" }
  ]);
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Simulate checking system status
  const checkSystem = async () => {
    setIsChecking(true);
    
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update with "new" information (in a real app, this would be actual data)
    // For simulation, we'll just randomize some statuses
    setModels(prevModels => 
      prevModels.map(model => {
        if (model.id === "phi-3" && model.status === "downloading") {
          return { ...model, progress: Math.min(100, (model.progress || 0) + 15) };
        }
        return model;
      })
    );
    
    setIsChecking(false);
    setLastChecked(new Date());
  };

  // Activate a model
  const activateModel = async (modelId: string) => {
    setModels(prevModels => 
      prevModels.map(model => 
        model.id === modelId ? 
          { ...model, status: "active" as ModelStatus } : 
          model
      )
    );
  };

  // Download a model
  const downloadModel = async (modelId: string) => {
    setModels(prevModels => 
      prevModels.map(model => 
        model.id === modelId ? 
          { ...model, status: "downloading" as ModelStatus, progress: 0 } : 
          model
      )
    );
  };

  // Restart a module
  const restartModule = async (moduleId: string) => {
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === moduleId ? 
          { ...module, isActive: true, error: undefined } : 
          module
      )
    );
  };

  // Fix all issues
  const fixAllIssues = async () => {
    setIsChecking(true);
    
    // Simulate fixing issues
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update models
    setModels(prevModels => 
      prevModels.map(model => {
        if (model.status === "error") {
          return { ...model, status: "active" as ModelStatus };
        }
        return model;
      })
    );
    
    // Update modules
    setModules(prevModules => 
      prevModules.map(module => {
        if (!module.isActive) {
          return { ...module, isActive: true, error: undefined };
        }
        return module;
      })
    );
    
    setIsChecking(false);
    setLastChecked(new Date());
  };

  // Initial system check on mount
  useEffect(() => {
    checkSystem();
  }, []);

  const value = {
    models,
    modules,
    isChecking,
    lastChecked,
    checkSystem,
    activateModel,
    downloadModel,
    restartModule,
    fixAllIssues
  };

  return (
    <SystemStatusContext.Provider value={value}>
      {children}
    </SystemStatusContext.Provider>
  );
};
