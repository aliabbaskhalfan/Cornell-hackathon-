# Courtside Onboarding Flow

Build a multi-step onboarding flow for an NBA Courtside sports commentator app. This should be a smooth, engaging experience that collects user preferences to personalize their commentary experience.

## Overall Design Requirements

- Modern, NBA-themed UI with clean design
- Progressive disclosure - one preference category per step
- Visual previews/examples for each option
- Progress indicator showing steps completed
- Ability to go back and modify previous choices
- Final summary/preview before completing setup

## Step 1: NBA Team Selection

**Screen Title:** "Pick your team!"

- Grid of all 30 NBA teams with official logos
- Team cards with:
  - Team logo and colors
  - Team name and city
  - Current season record
  - Hover effects with team colors
- Search functionality for quick team finding
- Option to select "No favorite team / Neutral fan"
- Team colors should theme the rest of the onboarding flow

## Step 2: Commentary Style & Personality

**Screen Title:** "Customize your commentator"

Simple personality sliders (no preset archetypes):

- **Energy Level:** Chill ←→ Hyped (slider)
- **Comedy Level:** Serious ←→ Comedic (slider)
- **Stat Focus:** Light Stats ←→ Deep Analytics (slider)
- **Bias Level:** Neutral ←→ Team Homer (slider - only if team selected in step 1)

Include audio preview button that generates sample commentary using current slider settings

## Step 3: Voice & Audio Preferences

**Screen Title:** "Choose your commentator voice"

- **Voice Gender:** Male / Female / No Preference
- **Voice Speed:** Slow ←→ Fast (slider)
- **Accent/Style:**
  - American Standard
  - British
  - Australian
  - Regional US variants
- **Commentary Frequency:**
  - Every Play (constant)
  - Key Moments Only (selective)
  - Major Events Only (minimal)

Audio preview button for each voice option

## Step 4: Custom Instructions & Features

**Screen Title:** "Make it yours"

- **Custom Instructions:** Large text area for personal commentary preferences
  - Placeholder text: "Example: 'Always mention when someone is shooting poorly', 'Diss the Lakers whenever possible', 'Get excited about defensive plays', 'Call out bad calls by refs'"
  - Character limit: 500 characters
  - Examples button that shows common custom instructions
- **Live Q&A:** Enable voice questions during games (toggle)
- **Background Audio:** Continue when app not in focus (toggle)

## Step 5: Preview & Confirmation

**Screen Title:** "Ready to go live!"

- Summary card of all selections
- Live preview with sample commentary using their preferences
- "Edit" buttons for each section to go back
- Sample voice saying: "Welcome to your personalized sports experience, [name]! Based on your preferences, I'll be your [style] commentator for [teams]. Let's get started!"

## Technical Implementation Notes

### State Management

```javascript
const [onboardingData, setOnboardingData] = useState({
  favoriteTeam: null, // NBA team object or null for neutral
  energyLevel: 50,
  comedyLevel: 25,
  statFocus: 50,
  biasLevel: 50, // only shown if team selected
  voiceGender: 'male',
  voiceSpeed: 50,
  accent: 'american',
  commentaryFrequency: 'keyMoments',
  customInstructions: '',
  liveQA: true,
  backgroundAudio: true
});
```

### Component Structure

```
OnboardingFlow/
├── OnboardingContainer.jsx (main flow logic)
├── ProgressIndicator.jsx 
├── steps/
│   ├── TeamSelection.jsx
│   ├── CommentaryStyle.jsx  
│   ├── VoicePreferences.jsx
│   ├── CustomInstructions.jsx
│   └── PreviewConfirm.jsx
├── components/
│   ├── NBATeamCard.jsx
│   ├── PersonalitySlider.jsx
│   ├── VoicePlayer.jsx
│   ├── CustomInstructionsBox.jsx
│   └── PreferenceToggle.jsx
```

## NBA Team Data

- Include all 30 NBA teams with official logos, colors, and current records
- Team cards should use official NBA team colors as accent colors
- Popular custom instruction examples specific to teams:
  - "Always hype up Steph Curry's three-pointers"
  - "Mention when LeBron is chasing records"
  - "Get excited about Giannis dunks"
  - "Call out whenever the Lakers get favorable calls"
  - "Celebrate Celtics defense"

## Custom Instructions Examples

Provide a dropdown of popular examples users can select:

- **Rivalries:** "Always diss [rival team] when they mess up"
- **Player Focus:** "Get extra excited when [favorite player] makes plays"
- **Play Style:** "Emphasize defensive plays over offense"
- **Refs:** "Call out bad officiating"
- **Analytics:** "Always mention advanced stats like True Shooting %"
- **Trash Talk:** "Be petty about opposing team mistakes"

## Visual Design Guidelines

- Use team colors when teams are selected
- Sport-specific icons and imagery
- Card-based layout with smooth transitions
- Mobile-first responsive design
- Accessibility: proper labels, keyboard navigation, screen reader support

## Microinteractions

- Smooth page transitions (slide/fade effects)
- Button hover states with sports-themed colors
- Audio waveform animations during voice previews
- Confetti/celebration animation on completion
- Loading states with sports-themed spinners

## Implementation Notes

Build this as a React component with TypeScript, using Tailwind for styling. Include proper error handling and validation for each step.

### Key Features to Implement:

1. **Responsive Design:** Ensure the onboarding works seamlessly on mobile and desktop
2. **Accessibility:** Full keyboard navigation and screen reader support
3. **Performance:** Lazy loading of voice previews and smooth animations
4. **Validation:** Real-time validation for each step before proceeding
5. **Persistence:** Save progress locally in case user needs to return later
6. **Error Handling:** Graceful handling of audio loading failures and network issues

### Technical Considerations:

- Use React Context or Redux for state management across steps
- Implement proper TypeScript interfaces for all data structures
- Use Framer Motion or similar for smooth animations
- Integrate with audio APIs for voice previews
- Implement proper loading states and error boundaries
- Use React Hook Form for form validation and management
