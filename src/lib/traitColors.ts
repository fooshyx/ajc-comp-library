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