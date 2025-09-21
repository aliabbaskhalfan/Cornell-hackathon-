'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Mic, Volume2, LineChart } from 'lucide-react';
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

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const isInstructionSelected = (text: string) => {
    return (data.customInstructions || '').includes(text);
  };

  const toggleInstruction = (exampleId: string) => {
    const example = CUSTOM_INSTRUCTION_EXAMPLES.find(ex => ex.id === exampleId);
    if (!example) return;
    const current = (data.customInstructions || '').trim();
    const exists = current.includes(example.text);
    let next = current;
    if (exists) {
      const pattern = new RegExp(`(^|\\n)${escapeRegExp(example.text)}(\\n|$)`);
      next = next.replace(pattern, (match, before, after) => (before && after ? '\\n' : ''));
      next = next.replace(/\n{2,}/g, '\\n').trim();
    } else {
      const additionalLength = (next ? 1 : 0) + example.text.length; // include newline if needed
      if (next.length + additionalLength > 500) {
        return; // prevent exceeding max length
      }
      next = next ? `${next}\n${example.text}` : example.text;
    }
    updateData({ customInstructions: next });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Make it yours</h1>
        <p className="text-lg text-neutral-300">Add personal touches and enable features for your commentator</p>
      </div>

      <div className="space-y-8">
        {/* Fantasy Info */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <LineChart className="h-6 w-6 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Fantasy Alerts</h3>
                  <p className="text-sm text-neutral-400">Provide fantasy team context to get tailored updates</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm text-neutral-300 mb-2">Platform</label>
                  <Select
                    value={data.fantasyInfo?.league || ''}
                    onValueChange={(val) => updateData({ fantasyInfo: { ...(data.fantasyInfo || {}), league: val as any } })}
                  >
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="Yahoo">Yahoo</SelectItem>
                      <SelectItem value="ESPN">ESPN</SelectItem>
                      <SelectItem value="Sleeper">Sleeper</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Notes (players, league settings, etc.)</label>
                <Textarea
                  placeholder="List your key players or custom rules to watch for"
                  value={data.fantasyInfo?.notes || ''}
                  onChange={(e) => updateData({ fantasyInfo: { ...(data.fantasyInfo || {}), notes: e.target.value } })}
                  className="min-h-[80px] resize-none bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Quick presets</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CUSTOM_INSTRUCTION_EXAMPLES.map((ex) => (
                    <label key={ex.id} className="flex items-start space-x-2 bg-neutral-700/50 rounded-md p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-neutral-500 bg-neutral-800 text-neutral-100 focus:ring-0"
                        checked={isInstructionSelected(ex.text)}
                        onChange={() => toggleInstruction(ex.id)}
                      />
                      <div>
                        <div className="text-sm text-white font-medium">{ex.category}</div>
                        <div className="text-xs text-neutral-300">{ex.description}</div>
                        <div className="text-xs text-neutral-400 italic mt-1">“{ex.text}”</div>
                      </div>
                    </label>
                  ))}
                </div>
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
