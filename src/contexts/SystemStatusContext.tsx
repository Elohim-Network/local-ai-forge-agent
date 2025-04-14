import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import env from "@/lib/config/environment";
import { useEnv } from "@/lib/config/useEnv";

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
  addModule: (module: ModuleStatus) => void;
  updateModuleStatus: (moduleId: string, isActive: boolean, error?: string) => void;
  removeModule: (moduleId: string) => void;
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
  const { env: envConfig } = useEnv();
  
  // Sample data - in a real app, this would come from an API or local service
  const [models, setModels] = useState<ModelInfo[]>([
    {
      id: "mistral-7b",
      name: "Mistral-7B-v0.2",
      status: "available",
      size: "4.1GB",
      version: "0.2",
      port: envConfig.DEFAULT_MODEL_PORT
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

  // Module registry integration
  const addModule = (module: ModuleStatus) => {
    setModules(prev => {
      // Don't add if already exists
      if (prev.some(m => m.id === module.id)) {
        return prev;
      }
      return [...prev, module];
    });
  };

  const updateModuleStatus = (moduleId: string, isActive: boolean, error?: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId ? 
          { ...module, isActive, error } : 
          module
      )
    );
  };

  const removeModule = (moduleId: string) => {
    setModules(prev => prev.filter(module => module.id !== moduleId));
  };

  // Add a system check function that also checks model connection
  const checkModelConnection = async (modelId: string) => {
    if (modelId !== "mistral-7b" && modelId !== "llama-13b") {
      return false;
    }
    
    try {
      // Try to connect to the local model
      const endpoint = `http://localhost:${envConfig.DEFAULT_MODEL_PORT}/v1/models`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error("Error checking model connection:", error);
      return false;
    }
  };

  // Simulate checking system status with an actual connection check
  const checkSystem = async () => {
    setIsChecking(true);
    
    // Try to connect to the active model
    const activeModel = models.find(model => model.status === "active");
    let isModelConnected = false;
    
    if (activeModel) {
      isModelConnected = await checkModelConnection(activeModel.id);
      
      // Update model status based on connection
      setModels(prevModels => 
        prevModels.map(model => 
          model.id === activeModel.id ? 
            { ...model, status: isModelConnected ? "active" : "error", error: isModelConnected ? undefined : "Failed to connect" } : 
            model
        )
      );
    }
    
    // For simulation, we'll just randomize some statuses
    setModels(prevModels => 
      prevModels.map(model => {
        if (model.id === "phi-3" && model.status === "downloading") {
          const newProgress = Math.min(100, (model.progress || 0) + 15);
          return { 
            ...model, 
            progress: newProgress,
            status: newProgress >= 100 ? "available" : "downloading"
          };
        }
        return model;
      })
    );
    
    setIsChecking(false);
    setLastChecked(new Date());
  };

  // Activate a model with connection check
  const activateModel = async (modelId: string) => {
    const isConnected = await checkModelConnection(modelId);
    
    setModels(prevModels => 
      prevModels.map(model => 
        model.id === modelId ? 
          { 
            ...model, 
            status: isConnected ? "active" as ModelStatus : "error" as ModelStatus,
            port: envConfig.DEFAULT_MODEL_PORT,
            error: isConnected ? undefined : "Failed to connect to model" 
          } : 
          model.status === "active" ? 
            { ...model, status: "available" as ModelStatus } : // Set previously active models to available
            model
      )
    );
    
    if (!isConnected) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${modelId}. Please check that your local model server is running.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Model Activated",
        description: `Successfully connected to ${modelId}.`,
      });
    }
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

  // React to environment changes
  useEffect(() => {
    // For example, update model ports if DEFAULT_MODEL_PORT changes
    setModels(prevModels => 
      prevModels.map(model => 
        model.status === "active" ? 
          { ...model, port: envConfig.DEFAULT_MODEL_PORT } : 
          model
      )
    );
  }, [envConfig.DEFAULT_MODEL_PORT]);

  const value = {
    models,
    modules,
    isChecking,
    lastChecked,
    checkSystem,
    activateModel,
    downloadModel,
    restartModule,
    fixAllIssues,
    addModule,
    updateModuleStatus,
    removeModule
  };

  return (
    <SystemStatusContext.Provider value={value}>
      {children}
    </SystemStatusContext.Provider>
  );
};
