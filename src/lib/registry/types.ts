
import { LucideIcon } from "lucide-react";

export type ModuleStatus = 'active' | 'inactive' | 'error' | 'loading';

export type ModuleCategory = 
  | 'ai' 
  | 'business' 
  | 'data' 
  | 'marketing' 
  | 'developer' 
  | 'system'
  | 'utility';

export interface ModuleFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ModuleDependency {
  moduleId: string;
  version: string;
  required: boolean;
}

export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  category: ModuleCategory;
  icon: string;  // Lucide icon name
  status: ModuleStatus;
  features?: ModuleFeature[];
  dependencies?: ModuleDependency[];
  routes?: string[];
  registeredAt?: Date;
  error?: string;
  isSystem?: boolean;
  autoStart?: boolean;
  requiresAuth?: boolean;
  settings?: Record<string, any>;
  healthCheck?: () => Promise<{ healthy: boolean; details?: Record<string, any> }>;
}

export interface ModuleRegistrationOptions {
  autoStart?: boolean;
  isSystem?: boolean;
}
