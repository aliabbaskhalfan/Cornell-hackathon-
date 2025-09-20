# 🔀 Onboarding + Dashboard Merge Guide

## 📋 Current Situation
- **Your Code**: Dashboard is currently at root (`/`) route
- **Friend's Code**: Onboarding flow (likely also at root route)
- **Goal**: Onboarding → Dashboard flow without conflicts

## 🚀 Pre-Merge Preparation (COMPLETED)

✅ **Step 1: Restructured Your Files**
- Created `/frontend/app/dashboard/page.tsx` - Your dashboard now lives here
- Modified `/frontend/app/page.tsx` - Now ready for onboarding integration
- Your dashboard is preserved and accessible at `/dashboard` route

## 🔄 Merge Process

### **Step 1: Coordinate File Locations**
Tell your friend to structure their onboarding files like this:

```
frontend/app/
├── page.tsx                    # Landing/routing logic (you handle this)
├── onboarding/
│   ├── page.tsx               # Main onboarding entry
│   ├── step-1/
│   │   └── page.tsx           # First onboarding step
│   ├── step-2/
│   │   └── page.tsx           # Second step
│   ├── step-3/
│   │   └── page.tsx           # Final step
│   └── layout.tsx             # Onboarding-specific layout (optional)
├── dashboard/
│   └── page.tsx               # Your dashboard (already created)
└── layout.tsx                 # Root layout (you keep this)
```

### **Step 2: Component Organization**
Friend should put their components in:
```
frontend/components/
├── onboarding/                # Friend's onboarding components
│   ├── welcome-step.tsx
│   ├── preferences-step.tsx
│   ├── team-selection.tsx
│   └── completion-step.tsx
├── dashboard/                 # Your existing dashboard components (keep as-is)
├── ui/                        # Shared UI components (merge carefully)
└── ...
```

### **Step 3: Routing Logic Integration**

**Your `page.tsx` should become:**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
    
    if (hasCompletedOnboarding === 'true') {
      // User has completed onboarding, go to dashboard
      router.push('/dashboard')
    } else {
      // User needs onboarding, go to onboarding flow
      router.push('/onboarding')
    }
    
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return null // This component just handles routing
}
```

### **Step 4: Onboarding Completion Handler**

Friend's final onboarding step should include:
```tsx
const completeOnboarding = () => {
  // Save onboarding completion
  localStorage.setItem('onboarding_completed', 'true')
  
  // Save any user preferences
  localStorage.setItem('user_preferences', JSON.stringify(preferences))
  
  // Redirect to dashboard
  router.push('/dashboard')
}
```

## 🛠️ Merge Checklist

### **Before Merging:**
- [ ] Friend has organized components in `/components/onboarding/`
- [ ] Friend has created routes in `/app/onboarding/`
- [ ] Both codebases use the same design system (reference `DESIGN_SYSTEM.md`)
- [ ] No conflicting file names in `/components/ui/`

### **During Merge:**
1. **Merge package.json dependencies** (friend may have added new ones)
2. **Merge tailwind.config.js** (if friend added custom styles)
3. **Check globals.css** for any new styles
4. **Review components/ui/** for conflicts (likely in shadcn components)

### **After Merge:**
- [ ] Test onboarding flow: `/` → `/onboarding` → `/dashboard`
- [ ] Test direct dashboard access: `/dashboard`
- [ ] Test localStorage persistence
- [ ] Verify design consistency across both flows

## 🚨 Potential Conflicts & Solutions

### **File Conflicts:**
```bash
# If same filenames exist, rename with prefixes:
components/ui/button.tsx        # Keep yours (established)
components/ui/onboarding-button.tsx  # Friend's version (if different)
```

### **Package.json Conflicts:**
```bash
# Merge dependencies - keep highest versions
# Check for conflicting packages
npm install  # After merge to resolve dependencies
```

### **Styling Conflicts:**
- Friend should use your design system (`DESIGN_SYSTEM.md`)
- If friend has custom styles, add to globals.css under comments
- Use CSS custom properties for consistency

### **Component Conflicts:**
If friend created similar components:
```bash
# Keep your versions, adapt friend's to use yours:
components/ui/card.tsx          # Your version (keep)
components/onboarding/onboarding-card.tsx  # Friend's version (rename)
```

## 🔧 Git Merge Strategy

### **Recommended Approach:**
```bash
# 1. Create merge branch
git checkout -b merge-onboarding

# 2. Merge friend's branch
git merge friend-onboarding-branch

# 3. Resolve conflicts manually
# Focus on:
# - package.json (merge dependencies)
# - components/ui/ (keep your versions)
# - app/page.tsx (use the routing logic above)

# 4. Test thoroughly
npm run dev

# 5. Merge to main when confirmed working
git checkout main
git merge merge-onboarding
```

## 🎯 Final File Structure

After successful merge:
```
frontend/
├── app/
│   ├── page.tsx                 # Routing logic
│   ├── layout.tsx               # Root layout
│   ├── onboarding/              # Friend's onboarding pages
│   │   ├── page.tsx
│   │   ├── step-1/page.tsx
│   │   ├── step-2/page.tsx
│   │   └── step-3/page.tsx
│   └── dashboard/               # Your dashboard
│       └── page.tsx
├── components/
│   ├── onboarding/              # Friend's onboarding components
│   ├── dashboard/               # Your dashboard components
│   ├── ui/                      # Shared UI (carefully merged)
│   └── ...
└── ...
```

## 🎉 Success Criteria

✅ User visits `/` → redirected to onboarding (if first time)
✅ User completes onboarding → redirected to dashboard  
✅ User visits `/` again → redirected to dashboard (returning user)
✅ Dashboard accessible directly at `/dashboard`
✅ Design consistency between onboarding and dashboard
✅ No broken imports or missing dependencies

## 💡 Pro Tips

1. **Test in private/incognito** to simulate first-time user experience
2. **Clear localStorage** between tests to reset onboarding state
3. **Use the same shadcn components** for consistency
4. **Reference DESIGN_SYSTEM.md** for styling decisions
5. **Keep communication open** during merge process

Your dashboard is now safely isolated and ready for the merge! 🚀
