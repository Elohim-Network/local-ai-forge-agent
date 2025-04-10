
import { Button } from "@/components/ui/button";
import { Bot, Code, Cpu, Image as ImageIcon, Workflow } from "lucide-react";

export function WorkspaceCanvas() {
  return (
    <div className="h-[calc(100%-3.5rem)] border border-border rounded-lg overflow-hidden glass-panel">
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">Agent Workflow</h3>
          <p className="text-muted-foreground text-sm">
            Design your agent's workflow by adding components and connecting them.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {[
              { name: "Input", icon: Bot },
              { name: "Memory", icon: Cpu },
              { name: "Process", icon: Workflow },
              { name: "Output", icon: ImageIcon },
              { name: "Code", icon: Code }
            ].map(item => (
              <Button 
                key={item.name}
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <item.icon size={14} />
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
