// Centralized Design System & Color Tokens for Zivo
// Guarantees maximum contrast, readable typography, and eliminates white-on-white / black-on-black issues.

export const COLORS = {
  // Main Canvas Backgrounds
  background: '#0B0E14',       // Deep obsidian canvas
  backgroundSecondary: '#111622', // Slightly elevated background
  surface: '#171D2B',          // Cards & containers
  surfaceElevated: '#1F273A',  // Modals, sheets, floating elements
  surfaceLight: '#2A344D',     // Button backgrounds, pill containers

  // Primary Brand Colors (Electric Violet / Rose Gradient)
  primary: '#8B5CF6',          // Electric Violet
  primaryDark: '#6D28D9',      // Dark Violet
  primaryLight: '#A78BFA',     // Soft Violet
  secondary: '#EC4899',        // Rose Pink Accent
  secondaryDark: '#BE185D',

  // Semantic Status Colors (High-Vibrancy & Contrast)
  success: '#10B981',          // Emerald Green (Likes, matches, active)
  successDark: '#059669',
  successLight: 'rgba(16, 185, 129, 0.15)',

  danger: '#EF4444',           // Ruby Red (Pass, block, report, decline)
  dangerDark: '#DC2626',
  dangerLight: 'rgba(239, 68, 68, 0.15)',

  warning: '#F59E0B',          // Amber Gold (Coins, economy, rewards)
  warningLight: 'rgba(245, 158, 11, 0.15)',

  info: '#3B82F6',             // Blue (Info, verified badge)
  infoLight: 'rgba(59, 130, 246, 0.15)',

  // Typography Colors (Guaranteed contrast on dark backgrounds)
  textPrimary: '#FFFFFF',      // Pure White for headings, primary titles
  textSecondary: '#CBD5E1',    // Slate 300 - clearly readable body text (contrast ratio > 7:1)
  textMuted: '#94A3B8',        // Slate 400 - secondary labels, dates
  textSubtle: '#64748B',       // Slate 500 - subtle captions (never invisible)

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  borderAccent: 'rgba(139, 92, 246, 0.40)',

  // Inputs
  inputBackground: '#131825',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputBorderFocused: '#8B5CF6',
  inputText: '#FFFFFF',
  inputPlaceholder: '#64748B',

  // Scrims & Overlays (Prevents white-on-white on bright photos)
  scrimDark: 'rgba(11, 14, 20, 0.88)',
  scrimHeavy: 'rgba(11, 14, 20, 0.95)',
  scrimLight: 'rgba(11, 14, 20, 0.45)',
  cardOverlay: 'rgba(15, 20, 32, 0.82)',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  glowPrimary: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
};
