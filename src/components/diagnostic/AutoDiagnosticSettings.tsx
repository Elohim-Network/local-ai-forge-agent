
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoDiagnosticSettingsProps {
  autoScan: boolean;
  setAutoScan: (value: boolean) => void;
  scanInterval: number;
  setScanInterval: (value: number) => void;
  lastAutoScan: Date | null;
}

export function AutoDiagnosticSettings({
  autoScan,
  setAutoScan,
  scanInterval,
  setScanInterval,
  lastAutoScan
}: AutoDiagnosticSettingsProps) {
  const { toast } = useToast();
  const [localInterval, setLocalInterval] = useState(scanInterval);
  
  // Format timestamp
  const formatTimestamp = (date: Date | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  // Handle save
  const handleSave = () => {
    setScanInterval(localInterval);
    toast({
      title: "Settings updated",
      description: `Auto-diagnostic will run ${autoScan ? `every ${localInterval} minutes` : "manually only"}`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Diagnostic Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scan" className="text-base cursor-pointer">
              Enable Auto-Diagnostic
            </Label>
            <Switch 
              id="auto-scan" 
              checked={autoScan}
              onCheckedChange={setAutoScan}
            />
          </div>
          
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="interval">Check Interval (minutes)</Label>
              <Input 
                id="interval"
                type="number"
                min={1}
                max={1440} // 24 hours
                value={localInterval}
                onChange={(e) => setLocalInterval(parseInt(e.target.value) || 60)}
                disabled={!autoScan}
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!autoScan || localInterval === scanInterval}
              className="gap-2"
            >
              <Save size={16} />
              Save
            </Button>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Auto-Diagnostic Status</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span>Last auto-scan: {formatTimestamp(lastAutoScan)}</span>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Next scheduled scans:</h4>
            {autoScan ? (
              <ul className="space-y-1 pl-5 list-disc marker:text-muted-foreground">
                {[...Array(3)].map((_, i) => {
                  const nextScan = lastAutoScan 
                    ? new Date(lastAutoScan.getTime() + (i + 1) * scanInterval * 60 * 1000)
                    : new Date(Date.now() + (i + 1) * scanInterval * 60 * 1000);
                  
                  return (
                    <li key={i} className="text-sm text-muted-foreground">
                      {formatTimestamp(nextScan)}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Auto-diagnostic is disabled. Only manual scans will be performed.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
