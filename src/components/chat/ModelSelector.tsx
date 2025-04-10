
import { Check, Server } from "lucide-react";
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

interface ModelOption {
  value: string;
  label: string;
  description: string;
  status: "active" | "available" | "not-installed";
}

const models: ModelOption[] = [
  {
    value: "mistral-7b",
    label: "Mistral-7B",
    description: "General purpose model good for chat & reasoning",
    status: "active"
  },
  {
    value: "llama-13b",
    label: "Llama2-13B",
    description: "Meta's open source LLM with 13B parameters",
    status: "available"
  },
  {
    value: "stable-diffusion",
    label: "Stable Diffusion XL",
    description: "Text-to-image generation model",
    status: "available"
  },
  {
    value: "gpt-3.5",
    label: "GPT-3.5 Turbo",
    description: "OpenAI's balanced model for general purpose use",
    status: "not-installed"
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedModelOption = models.find(model => model.value === selectedModel);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Server className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedModelOption?.label || "Select model"}</span>
          </div>
          <span className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {models.map((model) => (
              <CommandItem
                key={model.value}
                value={model.value}
                onSelect={(currentValue) => {
                  onSelectModel(currentValue);
                  setOpen(false);
                }}
                disabled={model.status === "not-installed"}
                className={model.status === "not-installed" ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedModel === model.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{model.label}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </div>
                <div className="ml-auto">
                  {model.status === "active" && (
                    <span className="text-xs font-medium text-green-500">Active</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
