# Logo Setup Instructions

## How to Add Your Custom Logo

### 1. Add Your Logo Image
Place your logo image file in the following location:
```
frontend/public/images/logo.png
```

**Supported formats:**
- PNG (recommended)
- SVG (scalable)
- JPG/JPEG

**Recommended dimensions:**
- Square aspect ratio (e.g., 512x512px)
- High resolution for crisp display
- Transparent background (PNG) works best

### 2. Update the App Name (Optional)
If you want to change "Courtside" to your custom app name, update these files:

#### In OnboardingContainer.tsx:
```typescript
// Line 135
<h1 className="text-5xl font-bold text-white mb-2">
  Welcome to Your App Name
</h1>
```

#### In Logo component (components/ui/logo.tsx):
```typescript
// Line 35
<span className={`font-bold text-xl ${textClassName}`}>
  Your App Name
</span>
```

#### In layout.tsx:
```typescript
// Line 10
title: 'Your App Name',
```

### 3. Logo Component Usage

The Logo component is now available throughout your app:

```typescript
import Logo from '@/components/ui/logo';

// Basic usage
<Logo />

// With text
<Logo showText={true} />

// Different sizes
<Logo size="sm" />   // 32x32px
<Logo size="md" />   // 48x48px (default)
<Logo size="lg" />   // 64x64px
<Logo size="xl" />   // 80x80px

// Custom styling
<Logo 
  size="lg" 
  showText={true} 
  textClassName="text-blue-500"
  className="my-4"
/>
```

### 4. Current Implementation

The logo is currently implemented in:
- **OnboardingContainer**: Large logo with text in the header
- **Logo Component**: Reusable component for other parts of the app

### 5. Fallback Handling

If the logo image doesn't exist or fails to load:
- The image will be hidden automatically
- The text will still display
- No errors will be thrown

### 6. Testing

After adding your logo:
1. Check that it displays correctly in the onboarding flow
2. Verify it looks good at different sizes
3. Test on different screen sizes (mobile, tablet, desktop)
4. Ensure the fallback works if the image is missing

### 7. File Structure

```
frontend/
├── public/
│   └── images/
│       └── logo.png          # Your logo file
├── components/
│   └── ui/
│       └── logo.tsx          # Logo component
└── components/
    └── onboarding/
        └── OnboardingContainer.tsx  # Uses the logo
```

That's it! Your custom logo and branding will now appear throughout the onboarding flow.
