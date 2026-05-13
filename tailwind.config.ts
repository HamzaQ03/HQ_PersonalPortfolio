import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background:    '#000000',
        surface:       '#0a0a0a',
        'surface-2':   '#111111',
        border:        '#1c1c1c',
        accent:        '#c8a87c',
        'accent-dim':  '#9aa8c0',
        'accent-glow': 'rgba(200,168,124,0.15)',
        text:          '#f0f0f0',
        'text-muted':  '#666677',
        'text-dim':    '#333340',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
