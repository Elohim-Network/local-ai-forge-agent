
import { ModelInfo, ModuleStatus } from "@/contexts/SystemStatusContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface DiagnosticReportProps {
  models: ModelInfo[];
  modules: ModuleStatus[];
  systemStatus: "operational" | "warning" | "critical";
  lastChecked: Date | null;
}

export function DiagnosticReport({ models, modules, systemStatus, lastChecked }: DiagnosticReportProps) {
  // Count issues
  const modelIssues = models.filter(m => m.status !== "active").length;
  const moduleIssues = modules.filter(m => !m.isActive).length;
  const totalIssues = modelIssues + moduleIssues;
  
  // Get confidence rating based on issues
  const getConfidenceRating = () => {
    if (totalIssues === 0) return { text: "High", color: "text-green-500" };
    if (totalIssues < 3) return { text: "Medium", color: "text-amber-500" };
    return { text: "Low", color: "text-red-500" };
  };
  
  const confidence = getConfidenceRating();
  
  // Format timestamp
  const formatTimestamp = (date: Date | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryItem 
              title="System Status"
              value={systemStatus === "operational" ? "Operational" : systemStatus === "warning" ? "Warning" : "Critical"}
              icon={systemStatus === "operational" ? CheckCircle : systemStatus === "warning" ? AlertTriangle : XCircle}
              iconColor={systemStatus === "operational" ? "text-green-500" : systemStatus === "warning" ? "text-amber-500" : "text-red-500"}
            />
            <SummaryItem 
              title="Issues Detected"
              value={`${totalIssues} issue${totalIssues !== 1 ? 's' : ''}`}
              icon={totalIssues === 0 ? CheckCircle : AlertTriangle}
              iconColor={totalIssues === 0 ? "text-green-500" : "text-amber-500"}
            />
            <SummaryItem 
              title="Last Checked"
              value={formatTimestamp(lastChecked)}
              icon={Clock}
              iconColor="text-blue-500"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detailed Report</h3>
            
            <div className="space-y-2">
              <h4 className="font-medium">Models ({models.length})</h4>
              <ul className="space-y-2 pl-6 list-disc marker:text-muted-foreground">
                {models.map(model => (
                  <li key={model.id} className="text-sm">
                    <span className="font-medium">{model.name}:</span>{" "}
                    {model.status === "active" ? (
                      <span className="text-green-500">Active and running</span>
                    ) : model.status === "downloading" ? (
                      <span className="text-blue-500">Downloading ({model.progress}%)</span>
                    ) : model.status === "available" ? (
                      <span className="text-muted-foreground">Available but not active</span>
                    ) : model.status === "error" ? (
                      <span className="text-red-500">Error - {model.error || "Unknown issue"}</span>
                    ) : (
                      <span className="text-muted-foreground">Not installed</span>
                    )}
                    {model.port && model.status === "active" && (
                      <span className="text-xs text-muted-foreground"> (Port: {model.port})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Modules ({modules.length})</h4>
              <ul className="space-y-2 pl-6 list-disc marker:text-muted-foreground">
                {modules.map(module => (
                  <li key={module.id} className="text-sm">
                    <span className="font-medium">{module.name}:</span>{" "}
                    {module.isActive ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-red-500">{module.error || "Inactive"}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              System Readiness: 
              <span className={confidence.color}>{confidence.text} Confidence</span>
            </h3>
            <p className="text-muted-foreground mt-2">
              {systemStatus === "operational" 
                ? "All systems are operational and ready for use."
                : systemStatus === "warning"
                ? "System is operational but some components require attention."
                : "System requires immediate attention to function properly."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryItemProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
}

function SummaryItem({ title, value, icon: Icon, iconColor }: SummaryItemProps) {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="flex items-center gap-2 mt-1">
        <Icon size={18} className={iconColor} />
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}
