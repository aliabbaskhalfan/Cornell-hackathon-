'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="space-y-6">
        {/* Progress Info */}
        <div className="flex justify-between text-sm text-neutral-400">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>

        {/* Stepper with segmented connectors (circles + in-between bars) */}
        <div>
          {/* Circles and connectors */}
          <div className="flex items-center">
            {(() => {
              const elements: JSX.Element[] = [];
              for (let index = 0; index < stepTitles.length; index += 1) {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                elements.push(
                  <div key={`circle-${index}`} className="relative z-10 flex items-center justify-center h-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : isCurrent
                          ? 'bg-white text-neutral-900 shadow-xl ring-4 ring-primary/50'
                          : 'bg-neutral-700 text-neutral-200 border-2 border-neutral-500'
                      }`}
                    >
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <span
                      className={`absolute top-full mt-2 text-xs text-center max-w-20 truncate font-medium transition-colors duration-200 ${
                        isCompleted ? 'text-primary' : isCurrent ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {stepTitles[index]}
                    </span>
                  </div>
                );

                if (index < stepTitles.length - 1) {
                  elements.push(
                    <div
                      key={`connector-${index}`}
                      className="relative z-0 flex-1 h-2 rounded-full bg-neutral-800"
                      style={{ marginLeft: -20, marginRight: -20 }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: currentStep > index ? '100%' : '0%' }}
                      />
                    </div>
                  );
                }
              }
              return elements;
            })()}
          </div>

          {/* Titles are rendered within each circle container for perfect alignment */}
        </div>
      </div>
    </div>
  );
}
