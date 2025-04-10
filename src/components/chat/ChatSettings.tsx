
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

interface ChatSettingsProps {
  onSaveSettings: (settings: ChatSettings) => void;
  settings: ChatSettings;
}

export interface ChatSettings {
  memory: {
    enabled: boolean;
    saveHistory: boolean;
  };
  voice: {
    enabled: boolean;
    voiceId: string;
    autoListen: boolean;
    volume: number;
  };
}

const DEFAULT_SETTINGS: ChatSettings = {
  memory: {
    enabled: true,
    saveHistory: true,
  },
  voice: {
    enabled: false,
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah by default
    autoListen: false,
    volume: 0.8,
  },
};

const VOICE_OPTIONS = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" },
];

export function ChatSettings({ onSaveSettings, settings = DEFAULT_SETTINGS }: ChatSettingsProps) {
  const [localSettings, setLocalSettings] = React.useState<ChatSettings>(settings);
  const [open, setOpen] = React.useState(false);

  const handleSave = () => {
    onSaveSettings(localSettings);
    toast({
      title: "Settings saved",
      description: "Your chat settings have been updated.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Chat Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Customize your chat experience with these settings.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="memory" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="memory">Memory & History</TabsTrigger>
            <TabsTrigger value="voice">Voice Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="memory" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="memory-enabled" className="font-medium">Enable Memory</Label>
                <p className="text-sm text-muted-foreground">
                  Let the AI remember previous conversations
                </p>
              </div>
              <Switch
                id="memory-enabled"
                checked={localSettings.memory.enabled}
                onCheckedChange={(checked) => 
                  setLocalSettings({
                    ...localSettings,
                    memory: { ...localSettings.memory, enabled: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="save-history" className="font-medium">Save Chat History</Label>
                <p className="text-sm text-muted-foreground">
                  Save conversations for future reference
                </p>
              </div>
              <Switch
                id="save-history"
                checked={localSettings.memory.saveHistory}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    memory: { ...localSettings.memory, saveHistory: checked },
                  })
                }
              />
            </div>
          </TabsContent>
          <TabsContent value="voice" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="voice-enabled" className="font-medium">Enable Voice Chat</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the AI to speak responses out loud
                </p>
              </div>
              <Switch
                id="voice-enabled"
                checked={localSettings.voice.enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    voice: { ...localSettings.voice, enabled: checked },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <Select
                value={localSettings.voice.voiceId}
                onValueChange={(value) =>
                  setLocalSettings({
                    ...localSettings,
                    voice: { ...localSettings.voice, voiceId: value },
                  })
                }
                disabled={!localSettings.voice.enabled}
              >
                <SelectTrigger id="voice-select">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-listen" className="font-medium">Auto-Listen Mode</Label>
                <Switch
                  id="auto-listen"
                  checked={localSettings.voice.autoListen}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      voice: { ...localSettings.voice, autoListen: checked },
                    })
                  }
                  disabled={!localSettings.voice.enabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically listen for voice commands without pressing a button
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-volume">
                Volume: {Math.round(localSettings.voice.volume * 100)}%
              </Label>
              <Slider
                id="voice-volume"
                defaultValue={[localSettings.voice.volume]}
                max={1}
                step={0.01}
                onValueChange={([value]) =>
                  setLocalSettings({
                    ...localSettings,
                    voice: { ...localSettings.voice, volume: value },
                  })
                }
                disabled={!localSettings.voice.enabled}
              />
            </div>
            
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={!localSettings.voice.enabled}
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Voice cloning functionality will be available soon.",
                  });
                }}
              >
                Upload Voice Sample
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
