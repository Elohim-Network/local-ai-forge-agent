
import { useEffect } from 'react';
import { useModuleRegistry } from './ModuleRegistry';
import { ModuleMetadata, ModuleRegistrationOptions } from './types';
import { useSystemStatus } from '@/contexts/SystemStatusContext';

export function useModuleRegistration(
  metadata: ModuleMetadata, 
  options: ModuleRegistrationOptions = {}
) {
  const { register, unregister } = useModuleRegistry();
  const { addModule, updateModuleStatus } = useSystemStatus();
  
  useEffect(() => {
    // Register with the module registry
    register(metadata.id, {
      ...metadata,
      autoStart: options.autoStart ?? false,
      isSystem: options.isSystem ?? false
    });
    
    // Register with SystemStatusContext for health monitoring
    addModule({
      id: metadata.id,
      name: metadata.name,
      isActive: metadata.status === 'active',
      error: metadata.error
    });
    
    return () => {
      unregister(metadata.id);
    };
  }, [metadata.id]);
  
  // Helper function to update module status
  const setStatus = (status: 'active' | 'inactive' | 'error' | 'loading', error?: string) => {
    // Update in registry
    register(metadata.id, {
      ...metadata,
      status,
      error
    });
    
    // Update in SystemStatusContext
    updateModuleStatus(metadata.id, status === 'active', error);
  };
  
  return {
    setStatus
  };
}
