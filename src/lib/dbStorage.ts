"use client"

import { Unit, Trait, Component, Item } from "@/types/tft"

const API_BASE = '/api'

export const dbStorageUtils = {
  // Generate unique IDs
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Traits
  getTraits: async (): Promise<Trait[]> => {
    try {
      const response = await fetch(`${API_BASE}/traits`)
      if (!response.ok) throw new Error('Failed to fetch traits')
      return await response.json()
    } catch (error) {
      console.error('Error fetching traits:', error)
      return []
    }
  },

  saveTrait: async (trait: Omit<Trait, "id">): Promise<Trait | null> => {
    try {
      const traitWithId = { ...trait, id: dbStorageUtils.generateId() }
      const response = await fetch(`${API_BASE}/traits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(traitWithId)
      })
      if (!response.ok) throw new Error('Failed to save trait')
      return await response.json()
    } catch (error) {
      console.error('Error saving trait:', error)
      return null
    }
  },

  updateTrait: async (trait: Trait): Promise<Trait | null> => {
    try {
      const response = await fetch(`${API_BASE}/traits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trait)
      })
      if (!response.ok) throw new Error('Failed to update trait')
      return await response.json()
    } catch (error) {
      console.error('Error updating trait:', error)
      return null
    }
  },

  deleteTrait: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/traits?id=${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting trait:', error)
      return false
    }
  },

  // Units
  getUnits: async (): Promise<Unit[]> => {
    try {
      const response = await fetch(`${API_BASE}/units`)
      if (!response.ok) throw new Error('Failed to fetch units')
      return await response.json()
    } catch (error) {
      console.error('Error fetching units:', error)
      return []
    }
  },

  saveUnit: async (unit: Omit<Unit, "id">): Promise<Unit | null> => {
    try {
      const unitWithId = { ...unit, id: dbStorageUtils.generateId() }
      const response = await fetch(`${API_BASE}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitWithId)
      })
      if (!response.ok) throw new Error('Failed to save unit')
      return await response.json()
    } catch (error) {
      console.error('Error saving unit:', error)
      return null
    }
  },

  updateUnit: async (unit: Unit): Promise<Unit | null> => {
    try {
      const response = await fetch(`${API_BASE}/units`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unit)
      })
      if (!response.ok) throw new Error('Failed to update unit')
      return await response.json()
    } catch (error) {
      console.error('Error updating unit:', error)
      return null
    }
  },

  deleteUnit: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/units?id=${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting unit:', error)
      return false
    }
  },

  // Components
  getComponents: async (): Promise<Component[]> => {
    try {
      const response = await fetch(`${API_BASE}/components`)
      if (!response.ok) throw new Error('Failed to fetch components')
      return await response.json()
    } catch (error) {
      console.error('Error fetching components:', error)
      return []
    }
  },

  saveComponent: async (component: Omit<Component, "id">): Promise<Component | null> => {
    try {
      const componentWithId = { ...component, id: dbStorageUtils.generateId() }
      const response = await fetch(`${API_BASE}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componentWithId)
      })
      if (!response.ok) throw new Error('Failed to save component')
      return await response.json()
    } catch (error) {
      console.error('Error saving component:', error)
      return null
    }
  },

  updateComponent: async (component: Component): Promise<Component | null> => {
    try {
      const response = await fetch(`${API_BASE}/components`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(component)
      })
      if (!response.ok) throw new Error('Failed to update component')
      return await response.json()
    } catch (error) {
      console.error('Error updating component:', error)
      return null
    }
  },

  deleteComponent: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/components?id=${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting component:', error)
      return false
    }
  },

  // Items
  getItems: async (): Promise<Item[]> => {
    try {
      const response = await fetch(`${API_BASE}/items`)
      if (!response.ok) throw new Error('Failed to fetch items')
      return await response.json()
    } catch (error) {
      console.error('Error fetching items:', error)
      return []
    }
  },

  saveItem: async (item: Omit<Item, "id">): Promise<Item | null> => {
    try {
      const itemWithId = { ...item, id: dbStorageUtils.generateId() }
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      })
      if (!response.ok) throw new Error('Failed to save item')
      return await response.json()
    } catch (error) {
      console.error('Error saving item:', error)
      return null
    }
  },

  updateItem: async (item: Item): Promise<Item | null> => {
    try {
      const response = await fetch(`${API_BASE}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!response.ok) throw new Error('Failed to update item')
      return await response.json()
    } catch (error) {
      console.error('Error updating item:', error)
      return null
    }
  },

  deleteItem: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/items?id=${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting item:', error)
      return false
    }
  }
}