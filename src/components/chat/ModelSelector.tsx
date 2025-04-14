
import { Check, ChevronDown, ChevronUp, Bot, Image, Zap, ServerCrash, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  className?: string;
  isConnected?: boolean;
  onRetryConnection?: () => Promise<void>;
}

export function ModelSelector({ 
  selectedModel, 
  onSelectModel, 
  className,
  isConnected = false,
  onRetryConnection
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const models = [
    {
      value: "mistral-7b",
      label: "Mistral 7B",
      description: "Large language model for chat & reasoning",
      icon: Bot
    },
    {
      value: "llama-13b",
      label: "Llama 13B",
      description: "Enhanced language processing & context",
      icon: Zap
    },
    {
      value: "stable-diffusion",
      label: "Stable Diffusion",
      description: "AI image generation from text prompts",
      icon: Image
    }
  ];

  const selectedModelDetails = models.find(model => model.value === selectedModel);

  const handleRetryConnection = async () => {
    if (!onRetryConnection) return;
    
    setIsRetrying(true);
    try {
      await onRetryConnection();
      toast({
        title: "Connection attempt",
        description: "Trying to connect to the local model...",
      });
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-card/60 shadow-inner border-primary/20 backdrop-blur-sm",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedModelDetails && (
                <selectedModelDetails.icon className="h-4 w-4 text-primary shrink-0" />
              )}
              <span className="truncate">{selectedModelDetails?.label || selectedModel}</span>
            </div>
            {open ? 
              <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-50" /> : 
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 bg-gradient-to-b from-card to-background/90 border-primary/20 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
          <Command>
            <CommandInput placeholder="Search models..." className="h-9 border-b border-primary/20" />
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup className="max-h-[250px] overflow-auto">
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    onSelectModel(currentValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer",
                    selectedModel === model.value ? 
                      "bg-primary/10 text-primary font-medium" : 
                      "hover:bg-primary/5"
                  )}
                >
                  <model.icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedModel === model.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {onRetryConnection && (
        <Button
          variant={isConnected ? "outline" : "secondary"}
          size="icon"
          className={cn(
            "h-9 w-9",
            isConnected ? "text-green-500 border-green-200" : "text-amber-500"
          )}
          onClick={handleRetryConnection}
          disabled={isRetrying}
          title={isConnected ? "Connected" : "Not connected - click to retry"}
        >
          {isConnected ? (
            <Server className="h-4 w-4" />
          ) : (
            <ServerCrash className={cn("h-4 w-4", isRetrying && "animate-pulse")} />
          )}
        </Button>
      )}
    </div>
  );
}
