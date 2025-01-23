import React from 'react';

interface InstallProgressProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

export function InstallProgress({ currentStep, totalSteps, stepName }: InstallProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">Step {currentStep + 1} of {totalSteps}</span>
        <span className="text-sm text-red-400">{stepName}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}