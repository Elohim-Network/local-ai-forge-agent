
import { useEffect, useState } from 'react';
import env, { getAllEnvVars, setEnvValue } from './environment';

type EnvVars = ReturnType<typeof getAllEnvVars>;

export function useEnv() {
  const [config, setConfig] = useState<EnvVars>(getAllEnvVars());
  
  useEffect(() => {
    // Listen for env updates
    const handleEnvUpdate = () => {
      setConfig(getAllEnvVars());
    };
    
    window.addEventListener('env-updated', handleEnvUpdate);
    
    return () => {
      window.removeEventListener('env-updated', handleEnvUpdate);
    };
  }, []);
  
  return {
    env: config,
    setEnv: setEnvValue,
    getSystemName: () => config.SYSTEM_NAME,
    isRebrandMode: () => config.REBRAND_MODE,
  };
}
