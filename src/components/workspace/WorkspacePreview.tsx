
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bot, Send, Zap, Shield, Monitor, Smartphone, Tablet } from "lucide-react";

export function WorkspacePreview() {
  return (
    <div className="h-full border-l border-border/30 p-4 bg-gradient-to-br from-background to-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2 text-primary">
          <Monitor size={16} className="text-primary" />
          <span>Preview</span>
        </h3>
        <Select defaultValue="mobile">
          <SelectTrigger className="w-[130px] bg-card/60 border-border/40">
            <SelectValue placeholder="Preview mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desktop"><div className="flex items-center gap-2"><Monitor size={14} /> Desktop</div></SelectItem>
            <SelectItem value="tablet"><div className="flex items-center gap-2"><Tablet size={14} /> Tablet</div></SelectItem>
            <SelectItem value="mobile"><div className="flex items-center gap-2"><Smartphone size={14} /> Mobile</div></SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-background/50 rounded-lg border border-primary/20 h-[calc(100%-3rem)] p-4 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
        <div className="w-full max-w-sm h-[520px] bg-card rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(0,179,255,0.1)] transform perspective-[1000px] rotate-y-[-1deg] rotate-x-[1deg]">
          <div className="h-12 border-b border-border/30 flex items-center px-4 bg-gradient-to-r from-card to-background">
            <Shield className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium">ELOHIM</span>
            <span className="text-xs ml-2 text-muted-foreground font-mono">v1.0.3</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150"></div>
            </div>
          </div>
          
          <div className="h-[calc(100%-6rem)] p-4 overflow-y-auto bg-card/80 space-y-4">
            <div className="flex space-y-4 flex-col">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20">
                  <Bot size={16} className="text-primary" />
                </div>
                <div className="bg-muted/70 p-3 rounded-lg rounded-tl-none max-w-[85%] backdrop-blur-sm border border-border/20">
                  <p className="text-sm">Welcome to Elohim. How may I assist you today?</p>
                  <div className="text-xs mt-1 opacity-70 text-right text-muted-foreground">
                    08:42
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                  <div className="w-4 h-4 rounded-full bg-primary/80"></div>
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[85%]">
                  <p className="text-sm">I need assistance with the new quantum encryption protocol.</p>
                  <div className="text-xs mt-1 opacity-70 text-right text-primary-foreground/70">
                    08:43
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20">
                  <Bot size={16} className="text-primary" />
                </div>
                <div className="bg-muted/70 p-3 rounded-lg rounded-tl-none max-w-[85%] backdrop-blur-sm border border-border/20">
                  <p className="text-sm">I've analyzed the quantum encryption protocol. The key distribution method uses entangled particles for secure communication. Would you like me to explain the implementation steps?</p>
                  <div className="text-xs mt-1 opacity-70 text-right text-muted-foreground">
                    08:44
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-12 border-t border-border/30 p-2 flex items-center gap-2 bg-card/90">
            <input 
              className="flex-1 bg-muted/30 border-none text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" 
              placeholder="Type your message..."
            />
            <Button size="sm" className="h-8 w-8 p-0 bg-primary/90 hover:bg-primary text-primary-foreground">
              <Send size={14} />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Zap size={14} className="text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
