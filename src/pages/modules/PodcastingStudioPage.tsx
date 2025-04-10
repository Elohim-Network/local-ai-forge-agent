
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Play, Pause, Save, Upload, SkipForward, SkipBack, Download, Headphones, Bot, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const PodcastingStudioPage = () => {
  const [tab, setTab] = useState("create");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastDescription, setPodcastDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [voiceType, setVoiceType] = useState("male");
  const [audioLength, setAudioLength] = useState([5]); // in minutes
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = () => {
    if (!podcastTitle || !promptText) {
      toast({
        title: "Missing information",
        description: "Please provide a title and content for your podcast.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Podcast Generated",
        description: "Your AI podcast has been successfully created!",
      });
      setTab("edit");
    }, 3000);
  };
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSave = () => {
    toast({
      title: "Podcast Saved",
      description: "Your podcast has been saved successfully.",
    });
  };
  
  const handleDownload = () => {
    toast({
      title: "Downloading Podcast",
      description: "Your podcast is being prepared for download.",
    });
  };
  
  const handleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Recording your voice. Speak into your microphone.",
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "Your recording has been saved.",
      });
    }
  };
  
  const voices = [
    { value: "male", label: "Male (Default)" },
    { value: "female", label: "Female (Default)" },
    { value: "male-british", label: "Male (British)" },
    { value: "female-british", label: "Female (British)" },
    { value: "male-australian", label: "Male (Australian)" },
    { value: "female-australian", label: "Female (Australian)" }
  ];
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">AI Podcasting Studio</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary">Beta</Badge>
          </div>
          <p className="text-muted-foreground">Create, edit, and publish AI-generated podcasts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Save Project
          </Button>
          <Button onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Export Audio
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="create" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="edit">Edit & Mix</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Podcast Information</CardTitle>
                  <CardDescription>Enter the details for your podcast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Podcast Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter podcast title" 
                      value={podcastTitle}
                      onChange={e => setPodcastTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe your podcast" 
                      rows={3}
                      value={podcastDescription}
                      onChange={e => setPodcastDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>What should your podcast be about?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Content Prompt</Label>
                    <Textarea 
                      id="prompt" 
                      placeholder="Describe what you want your podcast to be about in detail..." 
                      rows={6}
                      value={promptText}
                      onChange={e => setPromptText(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about topics, style, structure, and any references you want included.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-end w-full">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating || !podcastTitle || !promptText}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot size={16} className="mr-2" />
                          Generate Podcast
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Settings</CardTitle>
                  <CardDescription>Configure the AI voice for your podcast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-type">Voice Type</Label>
                    <Select value={voiceType} onValueChange={setVoiceType}>
                      <SelectTrigger id="voice-type">
                        <SelectValue placeholder="Select voice type" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map(voice => (
                          <SelectItem key={voice.value} value={voice.value}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="length">Length (minutes)</Label>
                      <span className="text-sm font-medium">{audioLength}min</span>
                    </div>
                    <Slider
                      id="length"
                      value={audioLength}
                      onValueChange={setAudioLength}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-music" className="cursor-pointer">
                        Background Music
                      </Label>
                      <Switch id="add-music" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-intro" className="cursor-pointer">
                        Add Intro/Outro
                      </Label>
                      <Switch id="add-intro" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Voice Recording</CardTitle>
                  <CardDescription>Add your own voice to the podcast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    className="w-full" 
                    onClick={handleRecording}
                  >
                    {isRecording ? (
                      <>
                        <span className="animate-pulse mr-2">●</span> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic size={16} className="mr-2" /> Start Recording
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Record your voice to add to the AI-generated content
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Editor</CardTitle>
              <CardDescription>Edit and enhance your podcast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* Audio visualization placeholder */}
                <div className="w-full h-32 bg-muted/50 rounded-md flex items-center justify-center border">
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex items-end justify-center gap-[2px] h-[70%] w-full px-4">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[4px] bg-primary/60 rounded-t"
                          style={{
                            height: `${Math.random() * 100}%`,
                            opacity: i % 2 === 0 ? 0.7 : 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Audio controls */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" disabled={!podcastTitle}>
                      <SkipBack size={16} />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-12 w-12" 
                      disabled={!podcastTitle}
                      onClick={handlePlay}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                    <Button variant="outline" size="icon" disabled={!podcastTitle}>
                      <SkipForward size={16} />
                    </Button>
                  </div>
                  <div className="text-sm font-medium">{podcastTitle || "No podcast generated yet"}</div>
                </div>
                
                {/* Voice settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label htmlFor="voice-speed">Voice Speed</Label>
                    <Slider
                      id="voice-speed"
                      defaultValue={[100]}
                      min={50}
                      max={150}
                      step={1}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="voice-pitch">Voice Pitch</Label>
                    <Slider
                      id="voice-pitch"
                      defaultValue={[100]}
                      min={50}
                      max={150}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Add Music</CardTitle>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select background music" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upbeat">Upbeat</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="none">No Music</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sound Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Add sound effects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applause">Applause</SelectItem>
                    <SelectItem value="laughter">Laughter</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="transition">Transition</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Voice Cleanup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="noise-reduction" className="cursor-pointer">
                    Noise Reduction
                  </Label>
                  <Switch id="noise-reduction" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="normalization" className="cursor-pointer">
                    Audio Normalization
                  </Label>
                  <Switch id="normalization" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="publish" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publish Your Podcast</CardTitle>
              <CardDescription>Configure publishing options and distribute your podcast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="final-title">Title</Label>
                    <Input id="final-title" value={podcastTitle} onChange={e => setPodcastTitle(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="final-description">Description</Label>
                    <Textarea 
                      id="final-description" 
                      value={podcastDescription} 
                      onChange={e => setPodcastDescription(e.target.value)}
                      rows={4} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border rounded-md p-4 text-center">
                      <div className="w-32 h-32 mx-auto bg-muted rounded-md mb-2 flex items-center justify-center">
                        <Headphones className="text-muted-foreground h-10 w-10" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload size={14} className="mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Distribution</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="spotify" className="cursor-pointer flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 12a4 4 0 0 1 8 0"></path>
                            <path d="M6 13a6 6 0 0 1 12 0"></path>
                            <path d="M4 14a8 8 0 0 1 16 0"></path>
                          </svg>
                          Spotify
                        </Label>
                        <Switch id="spotify" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="apple" className="cursor-pointer flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                            <path d="M10 2c1 .5 2 2 2 5"></path>
                          </svg>
                          Apple Podcasts
                        </Label>
                        <Switch id="apple" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="youtube" className="cursor-pointer flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                            <path d="m10 15 5-3-5-3z"></path>
                          </svg>
                          YouTube
                        </Label>
                        <Switch id="youtube" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setTab("edit")}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Back to Editing
                </Button>
                <Button>
                  Publish Podcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PodcastingStudioPage;
