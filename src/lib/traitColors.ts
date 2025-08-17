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

export const sortTraitsByBreakpoint = <T extends { name: string; color?: string | null | undefined }>(traits: T[]): T[] => {
  // Create a copy to avoid mutating the original array
  const traitsCopy = [...traits]
  
  return traitsCopy.sort((a, b) => {
    // Get the sort order for each trait's breakpoint color
    const colorA = a.color || null
    const colorB = b.color || null
    const orderA = getTraitSortOrder(colorA || undefined)
    const orderB = getTraitSortOrder(colorB || undefined)
    
    // Debug: Log the comparison for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sorting: ${a.name} (${colorA}, order: ${orderA}) vs ${b.name} (${colorB}, order: ${orderB})`)
    }
    
    // Primary sort: by breakpoint tier (Light Bronze=1 -> Platinum=2 -> Gold=3 -> Silver=4 -> Bronze=5 -> NULL=6)
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // Secondary sort: alphabetically within the same tier
    return a.name.localeCompare(b.name)
  })
}