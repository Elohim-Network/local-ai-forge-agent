
import React from "react";

interface DebugToggleProps {
  useTestComponents: boolean;
  setUseTestComponents: (value: boolean) => void;
}

export function DebugToggle({ useTestComponents, setUseTestComponents }: DebugToggleProps) {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium">Debug Mode:</span>
      <button 
        onClick={() => setUseTestComponents(!useTestComponents)}
        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
      >
        {useTestComponents ? "Using Test Components" : "Using Real Components"}
      </button>
    </div>
  );
}
