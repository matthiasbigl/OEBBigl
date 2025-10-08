# Light/Dark Mode Color Guide

## Color Mapping Strategy

### Backgrounds
- `bg-black` → `bg-gray-50 dark:bg-black`
- `bg-black/50` → `bg-white/50 dark:bg-black/50`
- `bg-black/80` → `bg-white/80 dark:bg-black/80`
- `bg-black/90` → `bg-white/90 dark:bg-black/90`
- `bg-gray-900` → `bg-gray-100 dark:bg-gray-900`
- `bg-gray-800` → `bg-gray-200 dark:bg-gray-800`

### Text Colors
- `text-gray-100` → `text-gray-900 dark:text-gray-100`
- `text-gray-200` → `text-gray-800 dark:text-gray-200`
- `text-gray-300` → `text-gray-700 dark:text-gray-300`
- `text-gray-400` → `text-gray-600 dark:text-gray-400`
- `text-gray-500` → `text-gray-500 dark:text-gray-500` (stays same)
- `text-gray-600` → `text-gray-400 dark:text-gray-600`
- `text-white` → `text-gray-900 dark:text-white`

### Borders
- `border-gray-700` → `border-gray-300 dark:border-gray-700`
- `border-gray-800` → `border-gray-200 dark:border-gray-800`
- `border-gray-600` → `border-gray-400 dark:border-gray-600`

### Accent Colors (Cyan/Blue)
- `text-cyan-300` → `text-blue-600 dark:text-cyan-300`
- `text-cyan-400` → `text-blue-500 dark:text-cyan-400`
- `bg-cyan-500` → `bg-blue-500 dark:bg-cyan-500`
- `border-cyan-400` → `border-blue-400 dark:border-cyan-400`

### Status Colors (Keep mostly same, adjust opacity)
- Green (success): Keep same
- Red (error): Keep same
- Orange (warning): Keep same
- Blue/Cyan (info): Adjust as above

## Implementation Notes

1. Light mode uses softer grays (not pure white)
2. Main background: `bg-gray-50` (very light gray)
3. Card backgrounds: `bg-white/50` for translucency
4. Accent color: Blue in light mode, Cyan in dark mode
5. Text should have good contrast in both modes
