"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Unit, Trait, Component, Item } from "@/types/tft"
import UnitsManager from "@/components/admin/UnitsManager"
import TraitsManager from "@/components/admin/TraitsManager"
import ComponentsManager from "@/components/admin/ComponentsManager"
import ItemsManager from "@/components/admin/ItemsManager"
import UsersManager from "@/components/admin/UsersManager"
import CacheManager from "@/components/admin/CacheManager"
import MigrationTool from "@/components/MigrationTool"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"traits" | "units" | "components" | "items" | "users" | "cache">("traits")
  const [units, setUnits] = useState<Unit[]>([])
  const [traits, setTraits] = useState<Trait[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [items, setItems] = useState<Item[]>([])

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [unitsRes, traitsRes, componentsRes, itemsRes] = await Promise.all([
        fetch('/api/units'),
        fetch('/api/traits'),
        fetch('/api/components'),
        fetch('/api/items')
      ])

      if (unitsRes.ok) setUnits(await unitsRes.json())
      if (traitsRes.ok) setTraits(await traitsRes.json())
      if (componentsRes.ok) setComponents(await componentsRes.json())
      if (itemsRes.ok) setItems(await itemsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is admin
  if (!session.user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <div className="space-x-4">
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Go Home
            </a>
            <a
              href="/builder"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Composition Builder
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to generate unique IDs
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Trait handlers
  const handleAddTrait = async (traitData: Omit<Trait, "id">) => {
    try {
      const newTrait: Trait = {
        ...traitData,
        id: generateId()
      }
      
      const response = await fetch('/api/traits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrait)
      })
      
      if (response.ok) {
        const createdTrait = await response.json()
        setTraits(prev => [...prev, createdTrait])
      } else {
        console.error('Failed to create trait')
      }
    } catch (error) {
      console.error('Error creating trait:', error)
    }
  }

  const handleEditTrait = async (updatedTrait: Trait) => {
    try {
      const response = await fetch('/api/traits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrait)
      })
      
      if (response.ok) {
        const savedTrait = await response.json()
        setTraits(prev => prev.map(trait => 
          trait.id === savedTrait.id ? savedTrait : trait
        ))
      } else {
        console.error('Failed to update trait')
      }
    } catch (error) {
      console.error('Error updating trait:', error)
    }
  }

  const handleDeleteTrait = async (id: string) => {
    try {
      const response = await fetch(`/api/traits?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTraits(prev => prev.filter(trait => trait.id !== id))
      } else {
        console.error('Failed to delete trait')
      }
    } catch (error) {
      console.error('Error deleting trait:', error)
    }
  }

  // Unit handlers
  const handleAddUnit = async (unitData: Omit<Unit, "id">) => {
    try {
      const newUnit: Unit = {
        ...unitData,
        id: generateId()
      }
      
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit)
      })
      
      if (response.ok) {
        const createdUnit = await response.json()
        setUnits(prev => [...prev, createdUnit])
      } else {
        console.error('Failed to create unit')
      }
    } catch (error) {
      console.error('Error creating unit:', error)
    }
  }

  const handleEditUnit = async (updatedUnit: Unit) => {
    try {
      const response = await fetch('/api/units', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnit)
      })
      
      if (response.ok) {
        const savedUnit = await response.json()
        setUnits(prev => prev.map(unit => 
          unit.id === savedUnit.id ? savedUnit : unit
        ))
      } else {
        console.error('Failed to update unit')
      }
    } catch (error) {
      console.error('Error updating unit:', error)
    }
  }

  const handleDeleteUnit = async (id: string) => {
    try {
      const response = await fetch(`/api/units?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUnits(prev => prev.filter(unit => unit.id !== id))
      } else {
        console.error('Failed to delete unit')
      }
    } catch (error) {
      console.error('Error deleting unit:', error)
    }
  }

  // Component handlers
  const handleAddComponent = async (componentData: Omit<Component, "id">) => {
    try {
      const newComponent: Component = {
        ...componentData,
        id: generateId()
      }
      
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComponent)
      })
      
      if (response.ok) {
        const createdComponent = await response.json()
        setComponents(prev => [...prev, createdComponent])
      } else {
        console.error('Failed to create component')
      }
    } catch (error) {
      console.error('Error creating component:', error)
    }
  }

  const handleEditComponent = async (updatedComponent: Component) => {
    try {
      const response = await fetch('/api/components', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComponent)
      })
      
      if (response.ok) {
        const savedComponent = await response.json()
        setComponents(prev => prev.map(component => 
          component.id === savedComponent.id ? savedComponent : component
        ))
      } else {
        console.error('Failed to update component')
      }
    } catch (error) {
      console.error('Error updating component:', error)
    }
  }

  const handleDeleteComponent = async (id: string) => {
    try {
      const response = await fetch(`/api/components?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setComponents(prev => prev.filter(component => component.id !== id))
      } else {
        console.error('Failed to delete component')
      }
    } catch (error) {
      console.error('Error deleting component:', error)
    }
  }

  // Item handlers
  const handleAddItem = async (itemData: Omit<Item, "id">) => {
    try {
      const newItem: Item = {
        ...itemData,
        id: generateId()
      }
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })
      
      if (response.ok) {
        const createdItem = await response.json()
        setItems(prev => [...prev, createdItem])
      } else {
        console.error('Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  const handleEditItem = async (updatedItem: Item) => {
    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      
      if (response.ok) {
        const savedItem = await response.json()
        setItems(prev => prev.map(item => 
          item.id === savedItem.id ? savedItem : item
        ))
      } else {
        console.error('Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage TFT components: traits, units, components, items, and users</p>
      </div>

      {/* <MigrationTool /> */}

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("traits")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "traits"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Traits/Classes
          </button>
          <button
            onClick={() => setActiveTab("units")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "units"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setActiveTab("components")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "components"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Components
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "items"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("cache")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "cache"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Cache
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "traits" && (
          <TraitsManager
            traits={traits}
            onAddTrait={handleAddTrait}
            onEditTrait={handleEditTrait}
            onDeleteTrait={handleDeleteTrait}
          />
        )}
        
        {activeTab === "units" && (
          <UnitsManager
            units={units}
            traits={traits}
            onAddUnit={handleAddUnit}
            onEditUnit={handleEditUnit}
            onDeleteUnit={handleDeleteUnit}
          />
        )}
        
        {activeTab === "components" && (
          <ComponentsManager
            components={components}
            onAddComponent={handleAddComponent}
            onEditComponent={handleEditComponent}
            onDeleteComponent={handleDeleteComponent}
          />
        )}
        
        {activeTab === "items" && (
          <ItemsManager
            items={items}
            components={components}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        
        {activeTab === "users" && (
          <UsersManager />
        )}
        
        {activeTab === "cache" && (
          <CacheManager />
        )}
      </div>
    </div>
  )
}