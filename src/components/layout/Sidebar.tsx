
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Settings, 
  Home, 
  BrainCircuit, 
  Bot, 
  Layout, 
  Globe, 
  Workflow, 
  Layers, 
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const navItems = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "AI Models", icon: BrainCircuit, path: "/models" },
    { name: "Agents", icon: Bot, path: "/agents" },
    { name: "Workflows", icon: Workflow, path: "/workflows" },
    { name: "Web Apps", icon: Globe, path: "/web-apps" },
    { name: "UI Components", icon: Layout, path: "/components" },
    { name: "Code Modules", icon: Code, path: "/modules" },
    { name: "Resources", icon: Layers, path: "/resources" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary animate-pulse-subtle"></div>
            <span className="font-bold text-lg">LocalForge</span>
          </div>
        )}
        {collapsed && <div className="h-6 w-6 mx-auto rounded bg-primary animate-pulse-subtle"></div>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link 
            key={item.name}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              "hover:bg-sidebar-accent focus-ring",
              location.pathname === item.path 
                ? "bg-sidebar-accent text-sidebar-foreground" 
                : "text-sidebar-foreground/80"
            )}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <Button 
          className={cn(
            "w-full bg-primary text-primary-foreground hover:bg-primary/90",
            collapsed ? "px-0 justify-center" : ""
          )}
        >
          <Plus size={18} />
          {!collapsed && <span className="ml-2">New Project</span>}
        </Button>
      </div>
    </div>
  );
}
