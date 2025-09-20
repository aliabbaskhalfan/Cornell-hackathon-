'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Mic, Volume2 } from 'lucide-react';
import { OnboardingStepProps, CUSTOM_INSTRUCTION_EXAMPLES } from '@/types/onboarding';

export default function CustomInstructions({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {
  const [selectedExample, setSelectedExample] = useState('');

  const handleExampleSelect = (exampleId: string) => {
    const example = CUSTOM_INSTRUCTION_EXAMPLES.find(ex => ex.id === exampleId);
    if (example) {
      const newInstructions = data.customInstructions 
        ? `${data.customInstructions}\n${example.text}`
        : example.text;
      updateData({ customInstructions: newInstructions });
      setSelectedExample('');
    }
  };

  const handleInstructionsChange = (value: string) => {
    if (value.length <= 500) {
      updateData({ customInstructions: value });
    }
  };

  const handleToggleChange = (key: 'liveQA' | 'backgroundAudio', value: boolean) => {
    updateData({ [key]: value });
  };

  const getCharacterCount = () => {
    return data.customInstructions.length;
  };

  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count > 450) return 'text-red-500';
    if (count > 400) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Logo in top left */}
      <div className="flex justify-start">
        <img 
          src="/images/logo.png" 
          alt="CourtSide Logo" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Make it yours</h1>
        <p className="text-lg text-neutral-300">Add personal touches and enable features for your commentator</p>
      </div>

      <div className="space-y-8">
        {/* Custom Instructions */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Custom Instructions</h3>
                <span className={`text-sm ${getCharacterColor()}`}>
                  {getCharacterCount()}/500 characters
                </span>
              </div>
              <Textarea
                placeholder="Example: 'Always mention when someone is shooting poorly', 'Diss the Lakers whenever possible', 'Get excited about defensive plays', 'Call out bad calls by refs'"
                value={data.customInstructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                className="min-h-[120px] resize-none bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                maxLength={500}
              />
              <p className="text-sm text-neutral-400">
                Tell your commentator how to behave, what to focus on, or any specific preferences you have.
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Feature Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Q&A */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mic className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Q&A</h3>
                    <p className="text-sm text-neutral-400">Enable voice questions during games</p>
                  </div>
                </div>
                <Switch
                  checked={data.liveQA}
                  onCheckedChange={(checked) => handleToggleChange('liveQA', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Audio */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Background Audio</h3>
                    <p className="text-sm text-neutral-400">Continue when app not in focus</p>
                  </div>
                </div>
                <Switch
                  checked={data.backgroundAudio}
                  onCheckedChange={(checked) => handleToggleChange('backgroundAudio', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Instructions Preview */}
        {data.customInstructions && (
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Your Custom Instructions</h3>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <p className="text-neutral-300 whitespace-pre-wrap">{data.customInstructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="px-8 bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-none"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="px-8 bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700 transition-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
