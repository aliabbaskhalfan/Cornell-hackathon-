# Courtside Onboarding Flow

A comprehensive, multi-step onboarding experience built with React, TypeScript, and shadcn/ui components for personalizing the Courtside sports commentator experience.

## Features

### 🏀 Step 1: NBA Team Selection
- Grid display of all 30 NBA teams with official logos
- Team cards showing city, name, and current season record
- Search functionality for quick team finding
- Option to select "No favorite team / Neutral fan"
- Team colors theme the rest of the onboarding flow

### 🎭 Step 2: Commentary Style & Personality
- **Energy Level**: Chill ←→ Hyped slider
- **Comedy Level**: Serious ←→ Comedic slider  
- **Stat Focus**: Light Stats ←→ Deep Analytics slider
- **Bias Level**: Neutral ←→ Team Homer slider (only shown if team selected)
- Live audio preview with current settings

### 🎤 Step 3: Voice & Audio Preferences
- **Voice Gender**: Male / Female / No Preference
- **Voice Speed**: Slow ←→ Fast slider
- **Accent/Style**: American, British, Australian, Southern US, New York
- **Commentary Frequency**: Every Play / Key Moments / Major Events
- Audio preview for each voice option

### ✏️ Step 4: Custom Instructions & Features
- Large text area for personal commentary preferences (500 char limit)
- Quick example dropdown with popular instructions
- **Live Q&A**: Enable voice questions during games
- **Background Audio**: Continue when app not in focus
- Real-time character count with color coding

### ✅ Step 5: Preview & Confirmation
- Complete summary of all selections
- Live preview with sample commentary
- Edit buttons for each section to go back
- Final confirmation with personalized welcome message

## Technical Implementation

### Architecture
```
components/onboarding/
├── OnboardingContainer.tsx     # Main flow controller
├── ProgressIndicator.tsx       # Step progress display
└── steps/
    ├── TeamSelection.tsx       # NBA team picker
    ├── CommentaryStyle.tsx     # Personality sliders
    ├── VoicePreferences.tsx    # Voice & audio settings
    ├── CustomInstructions.tsx  # Custom instructions & features
    └── PreviewConfirm.tsx      # Final review & confirmation
```

### State Management
- React hooks for local state management
- localStorage for persistence across sessions
- TypeScript interfaces for type safety
- Real-time validation and character limits

### UI Components
- **shadcn/ui**: Card, Button, Slider, Select, Textarea, Switch, Badge, Progress
- **Lucide React**: Icons for visual enhancement
- **Tailwind CSS**: Responsive design and NBA-themed styling
- **Framer Motion**: Smooth animations and transitions

### Data Structure
```typescript
interface OnboardingData {
  favoriteTeam: NBATeam | null;
  energyLevel: number;           // 0-100
  comedyLevel: number;           // 0-100
  statFocus: number;             // 0-100
  biasLevel: number;             // 0-100
  voiceGender: 'male' | 'female' | 'no-preference';
  voiceSpeed: number;            // 0-100
  accent: 'american' | 'british' | 'australian' | 'southern' | 'new-york';
  commentaryFrequency: 'every-play' | 'key-moments' | 'major-events';
  customInstructions: string;
  liveQA: boolean;
  backgroundAudio: boolean;
}
```

## Usage

### Accessing the Onboarding Flow
1. **First-time users**: Automatically prompted on app load
2. **Direct access**: Navigate to `/onboarding`
3. **Skip option**: Available for users who want to configure later

### Navigation
- **Progress indicator**: Shows current step and completion percentage
- **Step dots**: Click to jump between steps
- **Previous/Next buttons**: Navigate sequentially
- **Edit buttons**: In preview step to modify any section

### Persistence
- **Auto-save**: Progress saved to localStorage on each change
- **Resume**: Users can return and continue where they left off
- **Completion**: Marked in localStorage to prevent re-prompting

## Customization

### Adding New Steps
1. Create new component in `steps/` directory
2. Add to `STEPS` array in `OnboardingContainer.tsx`
3. Update `OnboardingData` interface if needed
4. Add step title to progress indicator

### Styling
- **Team colors**: Automatically applied when team is selected
- **Responsive design**: Mobile-first approach with breakpoints
- **Accessibility**: Full keyboard navigation and screen reader support
- **Animations**: Smooth transitions between steps

### NBA Team Data
- All 30 teams with official logos and colors
- Current season records
- Fallback styling for missing logos
- Search and filter functionality

## Development

### Prerequisites
- Node.js 18+
- Next.js 14+
- TypeScript 5+
- Tailwind CSS 3+

### Running the Application
```bash
cd frontend
npm install
npm run dev
```

### Key Dependencies
- `@radix-ui/react-*`: Accessible UI primitives
- `lucide-react`: Icon library
- `tailwindcss`: Utility-first CSS
- `class-variance-authority`: Component variants
- `clsx`: Conditional className utility

## Future Enhancements

- [ ] Voice synthesis integration for real audio previews
- [ ] Advanced team rivalry detection
- [ ] Personalized recommendation engine
- [ ] A/B testing for onboarding optimization
- [ ] Analytics tracking for completion rates
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels, focus management)
- [ ] Mobile app integration
- [ ] Social sharing of commentator preferences
