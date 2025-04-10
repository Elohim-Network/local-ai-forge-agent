
import React, { useState } from 'react';
import { useEnv } from '@/lib/config/useEnv';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function EnvSettings() {
  const { env, setEnv } = useEnv();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("branding");
  const [localEnv, setLocalEnv] = useState({ ...env });

  const handleSave = () => {
    // Update all changed values
    Object.entries(localEnv).forEach(([key, value]) => {
      if (env[key as keyof typeof env] !== value) {
        setEnv(key as keyof typeof env, value);
      }
    });

    toast({
      title: "Environment updated",
      description: "Settings have been saved. Some changes may require a restart.",
    });
  };

  const handleChange = (key: string, value: any) => {
    setLocalEnv(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Settings</CardTitle>
        <CardDescription>
          Configure system environment variables. These settings control core behaviors across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Changes to these settings affect system-wide behavior. In production, these would be managed through .env files.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="models">Models & Ports</TabsTrigger>
            <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="branding" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  value={localEnv.SYSTEM_NAME}
                  onChange={(e) => handleChange('SYSTEM_NAME', e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="rebrand-mode"
                  checked={localEnv.REBRAND_MODE}
                  onCheckedChange={(checked) => handleChange('REBRAND_MODE', checked)}
                />
                <Label htmlFor="rebrand-mode">Enable Rebrand Mode</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="models" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="model-path">Model Base Path</Label>
                <Input
                  id="model-path"
                  value={localEnv.MODEL_BASE_PATH}
                  onChange={(e) => handleChange('MODEL_BASE_PATH', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model-port">Default Model Port</Label>
                <Input
                  id="model-port"
                  type="number"
                  value={localEnv.DEFAULT_MODEL_PORT}
                  onChange={(e) => handleChange('DEFAULT_MODEL_PORT', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model-host">Default Model Host</Label>
                <Input
                  id="model-host"
                  value={localEnv.DEFAULT_MODEL_HOST}
                  onChange={(e) => handleChange('DEFAULT_MODEL_HOST', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-cloud"
                  checked={localEnv.ENABLE_CLOUD_SYNC}
                  onCheckedChange={(checked) => handleChange('ENABLE_CLOUD_SYNC', checked)}
                />
                <Label htmlFor="enable-cloud">Enable Cloud Sync</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-marketplace"
                  checked={localEnv.ENABLE_MODULE_MARKETPLACE}
                  onCheckedChange={(checked) => handleChange('ENABLE_MODULE_MARKETPLACE', checked)}
                />
                <Label htmlFor="enable-marketplace">Enable Module Marketplace</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-workflows"
                  checked={localEnv.ENABLE_AGENT_WORKFLOWS}
                  onCheckedChange={(checked) => handleChange('ENABLE_AGENT_WORKFLOWS', checked)}
                />
                <Label htmlFor="enable-workflows">Enable Agent Workflows</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-diagnostic"
                  checked={localEnv.ENABLE_DIAGNOSTIC_AGENT}
                  onCheckedChange={(checked) => handleChange('ENABLE_DIAGNOSTIC_AGENT', checked)}
                />
                <Label htmlFor="enable-diagnostic">Enable Diagnostic Agent</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="ml-auto gap-2" onClick={handleSave}>
          <Save size={16} />
          Save Environment Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
