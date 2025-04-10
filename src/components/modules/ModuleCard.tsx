
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, Link, Mail, MessageCircle, Mic, Search, Users, Image } from "lucide-react";

interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: "active" | "available" | "coming-soon";
}

export function ModuleCard({ id, name, description, category, icon, status }: ModuleCardProps) {
  const navigate = useNavigate();
  
  // Map of icon strings to Lucide components
  const iconMap = {
    "users": Users,
    "search": Search,
    "mail": Mail,
    "calendar": Calendar,
    "link": Link,
    "mic": Mic,
    "message-circle": MessageCircle,
    "image": Image
  };
  
  // Get the icon component from the map
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users;
  
  // Background color variants based on category
  const getBgColor = (category: string) => {
    switch(category) {
      case "Business": return "bg-blue-500/10 text-blue-500";
      case "Data": return "bg-green-500/10 text-green-500";
      case "Marketing": return "bg-purple-500/10 text-purple-500";
      case "AI": return "bg-primary/10 text-primary";
      case "Developer": return "bg-orange-500/10 text-orange-500";
      default: return "bg-secondary/10 text-secondary";
    }
  };
  
  const handleClick = () => {
    if (status === "active" || status === "available") {
      // Navigate to the module page
      navigate(`/modules/${id}`);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getBgColor(category)}`}>
            <IconComponent size={20} />
          </div>
          
          <Badge
            variant={status === "active" ? "default" : status === "available" ? "outline" : "secondary"}
            className={
              status === "active" 
                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600/10" 
                : status === "available" 
                  ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-600/10"
                  : "bg-muted text-muted-foreground"
            }
          >
            {status === "active" ? "Active" : status === "available" ? "Available" : "Coming Soon"}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="bg-muted/50">
          {category}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={status === "coming-soon" ? "outline" : "default"}
          disabled={status === "coming-soon"}
          onClick={handleClick}
        >
          {status === "active" ? "Open Module" : status === "available" ? "Install Module" : "Coming Soon"}
        </Button>
      </CardFooter>
    </Card>
  );
}
