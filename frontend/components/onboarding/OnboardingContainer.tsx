'use client';

import { useState, useEffect } from 'react';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import ProgressIndicator from './ProgressIndicator';
import TeamSelection from './steps/TeamSelection';
import CommentaryStyle from './steps/CommentaryStyle';
import VoicePreferences from './steps/VoicePreferences';
import CustomInstructions from './steps/CustomInstructions';
import PreviewConfirm from './steps/PreviewConfirm';

const STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: 'Team',
    description: 'Choose your favorite NBA team',
    component: TeamSelection
  },
  {
    id: 1,
    title: 'Style',
    description: 'Customize commentator personality',
    component: CommentaryStyle
  },
  {
    id: 2,
    title: 'Voice',
    description: 'Select voice preferences',
    component: VoicePreferences
  },
  {
    id: 3,
    title: 'Custom',
    description: 'Add personal instructions',
    component: CustomInstructions
  },
  {
    id: 4,
    title: 'Preview',
    description: 'Review and confirm settings',
    component: PreviewConfirm
  }
];

const INITIAL_DATA: OnboardingData = {
  favoriteTeam: null,
  energyLevel: 50,
  comedyLevel: 25,
  statFocus: 50,
  biasLevel: 50,
  voiceGender: 'male',
  voiceSpeed: 50,
  accent: 'american',
  commentaryFrequency: 'key-moments',
  customInstructions: '',
  liveQA: true,
  backgroundAudio: true
};

interface OnboardingContainerProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

export default function OnboardingContainer({ onComplete, onSkip }: OnboardingContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(INITIAL_DATA);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOnboardingData({ ...INITIAL_DATA, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding-data', JSON.stringify(onboardingData));
  }, [onboardingData]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      // Complete onboarding
      localStorage.setItem('onboarding-completed', 'true');
      onComplete(onboardingData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Welcome to Courtside
          </h1>
          <p className="text-xl text-neutral-300">
            Let's personalize your commentary experience
          </p>
          {onSkip && (
            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-neutral-400 hover:text-neutral-300 underline transition-colors duration-200"
            >
              Skip setup for now
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={STEPS.length}
          stepTitles={STEPS.map(step => step.title)}
        />

        {/* Step Content */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
          <CurrentStepComponent
            data={onboardingData}
            updateData={updateData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === STEPS.length - 1}
          />
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentStep
                  ? 'bg-primary scale-125'
                  : index < currentStep
                  ? 'bg-primary/60'
                  : 'bg-neutral-600 hover:bg-neutral-500'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
