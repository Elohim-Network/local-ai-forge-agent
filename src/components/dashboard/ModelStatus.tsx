
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, X } from "lucide-react";

interface ModelCardProps {
  name: string;
  size: string;
  status: "active" | "downloading" | "available" | "not-installed";
  progress?: number;
  activating?: boolean;
}

export function ModelStatus({ name, size, status, progress = 0, activating = false }: ModelCardProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">{name}</CardTitle>
          <div className="text-xs text-muted-foreground">{size}</div>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        {status === "downloading" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">{progress}% Downloaded</div>
          </div>
        )}
        
        {status === "active" && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-green-500">Running on localhost:8000</div>
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <RefreshCw size={12} />
              <span>Restart</span>
            </Button>
          </div>
        )}
        
        {status === "available" && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Available locally</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7"
              disabled={activating}
            >
              {activating ? "Activating..." : "Activate"}
            </Button>
          </div>
        )}
        
        {status === "not-installed" && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Not installed</div>
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <Download size={12} />
              <span>Download</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10">Active</Badge>;
    case "downloading":
      return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600/10">Downloading</Badge>;
    case "available":
      return <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/10">Available</Badge>;
    case "not-installed":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Not Installed</Badge>;
    default:
      return null;
  }
}
