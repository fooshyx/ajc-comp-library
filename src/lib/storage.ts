"use client"

import { Unit, Trait, Component, Item } from "@/types/tft"

const UNITS_STORAGE_KEY = "tft_units"
const TRAITS_STORAGE_KEY = "tft_traits"
const COMPONENTS_STORAGE_KEY = "tft_components"
const ITEMS_STORAGE_KEY = "tft_items"

export const storageUtils = {
  // Units
  getUnits: (): Unit[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(UNITS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  saveUnits: (units: Unit[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units))
  },

  // Traits
  getTraits: (): Trait[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(TRAITS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  saveTraits: (traits: Trait[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(TRAITS_STORAGE_KEY, JSON.stringify(traits))
  },

  // Components
  getComponents: (): Component[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(COMPONENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  saveComponents: (components: Component[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(components))
  },

  // Items
  getItems: (): Item[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  saveItems: (items: Item[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  },

  // Generate unique IDs
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}