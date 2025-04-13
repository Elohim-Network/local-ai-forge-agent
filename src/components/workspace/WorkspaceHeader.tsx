
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, PlayCircle, Save, Settings } from "lucide-react";
import { ReactNode } from "react";

interface WorkspaceHeaderProps {
  title: string;
  type: string;
  children?: ReactNode;
}

export function WorkspaceHeader({ title, type, children }: WorkspaceHeaderProps) {
  return (
    <div className="border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium">{title}</h1>
        <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
          <Bot size={12} />
          {type}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Button variant="outline" size="sm" className="gap-2">
          <Save size={14} />
          Save
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={14} />
          Configure
        </Button>
        <Button size="sm" className="gap-2">
          <PlayCircle size={14} />
          Run
        </Button>
      </div>
    </div>
  );
}
