# NBA Sports Commentator - Design System Guide

## 🎨 Core Design Philosophy

Your application follows a **dark-first sports-focused design** with a modern, clean aesthetic similar to Google Sports. The design emphasizes:
- High contrast for readability
- Sports team branding integration
- Live/real-time visual indicators
- Consistent spacing and typography
- Professional yet engaging interface

## 🌙 Color Scheme & Theme

### Primary Color Palette
```css
/* Dark theme (default) */
--background: 222.2 84% 4.9%        /* Very dark blue-gray */
--foreground: 210 40% 98%           /* Near white */
--primary: 217.2 91.2% 59.8%        /* Bright blue */
--secondary: 217.2 32.6% 17.5%      /* Dark blue-gray */
--muted: 217.2 32.6% 17.5%          /* Same as secondary */
--accent: 217.2 32.6% 17.5%         /* Same as secondary */
--destructive: 0 62.8% 30.6%        /* Dark red */
--border: 217.2 32.6% 17.5%         /* Dark blue-gray */
```

### Key Background Colors
- **Main Background**: `bg-neutral-900` (very dark)
- **Card/Component Backgrounds**: `bg-neutral-800` or use CSS custom properties
- **Header/Navigation**: `bg-neutral-900`
- **Hover States**: `hover:bg-neutral-800/50` or `hover:bg-neutral-800/30`

### Text Colors
- **Primary Text**: `text-white`
- **Secondary Text**: `text-neutral-300`
- **Muted Text**: `text-neutral-400`
- **Very Muted**: `text-neutral-500`

## 🏀 Sports Team Colors

### Team Badge Colors (Consistent Pattern)
```javascript
const teamColors = {
  'LAL': 'bg-purple-100 text-purple-800',  // Lakers - Purple
  'GSW': 'bg-blue-100 text-blue-800',      // Warriors - Blue
  'MIL': 'bg-green-100 text-green-800',    // Bucks - Green
  'BOS': 'bg-green-100 text-green-800',    // Celtics - Green
  'DAL': 'bg-blue-100 text-blue-800',      // Mavericks - Blue
  // Default fallback
  'default': 'bg-gray-100 text-gray-800'
}
```

### Position Badge Colors
```javascript
const positionColors = {
  'PG': 'bg-blue-100 text-blue-800',     // Point Guard - Blue
  'SG': 'bg-green-100 text-green-800',   // Shooting Guard - Green
  'SF': 'bg-yellow-100 text-yellow-800', // Small Forward - Yellow
  'PF': 'bg-orange-100 text-orange-800', // Power Forward - Orange
  'C': 'bg-red-100 text-red-800'         // Center - Red
}
```

## 🎯 Live/Interactive Elements

### Status Indicators
- **Live Badge**: `variant="destructive"` with pulsing red dot
- **New Updates**: `bg-yellow-900/20 border-l-2 border-l-yellow-500`
- **Hover States**: `hover:bg-neutral-800/50`

### Animation Classes
```css
/* Slide down animation for new items */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply with: animation: slideDown 0.5s ease-out */
```

## 📐 Layout & Spacing

### Container Patterns
```jsx
// Main page wrapper
<div className="min-h-screen bg-neutral-900">

// Content container
<div className="max-w-full mx-auto px-6 pb-6">

// Two-column grid
<div className="grid grid-cols-2 gap-8">
```

### Standard Heights
- **Component Containers**: `h-[600px]`
- **Table/List Rows**: `h-[52px]`
- **Consistent spacing**: `space-y-4`, `mb-6`

## 🧩 Component Styles

### Buttons
```jsx
// Primary button
<Button variant="default">Action</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Ghost button (for icons/minimal actions)
<Button variant="ghost" size="icon">
  <Icon className="h-5 w-5" />
</Button>
```

### Cards
```jsx
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
  <CardHeader className="flex flex-col space-y-1.5 p-6">
    <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    Content
  </CardContent>
</Card>
```

### Badges
```jsx
// Team badge
<Badge variant="outline" className="bg-purple-100 text-purple-800">
  LAL
</Badge>

// Status badge
<Badge variant="destructive">
  LIVE
</Badge>

// Secondary info
<Badge variant="secondary">
  +3
</Badge>
```

### Tables
```jsx
<Table className="w-full table-fixed h-full">
  <TableHeader className="bg-neutral-900">
    <TableRow className="border-b border-neutral-800 hover:bg-transparent">
      <TableHead className="text-neutral-400 font-medium">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody className="h-full">
    <TableRow className="h-[52px] border-b border-neutral-800 hover:bg-neutral-800/50">
      <TableCell className="text-white">Content</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 🎨 Typography

### Headers
```jsx
<h1 className="text-3xl font-bold text-white">Main Title</h1>
<h2 className="text-xl font-bold text-white">Section Title</h2>
<h3 className="text-lg font-semibold text-white">Subsection</h3>
```

### Body Text
```jsx
<p className="text-sm text-neutral-300">Regular text</p>
<p className="text-xs text-neutral-500">Small/muted text</p>
<span className="font-medium text-white">Emphasized text</span>
<span className="font-semibold text-white">Strong emphasis</span>
```

## 🔥 Interactive States

### Hover Effects
```css
hover:bg-neutral-800/50     /* Subtle hover */
hover:bg-neutral-800/30     /* Even more subtle */
hover:shadow-lg             /* Card hover */
hover:scale-105             /* Slight scale on cards */
```

### Transitions
```css
transition-all duration-200   /* Quick transitions */
transition-all duration-500   /* Smooth transitions */
ease-in-out                  /* Standard easing */
```

### Focus States
All interactive elements should include:
```css
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

## 🚀 Quick Implementation Checklist

### For Onboarding Pages:

1. **Base Structure**:
   ```jsx
   <div className="min-h-screen bg-neutral-900">
     <div className="max-w-4xl mx-auto px-6 py-8">
       {/* Your onboarding content */}
     </div>
   </div>
   ```

2. **Typography Hierarchy**:
   - Main titles: `text-3xl font-bold text-white`
   - Section titles: `text-xl font-bold text-white`
   - Body text: `text-neutral-300`
   - Helper text: `text-sm text-neutral-400`

3. **Form Elements**:
   - Use the provided Input, Button, and Card components
   - Maintain consistent spacing with `space-y-4` or `space-y-6`

4. **Interactive Elements**:
   - Primary actions: `<Button variant="default">`
   - Secondary actions: `<Button variant="secondary">`
   - Always include hover states and transitions

5. **Status/Progress Indicators**:
   - Use badges for progress steps
   - Maintain the yellow highlight pattern for active/current states
   - Use the slide-down animation for dynamic content

## 📱 Responsive Considerations

- Mobile-first approach with Tailwind breakpoints
- Use `grid-cols-1 md:grid-cols-2` for responsive layouts
- Ensure touch targets are at least 44px (use `h-11` for buttons)
- Consider sidebar overlays for mobile: `fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden`

## 🎭 Custom Animations Available

```css
/* Slide down for new items */
animation: slideDown 0.5s ease-out

/* Pulse for live indicators */
animate-pulse

/* Scale on hover for cards */
hover:scale-105

/* Fade transitions */
transition-all duration-300
```

This design system ensures your onboarding flow will seamlessly integrate with the existing sports dashboard aesthetic!
