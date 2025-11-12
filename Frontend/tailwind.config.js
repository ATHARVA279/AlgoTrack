/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#60A5FA',
          dark: '#2563EB',
        },
        neon: {
          purple: '#B026FF',
          blue: '#00F6FF',
        },
        cyber: {
          black: '#0D0D0D',
          darker: '#1A1A1A',
          dark: '#262626',
          light: '#404040',
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'neon-gradient': 'linear-gradient(135deg, #B026FF 0%, #00F6FF 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-hover': '0 0 30px rgba(139, 92, 246, 0.8)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            a: {
              color: '#B026FF',
              '&:hover': {
                color: '#00F6FF',
              },
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            h4: {
              color: '#fff',
            },
            strong: {
              color: '#fff',
            },
            code: {
              color: '#00F6FF',
              fontFamily: 'JetBrains Mono, monospace',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};