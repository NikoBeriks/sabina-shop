import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        forest: {
          50: '#f2f6f4',
          100: '#e1ece6',
          200: '#c3d9cc',
          300: '#97bfab',
          400: '#679e84',
          500: '#438065',
          600: '#326650',
          700: '#285141',
          800: '#1b3b2d',
          900: '#122a20',
          950: '#091811',
        },
        primary: {
          50: '#f2f6f4',
          100: '#e1ece6',
          200: '#c3d9cc',
          300: '#97bfab',
          400: '#679e84',
          500: '#285141',
          600: '#1b3b2d',
          700: '#122a20',
          800: '#0c1d16',
          900: '#07120e',
        },
        brand: {
          50: '#f4f6f4',
          100: '#e3eae5',
          500: '#244838',
          600: '#1a372a',
          700: '#11251c',
          accent: '#111827',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        'emerald': '0 4px 12px 0 rgba(27, 59, 45, 0.15)',
        'sharp': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'sharp-sm': '1px 1px 0px 0px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}

export default config
