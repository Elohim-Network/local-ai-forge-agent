
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Bot, Calendar, Code, Globe, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  type: "agent" | "web" | "workflow" | "code";
  updatedAt: string;
  className?: string;
}

export function ProjectCard({ id, name, description, type, updatedAt, className }: ProjectCardProps) {
  const icons = {
    agent: Bot,
    web: Globe,
    workflow: Calendar,
    code: Code
  };
  
  const Icon = icons[type];
  
  const typeLabels = {
    agent: "AI Agent",
    web: "Web App",
    workflow: "Workflow",
    code: "Code Module"
  };
  
  return (
    <Link to={`/project/${id}`}>
      <Card className={cn(
        "bg-card hover:bg-card/90 transition-colors border-border/50 h-full", 
        className
      )}>
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md p-1.5 bg-muted">
              <Icon size={16} className="text-primary" />
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              {typeLabels[type]}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-medium mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          Updated {updatedAt}
        </CardFooter>
      </Card>
    </Link>
  );
}
