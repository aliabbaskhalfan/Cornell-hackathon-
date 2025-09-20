# Onboarding Flow Documentation

## Overview
This document provides comprehensive information about the onboarding flow implementation for the AI Sports Commentator application. This documentation is designed to help developers understand the structure, components, and integration points when merging with the dashboard page.

## File Structure

```
frontend/
├── components/onboarding/
│   ├── OnboardingContainer.tsx          # Main container component
│   ├── ProgressIndicator.tsx            # Progress bar and step indicators
│   └── steps/
│       ├── TeamSelection.tsx            # Step 1: Team selection
│       ├── CommentaryStyle.tsx          # Step 2: Commentary personality
│       ├── VoicePreferences.tsx         # Step 3: Voice settings
│       ├── CustomInstructions.tsx       # Step 4: Custom instructions
│       └── PreviewConfirm.tsx           # Step 5: Review and confirm
├── types/
│   └── onboarding.ts                    # TypeScript interfaces
├── data/
│   └── nba-teams.ts                     # NBA team data
└── components/ui/                       # UI components (shadcn/ui)
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── progress.tsx
    ├── select.tsx
    ├── slider.tsx
    ├── switch.tsx
    ├── tabs.tsx
    └── textarea.tsx
```

## Core Components

### 1. OnboardingContainer.tsx
**Purpose**: Main orchestrator component that manages the entire onboarding flow.

**Key Features**:
- Manages current step state (0-4)
- Handles data persistence in localStorage
- Controls step navigation (next/previous)
- Renders the appropriate step component
- Provides data and handlers to child components

**Props**:
- `onComplete: (data: OnboardingData) => void` - Callback when onboarding is finished
- `onSkip?: () => void` - Optional callback to skip onboarding

**State Management**:
- `currentStep`: Current step index (0-4)
- `onboardingData`: Complete user preferences object
- `isAnimating`: Controls transition animations

### 2. ProgressIndicator.tsx
**Purpose**: Visual progress indicator showing current step and completion percentage.

**Key Features**:
- Displays step numbers (1-5) with titles
- Shows completion percentage
- Visual states: completed (checkmark), current (highlighted), upcoming (dimmed)
- Responsive design with consistent sizing

**Props**:
- `currentStep: number` - Current step index
- `totalSteps: number` - Total number of steps (5)
- `stepTitles: string[]` - Array of step titles

**Visual States**:
- **Completed**: Primary background with white checkmark
- **Current**: White background with dark text and ring effect
- **Upcoming**: Dark background with neutral text

### 3. Step Components

#### TeamSelection.tsx (Step 1)
**Purpose**: Allows users to select their favorite NBA team.

**Features**:
- Grid layout of NBA team cards
- Team logos with fallback to colored circles
- Team records and information display
- "No Preference" option for neutral fans

**Data Collected**:
- `favoriteTeam: Team | null`

#### CommentaryStyle.tsx (Step 2)
**Purpose**: Customizes the commentator's personality and style.

**Features**:
- Energy Level slider (Chill ↔ Hyped)
- Comedy Level slider (Serious ↔ Comedic)
- Stat Focus slider (Light Stats ↔ Deep Analytics)
- Bias Level slider (Neutral ↔ Team Homer) - only shown if team selected
- Real-time preview of commentary style

**Data Collected**:
- `energyLevel: number` (0-100)
- `comedyLevel: number` (0-100)
- `statFocus: number` (0-100)
- `biasLevel: number` (0-100)

#### VoicePreferences.tsx (Step 3)
**Purpose**: Configures voice and audio settings.

**Features**:
- Voice Gender dropdown (Male/Female/No Preference)
- Voice Speed slider (Slow ↔ Fast)
- Accent/Style dropdown (American, British, Australian, etc.)
- Commentary Frequency dropdown (Every Play/Key Moments/Major Events)

**Data Collected**:
- `voiceGender: string`
- `voiceSpeed: number` (0-100)
- `accent: string`
- `commentaryFrequency: string`

#### CustomInstructions.tsx (Step 4)
**Purpose**: Allows users to add personal instructions and enable features.

**Features**:
- Custom instructions textarea (500 character limit)
- Live Q&A toggle switch
- Background Audio toggle switch
- Character counter with color coding
- Preview of current instructions

**Data Collected**:
- `customInstructions: string`
- `liveQA: boolean`
- `backgroundAudio: boolean`

#### PreviewConfirm.tsx (Step 5)
**Purpose**: Review all settings and confirm before starting.

**Features**:
- Two-column layout: Settings summary + Live preview
- Editable settings with edit buttons
- Sample commentary preview with play button
- Custom instructions display
- Completion confirmation message

**Data Collected**: None (review only)

## Data Types

### OnboardingData Interface
```typescript
interface OnboardingData {
  favoriteTeam: Team | null;
  energyLevel: number;
  comedyLevel: number;
  statFocus: number;
  biasLevel: number;
  voiceGender: string;
  voiceSpeed: number;
  accent: string;
  commentaryFrequency: string;
  customInstructions: string;
  liveQA: boolean;
  backgroundAudio: boolean;
}
```

### Team Interface
```typescript
interface Team {
  id: string;
  city: string;
  name: string;
  abbreviation: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  record: {
    wins: number;
    losses: number;
  };
}
```

## Styling Guidelines

### Dark Theme Implementation
All components use a consistent dark theme:
- **Background**: `bg-neutral-900` (main background)
- **Cards**: `bg-neutral-800 border-neutral-700`
- **Text**: `text-white` (headings), `text-neutral-300` (subheadings), `text-neutral-400` (body)
- **Interactive Elements**: `bg-neutral-700 border-neutral-600` with hover states

### Component Styling
- **Cards**: Consistent dark background with subtle borders
- **Buttons**: Dark theme with proper hover states
- **Form Elements**: Dark backgrounds with white text
- **Progress Indicator**: White text for all step titles for visibility

## Integration Points

### 1. Main App Integration
The onboarding flow should be integrated into the main app as follows:

```typescript
// In your main app component
const [showOnboarding, setShowOnboarding] = useState(false);
const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

// Check if onboarding is needed
useEffect(() => {
  const isCompleted = localStorage.getItem('onboarding-completed');
  if (!isCompleted) {
    setShowOnboarding(true);
  }
}, []);

// Handle onboarding completion
const handleOnboardingComplete = (data: OnboardingData) => {
  setOnboardingData(data);
  setShowOnboarding(false);
  // Redirect to dashboard or main app
};

// Render onboarding if needed
if (showOnboarding) {
  return <OnboardingContainer onComplete={handleOnboardingComplete} />;
}
```

### 2. Data Persistence
- Data is automatically saved to localStorage during the flow
- Key: `'onboarding-data'` - contains the complete OnboardingData object
- Completion flag: `'onboarding-completed'` - set to 'true' when finished

### 3. Navigation Integration
- Each step has Previous/Next buttons
- Step 1: Previous button disabled
- Step 5: Next button says "Start Experience"
- Optional skip functionality available

## Dependencies

### Required UI Components (shadcn/ui)
- Card, CardContent
- Button
- Slider
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Textarea
- Switch
- Badge
- Progress

### Required Icons (lucide-react)
- Play, Volume2, Mic
- Check, Edit3, CheckCircle
- Lightbulb

### Required Data
- NBA teams data in `data/nba-teams.ts`
- Custom instruction examples in `types/onboarding.ts`

## Testing Considerations

### Manual Testing Checklist
- [ ] All steps navigate correctly (next/previous)
- [ ] Data persists when navigating between steps
- [ ] Progress indicator updates correctly
- [ ] All form elements work properly
- [ ] Dark theme is consistent across all pages
- [ ] Responsive design works on different screen sizes
- [ ] Skip functionality works (if implemented)
- [ ] Completion redirects to main app

### Data Validation
- Character limits are enforced (500 for custom instructions)
- Slider values are within bounds (0-100)
- Required selections are validated before proceeding

## Common Issues and Solutions

### 1. Step Navigation Issues
- Ensure `currentStep` state is properly managed
- Check that step components receive correct props
- Verify animation states don't interfere with navigation

### 2. Data Persistence Issues
- Check localStorage availability
- Ensure data is properly serialized/deserialized
- Handle cases where localStorage is disabled

### 3. Styling Inconsistencies
- Ensure all components use the dark theme classes
- Check that text colors have proper contrast
- Verify responsive design works across breakpoints

## Future Enhancements

### Potential Improvements
1. **Animation Enhancements**: Add more sophisticated transitions between steps
2. **Validation**: Add real-time validation with error messages
3. **Accessibility**: Improve keyboard navigation and screen reader support
4. **Mobile Optimization**: Enhance mobile-specific interactions
5. **Analytics**: Add tracking for user preferences and completion rates

### Integration with Dashboard
When merging with the dashboard:
1. Ensure the onboarding data is accessible to the main app
2. Consider adding a way to re-run onboarding from settings
3. Implement proper error handling for missing data
4. Add loading states during data fetching

## Conclusion

This onboarding flow provides a comprehensive user setup experience with consistent dark theme styling and intuitive navigation. The modular component structure makes it easy to maintain and extend. When integrating with the dashboard, ensure proper data flow and state management to provide a seamless user experience.
