# Night Theme Implementation Guide

## 🌙 Overview

A comprehensive night/dark theme has been implemented across your PC Shop application. The theme includes:

- **Color Palette**: Professional dark colors with green, blue, and red accents
- **Background Images**: Subtle pattern overlays with gradient backgrounds
- **Animations**: Smooth transitions, glow effects, and floating animations
- **Components**: Updated Navbar, Footer, and reusable theme utilities
- **Theme Toggle**: Light/Dark mode switcher in the Navbar

## 🎨 Color Palette

### Primary Colors
```
- Darker Background: #0a0a0a
- Dark Background: #0f1117
- Base Background: #161b22
- Card Background: #1c2128
- Hover Background: #21262d
- Border Color: #30363d
```

### Accent Colors
```
- Green (Primary): #31a24c
- Green Hover: #2ea043
- Blue (Secondary): #1f6feb
- Blue Hover: #3192e8
- Blue Light: #388bfd
- Red: #da3633
- Orange: #fb8500
```

### Text Colors
```
- Main Text: #c9d1d9
- Secondary Text: #8b949e
- Subtle Text: #6e7681
```

## 📁 New Files Created

### Context
- **`src/context/ThemeContext.tsx`**: Manages theme state globally
  - `useTheme()` hook for accessing theme
  - Auto-detects and saves theme preference to localStorage
  - Default theme: Dark mode

### Styles
- **`src/styles/nightTheme.css`**: Advanced night theme styling
  - Animations: `float`, `glow-pulse`, `shimmer`, `slide-in`
  - Reusable classes: `.night-card`, `.night-btn`, `.night-input`
  - Effects: Glows, shadows, gradients
  - Components: Badges, alerts, tooltips, dividers

## 🔧 Updated Files

### Configuration
- **`tailwind.config.js`**: 
  - Added dark mode class strategy
  - Extended colors for night theme
  - Added custom shadows and backgrounds
  - New utilities: `bg-night-gradient`, `bg-night-pattern`

### Global Styles
- **`src/index.css`**: 
  - Dark gradient background (fixed)
  - Pattern overlay
  - Scrollbar styling
  - New utility classes

### Components
- **`src/App.tsx`**: 
  - Wrapped with `ThemeProvider`
  - Updated toast styling for dark mode
  - Imported nightTheme.css

- **`src/components/Navbar.tsx`**: 
  - Updated colors to use night palette
  - Added theme toggle button (Sun/Moon icon)
  - Responsive dark styling

- **`src/components/Footer.tsx`**: 
  - Night theme colors
  - Updated social icons styling
  - Proper contrast ratios

## 🎯 Using the Theme

### Theme Toggle Hook
```tsx
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### Tailwind Class Names

#### Night Colors
```tsx
// Background
<div className="bg-night-darker">Darkest background</div>
<div className="bg-night-base">Base background</div>
<div className="bg-night-card">Card background</div>

// Text
<p className="text-night-text">Main text</p>
<p className="text-night-text-secondary">Secondary text</p>

// Accents
<button className="bg-night-green hover:bg-night-green-hover">Action</button>
<button className="bg-night-accent hover:bg-night-accent-hover">Primary</button>

// Borders
<div className="border border-night-border">Bordered element</div>
```

#### Night Classes (from nightTheme.css)
```tsx
// Cards
<div className="night-card">Styled card</div>
<div className="night-card-hover">Card with hover effect</div>
<div className="night-product-card">Product card</div>

// Inputs
<input className="night-input" />

// Buttons
<button className="night-btn">Primary button</button>
<button className="night-btn-glow">Glowing button</button>

// Text Effects
<span className="night-text-gradient">Gradient text</span>

// Badges
<span className="night-badge">New</span>
<span className="night-badge discount">Sale</span>
<span className="night-badge hot">Hot</span>

// Alerts
<div className="night-alert success">Success message</div>
<div className="night-alert error">Error message</div>
<div className="night-alert warning">Warning message</div>
<div className="night-alert info">Info message</div>

// Typography
<div className="night-section-header">
  <h2>Section Title</h2>
</div>

// Dividers
<div className="night-divider"></div>

// Links
<a className="night-link">Styled link with underline</a>

// Code
<pre className="night-code">code content</pre>
```

#### Shadows
```tsx
<div className="shadow-night-sm">Small shadow</div>
<div className="shadow-night-md">Medium shadow</div>
<div className="shadow-night-lg">Large shadow</div>
<div className="shadow-night-glow">Green glow</div>
<div className="shadow-night-glow-blue">Blue glow</div>
```

## ✨ Key Features

### 1. Fixed Gradient Background
- Applies across entire page
- Uses `background-attachment: fixed` for parallax effect
- Subtle pattern overlay

### 2. Smooth Animations
- Floating elements
- Glow pulsing effects
- Shimmer loading states
- Slide-in animations

### 3. Hover Effects
- Smooth color transitions
- Glow/shadow increases
- Border color changes
- Text underline effects

### 4. Responsive Design
- Mobile-optimized spacing
- Adjusted font sizes for smaller screens
- Touch-friendly button sizes

### 5. Accessibility
- High contrast ratios (WCAG AA compliant)
- Proper focus states
- Semantic HTML
- Clear visual feedback

## 🚀 Best Practices

### When Creating New Components

1. **Use Night Classes**:
```tsx
<div className="night-card">
  <h3 className="text-night-text font-bold">Title</h3>
  <p className="text-night-text-secondary">Description</p>
</div>
```

2. **Buttons**:
```tsx
<button className="night-btn">Action</button>
<button className="night-btn-glow">Secondary</button>
```

3. **Inputs**:
```tsx
<input className="night-input" placeholder="Type here..." />
```

4. **Links**:
```tsx
<a className="night-link">Learn more</a>
```

5. **Status Badges**:
```tsx
<span className="night-badge">New</span>
<span className="night-badge hot">Popular</span>
<span className="night-badge discount">30% Off</span>
```

### Color Usage Guidelines

| Purpose | Color | Class |
|---------|-------|-------|
| Success | Green | `text-night-green` or `night-badge` |
| Primary Action | Blue | `text-night-accent` |
| Danger | Red | `text-night-red` |
| Warning | Orange | `text-night-orange` |
| Disabled | Gray | `text-night-text-subtle` |

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

The theme includes responsive adjustments for:
- Card padding
- Font sizes
- Spacing
- Tooltip widths

## 🔄 Theme Persistence

The selected theme preference is automatically saved to `localStorage` under the key `'theme'`. When users return to the site, their preference will be restored.

## 🎬 Animations Performance

All animations use CSS transforms and opacity for optimal performance:
- GPU-accelerated transformations
- Smooth 60fps animations
- Minimal repaints

## 🐛 Troubleshooting

### Colors not applying?
- Ensure `ThemeProvider` wraps your app
- Check CSS import order
- Verify Tailwind is properly configured

### Theme toggle not working?
- Check browser console for errors
- Verify localStorage is enabled
- Clear browser cache

### Animations are choppy?
- Check browser performance settings
- Reduce number of simultaneous animations
- Use Chrome DevTools performance tab

## 📚 Resources

- Tailwind CSS: https://tailwindcss.com
- Color Reference: GitHub's Primer color system
- Animation Library: CSS3 specifications

## 🎨 Future Enhancements

Consider adding:
- Additional theme variants (e.g., cyberpunk, ocean)
- Customizable accent colors
- Font size preferences
- Animation preferences (reduce-motion support)
- Export theme configuration

---

**Last Updated**: January 28, 2026
**Theme Version**: 1.0.0
