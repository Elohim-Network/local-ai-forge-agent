
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function QuickAction({ title, description, icon: Icon, onClick }: QuickActionProps) {
  return (
    <Card className="bg-card border-border/50 hover:bg-muted/10 transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="rounded-md p-2 bg-muted w-fit">
          <Icon size={18} className="text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-base font-medium mb-1">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
        <Button variant="link" className="p-0 h-auto text-primary mt-2 text-sm">Get started →</Button>
      </CardContent>
    </Card>
  );
}
