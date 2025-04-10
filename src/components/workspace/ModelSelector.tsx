
import { Badge } from "@/components/ui/badge";
import { Bot, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  showPreview: boolean;
  togglePreview: () => void;
}

export function ModelSelector({ showPreview, togglePreview }: ModelSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
          <Bot size={18} className="text-primary" />
        </div>
        <Select defaultValue="mistral">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mistral">Mistral-7B-v0.2</SelectItem>
            <SelectItem value="phi">Phi-3</SelectItem>
            <SelectItem value="llama">CodeLlama-7B</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-600/10">
          Active
        </Badge>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={togglePreview}
      >
        <PanelRight size={16} />
      </Button>
    </div>
  );
}
