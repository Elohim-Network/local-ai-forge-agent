
import { create } from 'zustand';
import { ModuleMetadata } from './types';

// Define the module registry store
interface ModuleRegistryState {
  modules: Record<string, ModuleMetadata>;
  register: (moduleId: string, metadata: ModuleMetadata) => void;
  unregister: (moduleId: string) => void;
  getModule: (moduleId: string) => ModuleMetadata | undefined;
  getAllModules: () => ModuleMetadata[];
  isModuleRegistered: (moduleId: string) => boolean;
}

// Create the module registry store
const useModuleRegistry = create<ModuleRegistryState>((set, get) => ({
  modules: {},
  
  register: (moduleId, metadata) => {
    // Don't override if already registered with the same version
    if (get().modules[moduleId]?.version === metadata.version) {
      console.log(`Module ${moduleId} v${metadata.version} already registered`);
      return;
    }
    
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...metadata,
          registeredAt: new Date()
        }
      }
    }));
    
    console.log(`Module ${moduleId} v${metadata.version} registered`);
  },
  
  unregister: (moduleId) => {
    set((state) => {
      const newModules = { ...state.modules };
      delete newModules[moduleId];
      return { modules: newModules };
    });
    
    console.log(`Module ${moduleId} unregistered`);
  },
  
  getModule: (moduleId) => {
    return get().modules[moduleId];
  },
  
  getAllModules: () => {
    return Object.values(get().modules);
  },
  
  isModuleRegistered: (moduleId) => {
    return !!get().modules[moduleId];
  }
}));

export { useModuleRegistry };
