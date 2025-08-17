import { BreakpointColor } from "@/types/tft"

export const BREAKPOINT_COLORS: Record<BreakpointColor, { hex: string; name: string }> = {
  'bronze': {
    hex: '#CD7F32',
    name: 'Bronze'
  },
  'light-bronze': {
    hex: '#E6B85C',
    name: 'Light Bronze'
  },
  'silver': {
    hex: '#C0C0C0',
    name: 'Silver'
  },
  'gold': {
    hex: '#FFD700',
    name: 'Gold'
  },
  'platinum': {
    hex: '#E5E4E2',
    name: 'Platinum'
  }
}

export const getBreakpointColorHex = (color: BreakpointColor): string => {
  return BREAKPOINT_COLORS[color].hex
}

export const getBreakpointColorName = (color: BreakpointColor): string => {
  return BREAKPOINT_COLORS[color].name
}

export const getAllBreakpointColors = (): BreakpointColor[] => {
  return Object.keys(BREAKPOINT_COLORS) as BreakpointColor[]
}

// Custom trait sorting order: Light Bronze -> Platinum -> Gold -> Silver -> Bronze -> NULL (no breakpoint), then alphabetical within each group
export const getTraitSortOrder = (color?: string): number => {
  switch (color) {
    case 'light-bronze': return 1
    case 'platinum': return 2
    case 'gold': return 3
    case 'silver': return 4
    case 'bronze': return 5
    default: return 6 // NULL/no breakpoint
  }
}

export const sortTraitsByBreakpoint = <T extends { name: string; color?: string }>(traits: T[]): T[] => {
  return traits.sort((a, b) => {
    const orderA = getTraitSortOrder(a.color)
    const orderB = getTraitSortOrder(b.color)
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // If same order (same breakpoint level), sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
}