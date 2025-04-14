
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Mic, 
  Bot, 
  Briefcase, 
  Network, 
  BarChart, 
  Lock, 
  MessageSquare 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export const ModulePlaceholder = ({ 
  title, 
  description, 
  icon: Icon, 
  comingSoon = true 
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}) => {
  const [isActivating, setIsActivating] = useState(false);
  
  const handleActivate = () => {
    setIsActivating(true);
    
    setTimeout(() => {
      setIsActivating(false);
      
      toast({
        title: `${title} ${comingSoon ? 'Coming Soon' : 'Activated'}`,
        description: comingSoon 
          ? "This module is still in development and will be available soon."
          : `The ${title} module has been activated and is ready to use.`,
      });
    }, 1500);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-gradient-to-br from-background/90 to-background">
        <div className="flex justify-between items-center">
          <Icon className="h-8 w-8 text-primary/80" />
          {comingSoon && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              Coming Soon
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-32 flex items-center justify-center bg-background/30 rounded-md">
          {comingSoon ? (
            <Lock className="h-10 w-10 text-muted-foreground/40" />
          ) : (
            <Icon className="h-12 w-12 text-primary/40" />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={isActivating || comingSoon}
          onClick={handleActivate}
        >
          {isActivating ? "Activating..." : comingSoon ? "Coming Soon" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ElohimModulesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      <ModulePlaceholder
        title="Chat Interface"
        description="Two-way voice and text communication with Elohim AI"
        icon={MessageSquare}
        comingSoon={false}
      />
      <ModulePlaceholder
        title="Ebook Generator"
        description="Create professional ebooks from any content"
        icon={BookOpen}
      />
      <ModulePlaceholder
        title="Podcast Creator"
        description="Convert text to engaging podcast content"
        icon={Mic}
      />
      <ModulePlaceholder
        title="Business Tools"
        description="Automation tools for business workflows"
        icon={Briefcase}
      />
      <ModulePlaceholder
        title="Voice Cloning"
        description="Train custom voices for your content"
        icon={Network}
      />
      <ModulePlaceholder
        title="Analytics Dashboard"
        description="Insights and metrics for your AI usage"
        icon={BarChart}
      />
      <ModulePlaceholder
        title="Agent Creator"
        description="Build and train specialized AI agents"
        icon={Bot}
      />
    </div>
  );
};
