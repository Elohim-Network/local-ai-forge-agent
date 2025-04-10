
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModuleCard } from "@/components/modules/ModuleCard";

const ModulesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Module categories
  const categories = [
    "All", "Business", "Data", "Marketing", "AI", "Developer"
  ];
  
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Business modules data
  const modules = [
    {
      id: "leads",
      name: "Leads Manager",
      description: "Track and manage customer leads and opportunities",
      category: "Business",
      icon: "users",
      status: "available" as "available"
    },
    {
      id: "web-scraper",
      name: "Web Scraper",
      description: "Extract data from websites automatically",
      category: "Data",
      icon: "search",
      status: "available" as "available"
    },
    {
      id: "email-campaign",
      name: "Email Campaign",
      description: "Create and manage email marketing campaigns",
      category: "Marketing",
      icon: "mail",
      status: "available" as "available"
    },
    {
      id: "calendar-tasks",
      name: "Calendar & Tasks",
      description: "Manage appointments and track tasks",
      category: "Business",
      icon: "calendar",
      status: "available" as "available"
    },
    {
      id: "integrations",
      name: "Integrations",
      description: "Connect with third-party services and APIs",
      category: "Developer",
      icon: "link",
      status: "available" as "available"
    },
    {
      id: "ai-podcasting",
      name: "AI Podcasting Studio",
      description: "Create AI-generated podcasts and audio content",
      category: "AI",
      icon: "mic",
      status: "available" as "available"
    },
    {
      id: "chat-interface",
      name: "Chat Interface",
      description: "Interact with AI models through chat",
      category: "AI",
      icon: "message-circle",
      status: "active" as "active"
    },
    {
      id: "stable-diffusion",
      name: "Stable Diffusion",
      description: "Generate images with your local Stable Diffusion model",
      category: "AI",
      icon: "image",
      status: "available" as "available"
    }
  ];
  
  // Filter modules based on search query and category
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || module.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Module Marketplace</h1>
          <p className="text-muted-foreground">Add functionality to your workspace with these modules</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search modules..." 
            className="pl-9 bg-muted/50 border-muted" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge 
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModules.map(module => (
          <ModuleCard
            key={module.id}
            id={module.id}
            name={module.name}
            description={module.description}
            category={module.category}
            icon={module.icon}
            status={module.status}
          />
        ))}
      </div>
    </div>
  );
};

export default ModulesPage;
