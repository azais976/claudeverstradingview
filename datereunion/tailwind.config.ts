import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand colors - Réunion tropical palette
        coral:   { DEFAULT: "#FF6B6B", 400: "#FF8E8E", 600: "#E85D5D" },
        ocean:   { DEFAULT: "#4ECDC4", 400: "#71D9D1", 600: "#3BBDB5" },
        volcano: { DEFAULT: "#FF8C42", 400: "#FFA56B", 600: "#E57A35" },
        lagoon:  { DEFAULT: "#2EC4B6", 400: "#52D0C3", 600: "#25A99D" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-cal)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "swipe-right": { to: { transform: "translateX(150%) rotate(30deg)", opacity: "0" } },
        "swipe-left":  { to: { transform: "translateX(-150%) rotate(-30deg)", opacity: "0" } },
        "pulse-heart": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "swipe-right": "swipe-right 0.4s ease-in forwards",
        "swipe-left": "swipe-left 0.4s ease-in forwards",
        "pulse-heart": "pulse-heart 0.6s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #FF6B6B 0%, #FF8C42 50%, #4ECDC4 100%)",
        "gradient-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
      },
    },
  },
  plugins: [animate],
};

export default config;
