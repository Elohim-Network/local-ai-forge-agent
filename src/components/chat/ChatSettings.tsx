
import React, { useState } from "react";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, Info, Mic, Headphones, MessageSquare } from "lucide-react";

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
    continuousListening?: boolean;
    silenceTimeout?: number;
    minConfidence?: number;
    autoSendThreshold?: number;
    useCustomVoice?: boolean;
    customVoiceId?: string;
    customVoiceName?: string;
    autoReplyEnabled?: boolean;
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
    continuousListening: false,
    silenceTimeout: 1500,
    minConfidence: 0.5,
    autoSendThreshold: 15, // Default character threshold for auto-sending
    useCustomVoice: false,
    customVoiceId: "",
    customVoiceName: "My Voice",
    autoReplyEnabled: true
  },
};

// Extended voices list with more realistic options
const VOICE_OPTIONS = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Natural)" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura (Natural)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (Natural)" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (Premium)" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (Premium)" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice (Enhanced)" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (Enhanced)" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily (Enhanced)" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris (Professional)" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Professional)" },
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria (Premium)" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger (Premium)" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Enhanced)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Enhanced)" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River (Premium)" },
];

export function ChatSettings({ onSaveSettings, settings = DEFAULT_SETTINGS }: ChatSettingsProps) {
  const [localSettings, setLocalSettings] = React.useState<ChatSettings>(settings);
  const [open, setOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("voice");

  // Mock function for voice cloning
  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show progress toast
      toast({
        title: "Processing voice sample",
        description: "Analyzing voice characteristics...",
      });
      
      // Simulate processing
      setTimeout(() => {
        // Update settings with "cloned" voice
        const customVoiceId = "custom-" + Math.random().toString(36).substring(2, 10);
        setLocalSettings({
          ...localSettings,
          voice: { 
            ...localSettings.voice, 
            useCustomVoice: true,
            customVoiceId,
            customVoiceName: file.name.replace(/\.[^/.]+$/, "") || "My Custom Voice"
          },
        });
        
        // Success toast
        toast({
          title: "Voice sample processed",
          description: "Your custom voice is ready to use.",
        });
        
        setUploadOpen(false);
      }, 2000);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setRecordingTimer(timer);
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        stopRecording();
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to record your voice.",
          variant: "destructive"
        });
      });
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    // Clear timer
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    if (recordingTime < 5) {
      toast({
        title: "Recording too short",
        description: "Please record at least 5 seconds of your voice.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate processing
    toast({
      title: "Processing voice recording",
      description: "Analyzing voice characteristics...",
    });
    
    // Simulate successful processing
    setTimeout(() => {
      const customVoiceId = "recorded-" + Math.random().toString(36).substring(2, 10);
      setLocalSettings({
        ...localSettings,
        voice: { 
          ...localSettings.voice, 
          useCustomVoice: true,
          customVoiceId,
          customVoiceName: "My Recorded Voice"
        },
      });
      
      toast({
        title: "Voice recording processed",
        description: "Your custom voice is ready to use.",
      });
      
      setUploadOpen(false);
    }, 2000);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    toast({
      title: "Settings saved",
      description: "Your chat settings have been updated.",
    });
    setOpen(false);
  };

  return (
    <>
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
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
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
                    Allow the AI to speak responses and listen to you
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

              {localSettings.voice.useCustomVoice ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-select" className="font-medium">Current Voice</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        voice: { ...localSettings.voice, useCustomVoice: false }
                      })}
                    >
                      Switch to Standard Voice
                    </Button>
                  </div>
                  <div className="p-3 border rounded-md bg-muted/30">
                    <div className="font-medium">{localSettings.voice.customVoiceName}</div>
                    <div className="text-sm text-muted-foreground">Custom voice clone</div>
                  </div>
                </div>
              ) : (
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
              )}
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <MessageSquare size={16} /> 
                  <span>Interaction Mode</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reply" className="font-medium">Auto-Reply</Label>
                      <Switch
                        id="auto-reply"
                        checked={localSettings.voice.autoReplyEnabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings({
                            ...localSettings,
                            voice: { ...localSettings.voice, autoReplyEnabled: checked },
                          })
                        }
                        disabled={!localSettings.voice.enabled}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically respond to your voice commands
                    </p>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="continuous-listening" className="font-medium">Hands-Free Mode</Label>
                      <Switch
                        id="continuous-listening"
                        checked={localSettings.voice.continuousListening}
                        onCheckedChange={(checked) =>
                          setLocalSettings({
                            ...localSettings,
                            voice: { 
                              ...localSettings.voice, 
                              continuousListening: checked,
                              // If enabling hands-free, make sure auto-listen is also on
                              autoListen: checked ? true : localSettings.voice.autoListen 
                            },
                          })
                        }
                        disabled={!localSettings.voice.enabled}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time voice communication (automatically enables auto-listen)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Headphones size={16} /> 
                  <span>Voice Recognition</span>
                </h3>
              
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-send-threshold">
                      Auto-Send Threshold: {localSettings.voice.autoSendThreshold || 15} characters
                    </Label>
                    <Slider
                      id="auto-send-threshold"
                      value={[localSettings.voice.autoSendThreshold || 15]}
                      min={0}
                      max={50}
                      step={5}
                      onValueChange={([value]) =>
                        setLocalSettings({
                          ...localSettings,
                          voice: { ...localSettings.voice, autoSendThreshold: value },
                        })
                      }
                      disabled={!localSettings.voice.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically send message after this many characters (0 to disable)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="silence-timeout">
                      Silence Timeout: {localSettings.voice.silenceTimeout || 1500}ms
                    </Label>
                    <Slider
                      id="silence-timeout"
                      value={[localSettings.voice.silenceTimeout || 1500]}
                      min={500}
                      max={5000}
                      step={100}
                      onValueChange={([value]) =>
                        setLocalSettings({
                          ...localSettings,
                          voice: { ...localSettings.voice, silenceTimeout: value },
                        })
                      }
                      disabled={!localSettings.voice.enabled || !localSettings.voice.continuousListening}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to wait for silence before processing speech in hands-free mode
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speech-confidence">
                      Minimum Confidence: {Math.round((localSettings.voice.minConfidence || 0.5) * 100)}%
                    </Label>
                    <Slider
                      id="speech-confidence"
                      value={[localSettings.voice.minConfidence || 0.5]}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      onValueChange={([value]) =>
                        setLocalSettings({
                          ...localSettings,
                          voice: { ...localSettings.voice, minConfidence: value },
                        })
                      }
                      disabled={!localSettings.voice.enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Threshold for speech recognition accuracy
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Mic size={16} />
                  <span>Voice Settings</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-volume">
                      Volume: {Math.round(localSettings.voice.volume * 100)}%
                    </Label>
                    <Slider
                      id="voice-volume"
                      value={[localSettings.voice.volume]}
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
                      onClick={() => setUploadOpen(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Voice Sample
                    </Button>
                  </div>
                </div>
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

      {/* Voice Sample Upload Dialog */}
      <AlertDialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voice Cloning</AlertDialogTitle>
            <AlertDialogDescription>
              {isRecording ? (
                <div className="text-center">
                  <div className="animate-pulse text-red-500 mb-2">
                    Recording... {recordingTime}s
                  </div>
                  <p>Speak clearly for at least 5 seconds.</p>
                </div>
              ) : (
                <>
                  Create a custom voice by uploading a sample or recording your voice.
                  This will allow the AI to respond using a voice similar to yours.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!isRecording && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-md p-4 text-center hover:bg-muted/50 cursor-pointer">
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Upload Audio</p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, or M4A</p>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={handleVoiceUpload}
                    />
                  </label>
                </div>
                
                <div 
                  className="border rounded-md p-4 text-center hover:bg-muted/50 cursor-pointer"
                  onClick={startRecording}
                >
                  <Mic className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Record Voice</p>
                  <p className="text-xs text-muted-foreground">Speak for 5+ seconds</p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md border">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">Voice Cloning Tips</span>
                </div>
                <ul className="text-sm text-muted-foreground pl-6 list-disc">
                  <li>Use a quiet environment with minimal background noise</li>
                  <li>Speak clearly and at your natural pace</li>
                  <li>Longer samples (30+ seconds) produce better results</li>
                  <li>Audio should only contain one speaker (you)</li>
                </ul>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            {isRecording ? (
              <Button onClick={stopRecording} variant="destructive">
                Stop Recording
              </Button>
            ) : (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    toast({
                      title: "Voice Sample Ready",
                      description: "Your voice sample has been processed and is ready to use.",
                    });
                    setUploadOpen(false);
                  }}
                >
                  Save
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
