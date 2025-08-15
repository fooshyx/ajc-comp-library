export type BreakpointColor = 'bronze' | 'light-bronze' | 'silver' | 'gold' | 'platinum'

export interface Breakpoint {
  num: number
  color: BreakpointColor
}

export interface Trait {
  id: string
  name: string
  image: string
  breakpoints: Breakpoint[]
}

export interface Unit {
  id: string
  name: string
  cost: number
  image: string
  traits: string[]
}

export interface Component {
  id: string
  name: string
  image: string
}

export type ItemType = 'standard' | 'emblem' | 'artifact' | 'other'

export interface Item {
  id: string
  name: string
  type: ItemType
  image: string
  recipe: string[] | null
  // Note: Radiant variants are handled at the composition level as a boolean flag
  // that changes the visual appearance (outline color) of items when displayed
}