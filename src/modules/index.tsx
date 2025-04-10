
import React from 'react';
import DiagnosticAgentModule from '@/components/diagnostic/DiagnosticAgentModule';

export function ModuleLoader() {
  return (
    <>
      {/* Load all system modules here */}
      <DiagnosticAgentModule />
      {/* Add more modules as they are created */}
    </>
  );
}
