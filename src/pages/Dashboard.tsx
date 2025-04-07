
import { useState } from "react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ModelStatus } from "@/components/dashboard/ModelStatus";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, BrainCircuit, Code, Globe, Plus, Workflow } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data for recent projects
  const recentProjects = [
    {
      id: "1",
      name: "Customer Support Agent",
      description: "AI agent that responds to customer inquiries using knowledge base",
      type: "agent" as const,
      updatedAt: "2 hours ago"
    },
    {
      id: "2",
      name: "Product Landing Page",
      description: "Simple landing page for new SaaS product with subscription form",
      type: "web" as const,
      updatedAt: "Yesterday"
    },
    {
      id: "3",
      name: "Content Creation Flow",
      description: "Workflow to generate blog posts with outline, draft, and image creation steps",
      type: "workflow" as const,
      updatedAt: "3 days ago"
    },
    {
      id: "4",
      name: "Database Query Helper",
      description: "Code module to translate natural language to SQL queries",
      type: "code" as const,
      updatedAt: "1 week ago"
    }
  ];
  
  // Mock actions
  const quickActions = [
    {
      title: "Create new agent",
      description: "Build an AI agent with custom capabilities",
      icon: Bot,
      onClick: () => console.log("Create new agent")
    },
    {
      title: "Build a web app",
      description: "Design and deploy a web application",
      icon: Globe,
      onClick: () => console.log("Build a web app")
    },
    {
      title: "Design a workflow",
      description: "Create multi-step automated workflows",
      icon: Workflow,
      onClick: () => console.log("Design a workflow")
    },
    {
      title: "Write code module",
      description: "Author reusable code components",
      icon: Code,
      onClick: () => console.log("Write code module")
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="gap-2">
          <Plus size={16} />
          <span>New Project</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModelStatus
          name="Mistral-7B-v0.2"
          size="4.1GB"
          status="active"
        />
        <ModelStatus
          name="Stable Diffusion XL"
          size="6.8GB"
          status="available"
          activating={false}
        />
        <ModelStatus
          name="Phi-3"
          size="3.8GB"
          status="downloading"
          progress={65}
        />
        <ModelStatus
          name="CodeLlama-7B"
          size="4.3GB"
          status="not-installed"
        />
      </div>
      
      <div>
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Projects</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="agent">Agents</TabsTrigger>
              <TabsTrigger value="web">Web Apps</TabsTrigger>
              <TabsTrigger value="workflow">Workflows</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentProjects
            .filter(project => activeTab === "all" || project.type === activeTab)
            .map(project => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                type={project.type}
                updatedAt={project.updatedAt}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
