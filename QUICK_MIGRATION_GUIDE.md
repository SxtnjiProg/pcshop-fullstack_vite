// ============================================================================
// QUICK MIGRATION GUIDE - Apply Night Theme to Existing Pages
// ============================================================================

// COLOR MAPPING - Replace old colors with new ones
// ============================================================================

OLD COLOR              →  NEW COLOR CLASS           →  NOTES
─────────────────────────────────────────────────────────────────────────────
#ffffff              →  text-night-text            (main text)
#f9fafb              →  bg-night-base              (light backgrounds)
#111827              →  text-night-text            (dark text)
#6b7280              →  text-night-text-secondary  (secondary text)
#d1d5db              →  text-night-text-subtle     (subtle text)
bg-gray-900          →  bg-night-dark              (dark backgrounds)
bg-gray-800          →  bg-night-card              (card backgrounds)
border-gray-700      →  border-night-border        (borders)
hover:bg-gray-700    →  hover:bg-night-hover       (hover backgrounds)
text-green-500       →  text-night-green           (success/primary)
text-blue-500        →  text-night-accent          (secondary)
text-red-500         →  text-night-red             (danger)

// ============================================================================
// COMPONENT REPLACEMENT PATTERNS
// ============================================================================

1. CARDS (Product Cards, Feature Cards, etc.)
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
     <h3 className="text-gray-900 font-bold">Title</h3>
     <p className="text-gray-600">Description</p>
   </div>
   ```

   AFTER:
   ```tsx
   <div className="night-card night-card-hover">
     <h3 className="text-night-text font-bold">Title</h3>
     <p className="text-night-text-secondary">Description</p>
   </div>
   ```


2. BUTTONS
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
     Click Me
   </button>
   ```

   AFTER:
   ```tsx
   <button className="night-btn">Click Me</button>
   ```


3. INPUTS/FORMS
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <input 
     type="text" 
     className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
     placeholder="Enter text"
   />
   ```

   AFTER:
   ```tsx
   <input 
     type="text" 
     className="night-input" 
     placeholder="Enter text"
   />
   ```


4. TEXT & TYPOGRAPHY
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <h2 className="text-gray-900 text-2xl font-bold">Heading</h2>
   <p className="text-gray-600">Subheading</p>
   ```

   AFTER:
   ```tsx
   <h2 className="text-night-text text-2xl font-bold">Heading</h2>
   <p className="text-night-text-secondary">Subheading</p>
   ```


5. LINKS
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <a href="#" className="text-blue-500 hover:text-blue-700">Link</a>
   ```

   AFTER:
   ```tsx
   <a href="#" className="night-link">Link</a>
   ```


6. ALERTS/MESSAGES
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <div className="bg-red-50 border border-red-200 text-red-700 p-4">
     Error message
   </div>
   ```

   AFTER:
   ```tsx
   <div className="night-alert error">Error message</div>
   ```


7. BADGES
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
     New
   </span>
   ```

   AFTER:
   ```tsx
   <span className="night-badge">New</span>
   ```


8. BADGES WITH VARIANTS
   ──────────────────────────────────────────────

   FOR DISCOUNTS:
   <span className="night-badge discount">30% Off</span>

   FOR HOT DEALS:
   <span className="night-badge hot">Hot Deal</span>


9. TABLES
   ──────────────────────────────────────────────

   BEFORE:
   ```tsx
   <table className="w-full border-collapse">
     <thead className="bg-gray-100">
       <tr>
         <th className="border border-gray-300 text-gray-900 px-4 py-2">Header</th>
       </tr>
     </thead>
     <tbody>
       <tr className="border border-gray-300">
         <td className="text-gray-600 px-4 py-2">Data</td>
       </tr>
     </tbody>
   </table>
   ```

   AFTER:
   ```tsx
   <table className="w-full border-collapse">
     <thead className="bg-night-card border-b border-night-border">
       <tr>
         <th className="text-night-text px-4 py-2 font-semibold">Header</th>
       </tr>
     </thead>
     <tbody>
       <tr className="border-b border-night-border hover:bg-night-hover">
         <td className="text-night-text-secondary px-4 py-2">Data</td>
       </tr>
     </tbody>
   </table>
   ```


10. GRIDS & LAYOUTS
    ──────────────────────────────────────────────

    BEFORE:
    ```tsx
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded shadow p-4">Item</div>
    </div>
    ```

    AFTER:
    ```tsx
    <div className="grid grid-cols-3 gap-4">
      <div className="night-card">Item</div>
    </div>
    ```

// ============================================================================
// PAGES TO UPDATE (in order of priority)
// ============================================================================

HIGH PRIORITY (User-facing)
├── Home.tsx                    (catalog grid)
├── ProductPage.tsx             (product details)
├── CartPage.tsx                (shopping cart)
├── CheckoutPage.tsx            (checkout form)
├── LoginPage.tsx               (login form)
├── RegisterPage.tsx            (register form)
├── FavoritesPage.tsx           (favorites grid)
└── ComparePage.tsx             (comparison cards)

MEDIUM PRIORITY (User account)
├── ProfileLayout.tsx           (profile container)
├── ProfileDashboard.tsx        (user info)
├── ProfileOrders.tsx           (orders table)
├── ProfileAI.tsx               (AI features)
└── Profile pages/              (sub-pages)

LOWER PRIORITY (Admin)
├── Dashboard.tsx               (stats)
├── AdminProducts.tsx           (product list)
├── AdminOrders.tsx             (orders table)
├── AdminUsers.tsx              (users table)
├── AdminCategories.tsx         (categories)
├── AdminSettings.tsx           (settings form)
└── ProductForm.tsx             (form inputs)

COMPONENTS (Apply everywhere)
├── FilterSidebar.tsx           (filters)
├── StarRating.tsx              (rating display)
└── Other shared components

// ============================================================================
// QUICK BATCH REPLACEMENTS (Use Find & Replace)
// ============================================================================

Find: "bg-white rounded-lg"       Replace: "night-card"
Find: "bg-gray-100"               Replace: "bg-night-card"
Find: "bg-gray-900"               Replace: "bg-night-dark"
Find: "text-gray-900"             Replace: "text-night-text"
Find: "text-gray-600"             Replace: "text-night-text-secondary"
Find: "border-gray-200"           Replace: "border-night-border"
Find: "border-gray-300"           Replace: "border-night-border"
Find: "bg-green-500"              Replace: "bg-night-green"
Find: "text-green-500"            Replace: "text-night-green"
Find: "hover:bg-gray-100"         Replace: "hover:bg-night-hover"
Find: "bg-red-50 border border-red-200"  Replace: "night-alert error"

// ============================================================================
// EXAMPLE: Complete Page Migration
// ============================================================================

// HOME.TSX - BEFORE
export default function Home() {
  return (
    <div className="bg-gray-50">
      <h1 className="text-gray-900 text-3xl font-bold">Products</h1>
      <div className="grid grid-cols-3 gap-4 mt-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4">
            <img src={product.image} className="w-full h-40 object-cover rounded" />
            <h3 className="text-gray-900 font-bold mt-2">{product.name}</h3>
            <p className="text-gray-600 text-sm">{product.description}</p>
            <p className="text-green-500 font-bold mt-2">${product.price}</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4 w-full">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// HOME.TSX - AFTER
export default function Home() {
  return (
    <div className="py-12">
      <h1 className="text-night-text text-3xl font-bold">Products</h1>
      <div className="grid grid-cols-3 gap-4 mt-8">
        {products.map(product => (
          <div key={product.id} className="night-product-card">
            <img src={product.image} className="w-full h-40 object-cover rounded" />
            <h3 className="text-night-text font-bold mt-2">{product.name}</h3>
            <p className="text-night-text-secondary text-sm">{product.description}</p>
            <p className="text-night-green font-bold mt-2">${product.price}</p>
            <button className="night-btn w-full mt-4">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

After updating a page, verify:

☐ Text is readable (contrast ratio ≥ 4.5:1)
☐ Hover states are visible and working
☐ Buttons are clearly identifiable
☐ Forms have visible focus states
☐ Images display correctly
☐ Layout is responsive on mobile
☐ Links are distinct from body text
☐ Alerts/messages are clear
☐ No broken colors or styles
☐ Animations are smooth
☐ Overall aesthetic matches the theme

// ============================================================================
// TIPS & BEST PRACTICES
// ============================================================================

1. Use semantic classes
   ✓ night-card instead of bg-night-card + border + padding
   ✓ night-btn instead of bg-night-green + px + py + rounded
   ✓ text-night-text instead of text-night-text (already correct)

2. Maintain hierarchy
   ✓ Use text-night-text for headings
   ✓ Use text-night-text-secondary for descriptions
   ✓ Use text-night-text-subtle for hints/captions

3. Consistent spacing
   ✓ Cards: p-4 or p-6
   ✓ Sections: py-12 or py-16
   ✓ Grid gaps: gap-4 or gap-6

4. Color meaning
   ✓ Green for success/primary actions
   ✓ Blue for secondary actions/links
   ✓ Red for danger/errors
   ✓ Orange for warnings
   ✓ Gray for disabled/secondary states

5. Avoid hardcoded colors
   ✗ bg-[#333]
   ✓ bg-night-card

// ============================================================================
// PROGRESS TRACKING TEMPLATE
// ============================================================================

Page Name          Status    Notes
──────────────────────────────────────────────────────────────────────────────
Home               [ ] Complete
ProductPage        [ ] Complete
CartPage           [ ] Complete
CheckoutPage       [ ] Complete
LoginPage          [ ] Complete
RegisterPage       [ ] Complete
FavoritesPage      [ ] Complete
ComparePage        [ ] Complete
ProfileLayout      [ ] Complete
ProfileDashboard   [ ] Complete
ProfileOrders      [ ] Complete
ProfileAI          [ ] Complete
Dashboard (Admin)  [ ] Complete
AdminProducts      [ ] Complete
AdminOrders        [ ] Complete
AdminUsers         [ ] Complete
AdminCategories    [ ] Complete
AdminSettings      [ ] Complete
ProductForm        [ ] Complete

// ============================================================================

Created: January 28, 2026
For: PC Shop - Night Theme Implementation
Status: Ready to use
