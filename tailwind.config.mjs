/** @type {import('tailwindcss').Config} */
export default {
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
