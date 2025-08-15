import { storageUtils } from './storage'
import { dbStorageUtils } from './dbStorage'
import { Unit, Trait, Component, Item } from '@/types/tft'
import { Composition, NewComposition } from '@/db/schema'

interface CacheMetadata {
  lastUpdated: string
  version: number
}

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const CACHE_VERSION = 1

class HybridStorage {
  private isClient = typeof window !== 'undefined'

  // Cache metadata management
  private getCacheMetadata(key: string): CacheMetadata | null {
    if (!this.isClient) return null
    try {
      const metadata = localStorage.getItem(`${key}_metadata`)
      return metadata ? JSON.parse(metadata) : null
    } catch {
      return null
    }
  }

  private setCacheMetadata(key: string, metadata: CacheMetadata): void {
    if (!this.isClient) return
    try {
      localStorage.setItem(`${key}_metadata`, JSON.stringify(metadata))
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }

  private isCacheValid(key: string): boolean {
    const metadata = this.getCacheMetadata(key)
    if (!metadata) return false
    
    const now = Date.now()
    const lastUpdated = new Date(metadata.lastUpdated).getTime()
    const isRecent = (now - lastUpdated) < CACHE_DURATION
    const isCorrectVersion = metadata.version === CACHE_VERSION
    
    return isRecent && isCorrectVersion
  }

  private updateCacheMetadata(key: string): void {
    this.setCacheMetadata(key, {
      lastUpdated: new Date().toISOString(),
      version: CACHE_VERSION
    })
  }

  // Game data methods (cached)
  async getUnits(): Promise<Unit[]> {
    try {
      // Check if cache is valid
      if (this.isClient && this.isCacheValid('units')) {
        const cached = storageUtils.getUnits()
        if (cached.length > 0) {
          return cached
        }
      }

      // Fetch from database
      const units = await dbStorageUtils.getUnits()
      
      // Update cache
      if (this.isClient) {
        storageUtils.saveUnits(units)
        this.updateCacheMetadata('units')
      }
      
      return units
    } catch (error) {
      console.error('Error fetching units:', error)
      // Fallback to cache even if stale
      if (this.isClient) {
        return storageUtils.getUnits()
      }
      return []
    }
  }

  async getTraits(): Promise<Trait[]> {
    try {
      if (this.isClient && this.isCacheValid('traits')) {
        const cached = storageUtils.getTraits()
        if (cached.length > 0) {
          return cached
        }
      }

      const traits = await dbStorageUtils.getTraits()
      
      if (this.isClient) {
        storageUtils.saveTraits(traits)
        this.updateCacheMetadata('traits')
      }
      
      return traits
    } catch (error) {
      console.error('Error fetching traits:', error)
      if (this.isClient) {
        return storageUtils.getTraits()
      }
      return []
    }
  }

  async getComponents(): Promise<Component[]> {
    try {
      if (this.isClient && this.isCacheValid('components')) {
        const cached = storageUtils.getComponents()
        if (cached.length > 0) {
          return cached
        }
      }

      const components = await dbStorageUtils.getComponents()
      
      if (this.isClient) {
        storageUtils.saveComponents(components)
        this.updateCacheMetadata('components')
      }
      
      return components
    } catch (error) {
      console.error('Error fetching components:', error)
      if (this.isClient) {
        return storageUtils.getComponents()
      }
      return []
    }
  }

  async getItems(): Promise<Item[]> {
    try {
      if (this.isClient && this.isCacheValid('items')) {
        const cached = storageUtils.getItems()
        if (cached.length > 0) {
          return cached
        }
      }

      const items = await dbStorageUtils.getItems()
      
      if (this.isClient) {
        storageUtils.saveItems(items)
        this.updateCacheMetadata('items')
      }
      
      return items
    } catch (error) {
      console.error('Error fetching items:', error)
      if (this.isClient) {
        return storageUtils.getItems()
      }
      return []
    }
  }

  // Get all game data efficiently
  async getAllGameData(): Promise<{
    units: Unit[]
    traits: Trait[]
    components: Component[]
    items: Item[]
  }> {
    try {
      // Check if all caches are valid
      const allCacheValid = this.isClient && 
        this.isCacheValid('units') &&
        this.isCacheValid('traits') &&
        this.isCacheValid('components') &&
        this.isCacheValid('items')

      if (allCacheValid) {
        const units = storageUtils.getUnits()
        const traits = storageUtils.getTraits()
        const components = storageUtils.getComponents()
        const items = storageUtils.getItems()

        if (units.length > 0 && traits.length > 0 && components.length > 0 && items.length > 0) {
          return { units, traits, components, items }
        }
      }

      // Fetch all from database in parallel
      const [units, traits, components, items] = await Promise.all([
        dbStorageUtils.getUnits(),
        dbStorageUtils.getTraits(),
        dbStorageUtils.getComponents(),
        dbStorageUtils.getItems()
      ])

      // Update all caches
      if (this.isClient) {
        storageUtils.saveUnits(units)
        storageUtils.saveTraits(traits)
        storageUtils.saveComponents(components)
        storageUtils.saveItems(items)
        
        this.updateCacheMetadata('units')
        this.updateCacheMetadata('traits')
        this.updateCacheMetadata('components')
        this.updateCacheMetadata('items')
      }

      return { units, traits, components, items }
    } catch (error) {
      console.error('Error fetching all game data:', error)
      // Fallback to cache
      if (this.isClient) {
        return {
          units: storageUtils.getUnits(),
          traits: storageUtils.getTraits(),
          components: storageUtils.getComponents(),
          items: storageUtils.getItems()
        }
      }
      return { units: [], traits: [], components: [], items: [] }
    }
  }

  // Composition methods (always use database)
  async getCompositions(userId?: string, publicOnly?: boolean): Promise<Composition[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      if (publicOnly) params.set('public', 'true')

      const response = await fetch(`/api/compositions?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch compositions')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching compositions:', error)
      return []
    }
  }

  async saveComposition(composition: Omit<NewComposition, 'id'>): Promise<Composition | null> {
    try {
      console.log('hybridStorage.saveComposition called with:', composition)
      
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composition)
      })

      console.log('API response status:', response.status)
      console.log('API response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to save composition: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('API success response:', result)
      return result
    } catch (error) {
      console.error('Error saving composition:', error)
      return null
    }
  }

  async updateComposition(composition: Partial<Composition> & { id: string }): Promise<Composition | null> {
    try {
      const response = await fetch('/api/compositions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composition)
      })

      if (!response.ok) throw new Error('Failed to update composition')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating composition:', error)
      return null
    }
  }

  async deleteComposition(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/compositions?id=${id}`, {
        method: 'DELETE'
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting composition:', error)
      return false
    }
  }

  // Cache management methods
  async refreshCache(): Promise<void> {
    try {
      console.log('Refreshing game data cache...')
      
      // Fetch fresh data from database
      const [units, traits, components, items] = await Promise.all([
        dbStorageUtils.getUnits(),
        dbStorageUtils.getTraits(),
        dbStorageUtils.getComponents(),
        dbStorageUtils.getItems()
      ])

      // Update cache
      if (this.isClient) {
        storageUtils.saveUnits(units)
        storageUtils.saveTraits(traits)
        storageUtils.saveComponents(components)
        storageUtils.saveItems(items)
        
        this.updateCacheMetadata('units')
        this.updateCacheMetadata('traits')
        this.updateCacheMetadata('components')
        this.updateCacheMetadata('items')
      }

      console.log('Cache refreshed successfully')
    } catch (error) {
      console.error('Error refreshing cache:', error)
    }
  }

  clearCache(): void {
    if (!this.isClient) return
    
    try {
      // Clear data
      localStorage.removeItem('tft_units')
      localStorage.removeItem('tft_traits')
      localStorage.removeItem('tft_components')
      localStorage.removeItem('tft_items')
      
      // Clear metadata
      localStorage.removeItem('units_metadata')
      localStorage.removeItem('traits_metadata')
      localStorage.removeItem('components_metadata')
      localStorage.removeItem('items_metadata')
      
      console.log('Cache cleared successfully')
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  getCacheStatus(): {
    units: { valid: boolean, lastUpdated?: string }
    traits: { valid: boolean, lastUpdated?: string }
    components: { valid: boolean, lastUpdated?: string }
    items: { valid: boolean, lastUpdated?: string }
  } {
    if (!this.isClient) {
      return {
        units: { valid: false },
        traits: { valid: false },
        components: { valid: false },
        items: { valid: false }
      }
    }

    return {
      units: {
        valid: this.isCacheValid('units'),
        lastUpdated: this.getCacheMetadata('units')?.lastUpdated
      },
      traits: {
        valid: this.isCacheValid('traits'),
        lastUpdated: this.getCacheMetadata('traits')?.lastUpdated
      },
      components: {
        valid: this.isCacheValid('components'),
        lastUpdated: this.getCacheMetadata('components')?.lastUpdated
      },
      items: {
        valid: this.isCacheValid('items'),
        lastUpdated: this.getCacheMetadata('items')?.lastUpdated
      }
    }
  }
}

export const hybridStorage = new HybridStorage()