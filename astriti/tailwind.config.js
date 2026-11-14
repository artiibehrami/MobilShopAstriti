/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { obsidian: '#f5f5f7', champagne: '#b7791f', ice: '#0071e3' },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      transitionTimingFunction: { lux: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-16px) rotate(var(--r,0deg))' } },
        drift: { '0%': { transform: 'translateY(0)', opacity: 0 }, '20%': { opacity: 0.8 }, '100%': { transform: 'translateY(-120px)', opacity: 0 } },
        bump: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.5)' }, '100%': { transform: 'scale(1)' } },
        rise: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(.4)', opacity: 0 }, '60%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        draw: { to: { strokeDashoffset: 0 } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: .7 }, '100%': { transform: 'scale(2.6)', opacity: 0 } },
        sheen: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        drift: 'drift 8s linear infinite',
        bump: 'bump .5s cubic-bezier(0.16,1,0.3,1)',
        rise: 'rise .9s cubic-bezier(0.16,1,0.3,1) both',
        pop: 'pop .7s cubic-bezier(0.16,1,0.3,1) both',
        draw: 'draw .8s .2s ease-out forwards',
        pulseRing: 'pulseRing 2s ease-out infinite',
        sheen: 'sheen 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
