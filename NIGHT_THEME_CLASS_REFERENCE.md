// ============================================================================
// NIGHT THEME - COMPLETE CLASS REFERENCE
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// BACKGROUND COLORS
// ────────────────────────────────────────────────────────────────────────────

bg-night-darker        // #0a0a0a - Darkest background
bg-night-dark          // #0f1117 - Very dark
bg-night-base          // #161b22 - Base dark
bg-night-card          // #1c2128 - Card/elevated backgrounds
bg-night-hover         // #21262d - Hover state backgrounds

// ────────────────────────────────────────────────────────────────────────────
// TEXT COLORS
// ────────────────────────────────────────────────────────────────────────────

text-night-text                 // #c9d1d9 - Main text color
text-night-text-secondary       // #8b949e - Secondary text
text-night-text-subtle          // #6e7681 - Subtle/hint text
text-night-green                // #31a24c - Success/primary accent
text-night-green-hover          // #2ea043 - Green on hover
text-night-accent               // #1f6feb - Blue accent
text-night-accent-hover         // #3192e8 - Blue hover
text-night-accent-light         // #388bfd - Light blue
text-night-red                  // #da3633 - Error/danger
text-night-orange               // #fb8500 - Warning

// ────────────────────────────────────────────────────────────────────────────
// BORDER COLORS
// ────────────────────────────────────────────────────────────────────────────

border-night                    // #30363d - Default border
border-night-accent             // #1f6feb - Accent border (blue)
border-night-green              // #31a24c - Green border
border-night-red                // #da3633 - Red border

// ────────────────────────────────────────────────────────────────────────────
// BACKGROUND PATTERNS & IMAGES
// ────────────────────────────────────────────────────────────────────────────

bg-night-gradient               // Gradient: #0a0a0a → #161b22 → #0f1117
bg-night-pattern                // Subtle geometric pattern overlay
bg-night-dots                   // Radial dot pattern with green glow

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT CLASSES
// ────────────────────────────────────────────────────────────────────────────

// CARDS
night-card                      // Dark card with border, hover effect
night-card-hover                // Card with shimmer on hover
night-product-card              // Specialized product card styling

// BUTTONS
night-btn                       // Primary button (green, full opacity)
night-btn-glow                  // Button with border + radial glow effect

// INPUTS
night-input                     // Text input/textarea/select styling
night-input-focus               // Input with focus indicator line

// TEXT EFFECTS
night-text-gradient             // Gradient text effect (green to blue)
night-link                      // Styled link with underline animation

// BADGES
night-badge                     // Default badge (green)
night-badge.discount            // Discount badge (red)
night-badge.hot                 // Hot deal badge (orange, glowing)

// ALERTS
night-alert                     // Base alert styling
night-alert.success             // Success alert (green border)
night-alert.error               // Error alert (red border)
night-alert.warning             // Warning alert (orange border)
night-alert.info                // Info alert (blue border)

// SECTIONS & TYPOGRAPHY
night-section-header            // Section header with bottom accent bar
night-divider                   // Gradient divider line
night-code                      // Code block styling
night-skeleton                  // Loading skeleton (shimmer animation)
night-tooltip                   // Hover tooltip effect
night-transition                // Smooth color/border transitions

// ────────────────────────────────────────────────────────────────────────────
// SHADOW & GLOW EFFECTS
// ────────────────────────────────────────────────────────────────────────────

shadow-night-sm                 // Small shadow (4px 6px)
shadow-night-md                 // Medium shadow (10px 15px)
shadow-night-lg                 // Large shadow (20px 25px)
shadow-night-glow               // Green glow shadow (0 0 20px rgba(49,162,76,0.3))
shadow-night-glow-blue          // Blue glow shadow (0 0 20px rgba(31,111,235,0.3))

// ────────────────────────────────────────────────────────────────────────────
// BLUR & BACKDROP
// ────────────────────────────────────────────────────────────────────────────

backdrop-blur-xs                // Extra small blur (2px)
backdrop-blur-md                // Medium blur (standard)
backdrop-blur-lg                // Large blur

// ────────────────────────────────────────────────────────────────────────────
// ANIMATIONS (defined in nightTheme.css)
// ────────────────────────────────────────────────────────────────────────────

@keyframes float                // Up/down bobbing (3-20s duration)
@keyframes glow-pulse           // Glow effect pulse (2s)
@keyframes glow-pulse-blue      // Blue glow pulse (2s)
@keyframes shimmer              // Loading shimmer effect (2s)
@keyframes slide-in             // Fade + slide up animation (0.3s)

// ────────────────────────────────────────────────────────────────────────────
// QUICK CLASS COMBINATIONS (Examples)
// ────────────────────────────────────────────────────────────────────────────

// Simple Card
<div className="night-card">
  <h3 className="text-night-text font-bold">Title</h3>
  <p className="text-night-text-secondary">Description</p>
</div>

// Interactive Card
<div className="night-card night-card-hover cursor-pointer">
  <h3 className="text-night-text font-bold">Title</h3>
  <p className="text-night-text-secondary">Description</p>
</div>

// Product Card
<div className="night-product-card">
  <img src="..." className="w-full h-40 object-cover rounded" />
  <h4 className="text-night-text font-semibold mt-3">Product Name</h4>
  <p className="text-night-text-secondary text-sm mb-3">Description</p>
  <button className="night-btn w-full">Add to Cart</button>
</div>

// Form Input
<input 
  type="text" 
  className="night-input w-full" 
  placeholder="Enter text..."
/>

// Success Alert
<div className="night-alert success flex items-center gap-3">
  <CheckCircle size={20} />
  <span>Success message</span>
</div>

// Error Alert
<div className="night-alert error flex items-center gap-3">
  <AlertCircle size={20} />
  <span>Error message</span>
</div>

// Badge Group
<div className="flex gap-2">
  <span className="night-badge">New</span>
  <span className="night-badge discount">Save 30%</span>
  <span className="night-badge hot">Hot Deal</span>
</div>

// Section with Header
<section>
  <div className="night-section-header">
    <h2>Products</h2>
  </div>
  {/* Content here */}
</section>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="night-card">
      {/* Card content */}
    </div>
  ))}
</div>

// Navigation Links
<nav className="flex gap-6">
  <a href="#" className="night-link">Home</a>
  <a href="#" className="night-link">Products</a>
  <a href="#" className="night-link">About</a>
</nav>

// Code Block
<pre className="night-code">
{`const greeting = "Hello, Night Theme!";`}
</pre>

// Button Variations
<div className="flex gap-4">
  <button className="night-btn">Primary</button>
  <button className="night-btn-glow">Glow Button</button>
  <button className="px-4 py-2 border border-night-border text-night-text hover:border-night-green transition rounded-lg">
    Secondary
  </button>
  <button className="px-4 py-2 bg-night-red/20 text-night-red border border-night-red rounded-lg hover:bg-night-red/30 transition">
    Danger
  </button>
</div>

// Table
<table className="w-full">
  <thead className="bg-night-card border-b border-night-border">
    <tr>
      <th className="text-night-text text-left px-4 py-3">Column</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-night-border hover:bg-night-hover">
      <td className="text-night-text-secondary px-4 py-3">Data</td>
    </tr>
  </tbody>
</table>

// ────────────────────────────────────────────────────────────────────────────
// COLOR REFERENCE TABLE
// ────────────────────────────────────────────────────────────────────────────

USE CASE              BACKGROUND                TEXT                    BORDER
──────────────────────────────────────────────────────────────────────────────
Page/Section          bg-night-base             -                       -
Cards                 bg-night-card             text-night-text         border-night
Hover State           bg-night-hover            -                       border-night
Success               -                         text-night-green        border-night-green
Error/Danger          -                         text-night-red          border-night-red
Warning               -                         text-night-orange       border-night-orange
Info/Secondary        -                         text-night-accent       border-night-accent
Input Fields          bg-night-hover            text-night-text         border-night
Disabled/Subtle       -                         text-night-text-subtle  border-night
Heading               -                         text-night-text         -
Subheading            -                         text-night-text-secondary -
Body Text             -                         text-night-text         -
Helper Text           -                         text-night-text-subtle  -

// ────────────────────────────────────────────────────────────────────────────
// RESPONSIVE CLASSES
// ────────────────────────────────────────────────────────────────────────────

// Mobile-first approach
<div className="block md:flex lg:grid">
  {/* Responsive content */}
</div>

// Responsive Text Size
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Heading
</h1>

// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Grid items */}
</div>

// Responsive Spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>

// ────────────────────────────────────────────────────────────────────────────
// HOVER & INTERACTIVE STATES
// ────────────────────────────────────────────────────────────────────────────

// Hover Color Change
<button className="text-night-text-secondary hover:text-night-text transition">
  Hover me
</button>

// Hover Background Change
<div className="bg-night-card hover:bg-night-hover transition rounded-lg p-4">
  Hover for effect
</div>

// Hover Scale
<div className="hover:scale-105 transition">
  Grow on hover
</div>

// Hover Shadow
<div className="shadow-night-sm hover:shadow-night-glow transition">
  Glow on hover
</div>

// Focus State (for inputs)
<input 
  className="night-input focus:border-night-accent focus:ring-2 focus:ring-night-accent/20"
/>

// ────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY NOTES
// ────────────────────────────────────────────────────────────────────────────

✓ Contrast Ratios: All text meets WCAG AA standard (4.5:1 minimum)
✓ Focus States: All interactive elements have visible focus indicators
✓ Semantic HTML: Use proper heading hierarchy and semantic tags
✓ Icons + Text: Always combine icons with text labels
✓ Color Meaning: Don't rely on color alone to convey meaning
✓ Alt Text: Always include alt text for images
✓ Animations: Respect prefers-reduced-motion (in development)

// ────────────────────────────────────────────────────────────────────────────
// PERFORMANCE TIPS
// ────────────────────────────────────────────────────────────────────────────

1. Use CSS classes instead of inline styles
2. Leverage Tailwind's built-in optimizations
3. Avoid excessive animations on page load
4. Use lazy loading for images
5. Minimize custom CSS outside of nightTheme.css
6. Use CSS variables for frequently changed values
7. Test on real devices for performance

// ────────────────────────────────────────────────────────────────────────────
// TROUBLESHOOTING
// ────────────────────────────────────────────────────────────────────────────

ISSUE: Colors not appearing
SOLUTION: Clear browser cache, verify Tailwind config, check CSS imports

ISSUE: Animations are choppy
SOLUTION: Check browser resources, reduce animation count, use DevTools

ISSUE: Text is hard to read
SOLUTION: Check contrast ratio, verify text color class is applied

ISSUE: Hover effects not working
SOLUTION: Verify transition class is present, check CSS specificity

ISSUE: Mobile layout broken
SOLUTION: Check responsive classes (md:, lg:), test on actual device

// ────────────────────────────────────────────────────────────────────────────

Generated: January 28, 2026
Format: Quick Reference
Version: 1.0.0

// ────────────────────────────────────────────────────────────────────────────
