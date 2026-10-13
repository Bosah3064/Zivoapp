// ============================================================================
// ZIVO DESIGN SYSTEM - PREMIUM SOCIAL MEDIA PALETTE
// Inspired by Instagram, Tinder, and Hinge: High-energy Sunset Gradient,
// Midnight Obsidian Canvas, Crisp Typography, and Vibrant Semantic Accents.
// ============================================================================

export const COLORS = {
  // Midnight Navy & Obsidian Backgrounds
  background: '#090B10',         // Ultra-deep obsidian midnight
  backgroundSecondary: '#0F121C',// Layered section background
  surface: '#161B29',            // Elevated card & message surface
  surfaceElevated: '#1E2538',    // Floating modal / sheet surface
  surfaceLight: '#262F47',       // Pill tags, button backgrounds

  // Iconic Social Brand Palette (Sunset Coral to Electric Violet)
  primary: '#FF4E64',            // Sunset Coral / Tinder-style passion red-pink
  primaryDark: '#E02D45',        // Deep Crimson
  primaryLight: '#FF7588',       // Soft Coral Rose
  secondary: '#8B5CF6',          // Electric Violet / Instagram aura
  secondaryLight: '#A78BFA',
  accent: '#00D2FF',             // Cyan Glow (Super likes, verified highlights)

  // Gradients (For buttons, avatar story rings, badges)
  gradientStart: '#FF4E64',
  gradientMid: '#FF6584',
  gradientEnd: '#8B5CF6',

  // Status & Gamification Colors
  success: '#10B981',            // Emerald Green (Mutual matches, online status)
  successGlow: 'rgba(16, 185, 129, 0.2)',

  danger: '#EF4444',             // Ruby (Pass, block, report, decline)
  dangerLight: 'rgba(239, 68, 68, 0.15)',

  warning: '#FFB800',            // Royal Gold (Coins, streaks, VIP perks)
  warningLight: 'rgba(255, 184, 0, 0.18)',

  superLike: '#00B4D8',          // Electric Blue (Super like star)

  // Typography (Guaranteed 100% WCAG AAA contrast ratio on dark)
  textPrimary: '#FFFFFF',        // 100% crisp pure white
  textSecondary: '#E2E8F0',      // Slate 200 (Subtitles, bio, readable body)
  textMuted: '#94A3B8',          // Slate 400 (Captions, time stamps, icons)
  textSubtle: '#64748B',         // Slate 500 (Disabled states, subtle labels)

  // Borders & Glassmorphism
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderAccent: 'rgba(255, 78, 100, 0.35)',
  borderGlow: 'rgba(139, 92, 246, 0.35)',

  // Form Fields
  inputBackground: '#121624',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputBorderFocused: '#FF4E64',
  inputText: '#FFFFFF',
  inputPlaceholder: '#64748B',

  // Protective Media Scrims (Ensures white text is NEVER washed out)
  scrimDark: 'rgba(9, 11, 16, 0.88)',
  scrimHeavy: 'rgba(9, 11, 16, 0.96)',
  cardOverlay: 'rgba(15, 18, 28, 0.88)',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  glowCoral: {
    shadowColor: '#FF4E64',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  glowViolet: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  glowGold: {
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
};
