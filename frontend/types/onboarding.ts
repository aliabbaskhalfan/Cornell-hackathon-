export interface NBATeam {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  record: {
    wins: number;
    losses: number;
  };
}

export interface OnboardingData {
  favoriteTeam: NBATeam | null;
  energyLevel: number; // 0-100
  comedyLevel: number; // 0-100
  statFocus: number; // 0-100
  biasLevel: number; // 0-100 (only shown if team selected)
  voiceGender: 'male' | 'female' | 'no-preference';
  voiceSpeed: number; // 0-100
  accent: 'american' | 'british' | 'australian' | 'southern' | 'new-york';
  commentaryFrequency: 'every-play' | 'key-moments' | 'major-events';
  language?: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ja' | 'ko' | 'zh';
  customInstructions: string;
  liveQA: boolean;
  backgroundAudio: boolean;
  fantasyInfo?: {
    league?: 'Yahoo' | 'ESPN' | 'Sleeper' | 'Other';
    notes?: string;
  };
}

export interface OnboardingStep {
  id: number;
  title: string;
  description?: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep?: (index: number) => void;
}

export interface CustomInstructionExample {
  id: string;
  category: string;
  text: string;
  description: string;
}

export const CUSTOM_INSTRUCTION_EXAMPLES: CustomInstructionExample[] = [
  {
    id: 'rivalries',
    category: 'Rivalries',
    text: 'Always diss [rival team] when they mess up',
    description: 'Add some friendly rivalry banter'
  },
  {
    id: 'player-focus',
    category: 'Player Focus',
    text: 'Get extra excited when [favorite player] makes plays',
    description: 'Highlight your favorite players'
  },
  {
    id: 'defense',
    category: 'Play Style',
    text: 'Emphasize defensive plays over offense',
    description: 'Focus on the defensive side of the game'
  },
  {
    id: 'refs',
    category: 'Officiating',
    text: 'Call out bad officiating',
    description: 'Keep the refs accountable'
  },
  {
    id: 'analytics',
    category: 'Analytics',
    text: 'Always mention advanced stats like True Shooting %',
    description: 'Add some statistical depth'
  },
  {
    id: 'trash-talk',
    category: 'Trash Talk',
    text: 'Be petty about opposing team mistakes',
    description: 'Add some playful trash talk'
  }
];
