
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestComponentStatusProps {
  title: string;
}

export function TestComponentStatus({ title }: TestComponentStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-md text-center">
          <p>Test component working correctly</p>
          <p className="text-sm text-muted-foreground">This is a fallback component for debugging</p>
        </div>
      </CardContent>
    </Card>
  );
}
