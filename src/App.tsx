
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { SystemStatusProvider } from "./contexts/SystemStatusContext";
import { ModuleLoader } from "./modules";
import Dashboard from "./pages/Dashboard";
import ModelsPage from "./pages/ModelsPage";
import WorkspacePage from "./pages/WorkspacePage";
import ModulesPage from "./pages/ModulesPage";
import ChatPage from "./pages/ChatPage";
import ModelConnectionPage from "./pages/ModelConnectionPage";
import PodcastingStudioPage from "./pages/modules/PodcastingStudioPage";
import WebScraperPage from "./pages/modules/WebScraperPage";
import DiagnosticAgentPage from "./pages/DiagnosticAgentPage";
import NotFoundUpdated from "./pages/NotFoundUpdated";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SystemStatusProvider>
        {/* Load all system modules */}
        <ModuleLoader />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/project/:id" element={<WorkspacePage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/model-connection" element={<ModelConnectionPage />} />
              <Route path="/diagnostic-agent" element={<DiagnosticAgentPage />} />
              <Route path="/modules/ai-podcasting" element={<PodcastingStudioPage />} />
              <Route path="/modules/web-scraper" element={<WebScraperPage />} />
              {/* Add empty placeholder routes for navigation */}
              <Route path="/agents" element={<ComingSoon title="AI Agents" />} />
              <Route path="/workflows" element={<ComingSoon title="Workflows" />} />
              <Route path="/web-apps" element={<ComingSoon title="Web Apps" />} />
              <Route path="/components" element={<ComingSoon title="UI Components" />} />
              <Route path="/modules/leads" element={<ComingSoon title="Leads Manager" />} />
              <Route path="/modules/email-campaign" element={<ComingSoon title="Email Campaign" />} />
              <Route path="/modules/calendar-tasks" element={<ComingSoon title="Calendar & Tasks" />} />
              <Route path="/modules/integrations" element={<ComingSoon title="Integrations" />} />
              <Route path="/resources" element={<ComingSoon title="Resources" />} />
              <Route path="/settings" element={<ComingSoon title="Settings" />} />
            </Route>
            <Route path="*" element={<NotFoundUpdated />} />
          </Routes>
        </BrowserRouter>
      </SystemStatusProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Temporary component for routes not yet implemented
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[70vh]">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground text-center max-w-md">
      This section is under development. Check back soon for updates!
    </p>
  </div>
);

export default App;
