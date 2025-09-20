'use client';

import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-neutral-400">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between px-2">
          {stepTitles.map((title, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            
            return (
              <div
                key={`step-${index}`}
                className={`flex flex-col items-center space-y-2 flex-1 min-w-0 transition-colors duration-200 ${
                  isCompleted ? 'text-primary' : isCurrent ? 'text-white' : 'text-neutral-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-primary text-white shadow-lg ring-2 ring-primary/30'
                      : isCurrent
                      ? 'bg-white text-neutral-900 shadow-xl ring-4 ring-primary/50'
                      : 'bg-neutral-800 text-neutral-400 border-2 border-neutral-600 hover:border-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs text-center max-w-20 truncate font-medium transition-colors duration-200 ${
                  isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-white'
                }`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
