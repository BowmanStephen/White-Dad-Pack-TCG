/**
 * Tailwind CSS Configuration
 * @see {@link https://tailwindcss.com/docs/configuration}
 *
 * ## Design Tokens
 * - **Colors**: Brand, rarity, gradient, and semantic UI colors
 * - **Typography**: Display and card font families
 * - **Spacing**: Consistent spacing scale (via Tailwind defaults)
 * - **Effects**: Custom animations, shadows, blur, transitions
 *
 * ## Reusable Component Classes
 * Located in `src/styles/global.css` to reduce Tailwind duplication:
 *
 * ### Buttons
 * - `.btn-primary`: Primary action buttons with gradient
 * - `.btn-secondary`: Secondary action buttons (solid)
 * - `.btn-icon`: Icon-only buttons with hover states
 * - `.btn-cta`: Large call-to-action buttons
 *
 * ### Modals
 * - `.modal-container`: Full-screen flex-centered wrapper
 * - `.modal-backdrop`: Backdrop overlay with blur
 * - `.modal-content`: Modal content container
 * - `.modal-close-btn`: Positioned close button
 *
 * ### Feature Cards
 * - `.feature-card`: Feature showcase cards
 * - `.icon-container`: Circular icon containers
 * - `.text-feature-title`: Feature title typography
 * - `.text-feature-desc`: Feature description typography
 *
 * ### Card Effects
 * - `.card-perspective`: 3D perspective container
 * - `.card-3d`: 3D transform wrapper
 * - `.card-face`: Front/back card faces
 * - `.holo-effect`: Holographic overlay
 * - `.holo-prismatic`: Enhanced rainbow holo
 *
 * ### Animations
 * - `.animate-pack-glow`: Pulsing glow for packs
 * - `.animate-card-flip`: 3D card flip
 * - `.animate-legendary-burst`: Legendary reveal burst
 * - `.animate-slide-in-right`: Slide from right
 * - `.animate-particle`: Floating particles
 * - `.animate-shimmer`: Shimmer effect
 * - `.animate-float-slow/medium/fast`: Floating animations
 * - `.animate-pulse-glow`: Pulsing glow
 * - `.animate-shake`: Screen shake effect
 *
 * ### Rarity Styles
 * - `.rarity-{common|uncommon|rare|epic|legendary|mythic}`: CSS variables for colors
 * - `.rarity-border`: Rarity-themed border with glow
 *
 * ## Usage Examples
 *
 * **Modal:**
 * ```html
 * <div class="modal-container">
 *   <div class="modal-backdrop"></div>
 *   <div class="modal-content p-8">
 *     <button class="modal-close-btn">×</button>
 *     <!-- Content -->
 *   </div>
 * </div>
 * ```
 *
 * **Button:**
 * ```html
 * <button class="btn-primary">Click Me</button>
 * <button class="btn-secondary">Cancel</button>
 * <button class="btn-cta">Get Started</button>
 * ```
 *
 * **Feature Card:**
 * ```html
 * <div class="feature-card">
 *   <div class="icon-container">
 *     <svg class="w-6 h-6">...</svg>
 *   </div>
 *   <h3 class="text-feature-title">Title</h3>
 *   <p class="text-feature-desc">Description</p>
 * </div>
 * ```
 */
export default {
  darkMode: 'class', // Use class-based dark mode
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'dad-blue': '#1a365d',
        'dad-gold': '#d69e2e',
        'dad-green': '#276749',
        'dad-brown': '#744210',

        // Rarity colors
        'rarity-common': '#9ca3af',
        'rarity-uncommon': '#60a5fa',
        'rarity-rare': '#fbbf24',
        'rarity-epic': '#a855f7',
        'rarity-legendary': '#f97316',
        'rarity-mythic': '#ec4899',

        // UI colors
        'card-bg': '#1f2937',
        'card-border': '#374151',

        // Gradient colors
        'gradient-start': '#fbbf24', // Yellow-400
        'gradient-end': '#f97316',   // Orange-500
      },
      fontFamily: {
        'display': ['system-ui', 'sans-serif'],
        'card': ['Georgia', 'serif'],
      },
      animation: {
        'pack-glow': 'packGlow 2s ease-in-out infinite',
        'card-flip': 'cardFlip 0.6s ease-out forwards',
        'legendary-burst': 'legendaryBurst 0.8s ease-out forwards',
        'slide-in': 'slideInFromRight 0.5s ease-out forwards',
        'particle-float': 'particleFloat 1s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        packGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 215, 0, 0.3), 0 0 120px rgba(255, 215, 0, 0.1)',
          },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(90deg) scale(1.1)' },
          '100%': { transform: 'rotateY(180deg) scale(1)' },
        },
        legendaryBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        slideInFromRight: {
          from: { transform: 'translateX(100%) rotate(5deg)', opacity: '0' },
          to: { transform: 'translateX(0) rotate(0)', opacity: '1' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'holographic': 'linear-gradient(125deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
      },
    },
  },
  plugins: [],
};
