import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Orbitron", ...fontFamily.sans],
        cyber: ["Orbitron", "sans-serif"],
        "mono-cyber": ["Share Tech Mono", "monospace"],
        mono: ['Share Tech Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        terminal: {
          black: '#000000',
          green: '#00ff00',
          blue: '#0066ff',
          purple: '#7928CA',
          pink: '#FF0080',
          cyan: '#00fffc',
          yellow: '#fffc00',
          magenta: '#fc00ff',
        },
        cyber: {
          black: '#080808',
          darker: '#000000',
          dark: '#1a1a1a',
          primary: '#7928CA',
          secondary: '#FF0080',
          accent: '#00ff00',
        },
      },
      boxShadow: {
        'terminal': '0 0 10px rgba(0, 255, 0, 0.2)',
        'neon': '0 0 5px theme(colors.terminal.green), 0 0 20px theme(colors.terminal.green)',
        'cyber': '0 0 10px theme(colors.cyber.primary), 0 0 20px theme(colors.cyber.secondary)',
      },
      animation: {
        'terminal-flicker': 'flicker 5s infinite',
        'glitch': 'glitch 725ms infinite',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(45deg, #7928CA, #FF0080)',
        'terminal-glow': 'radial-gradient(circle at center, rgba(0, 255, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)',
      },
    }
  },
  plugins: [],
} satisfies Config;
