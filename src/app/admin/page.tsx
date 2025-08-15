"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Unit, Trait, Component, Item } from "@/types/tft"
import { storageUtils } from "@/lib/storage"
import UnitsManager from "@/components/admin/UnitsManager"
import TraitsManager from "@/components/admin/TraitsManager"
import ComponentsManager from "@/components/admin/ComponentsManager"
import ItemsManager from "@/components/admin/ItemsManager"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"traits" | "units" | "components" | "items">("traits")
  const [units, setUnits] = useState<Unit[]>([])
  const [traits, setTraits] = useState<Trait[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnits(storageUtils.getUnits())
      setTraits(storageUtils.getTraits())
      setComponents(storageUtils.getComponents())
      setItems(storageUtils.getItems())
    }
  }, [])

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  // Trait handlers
  const handleAddTrait = (traitData: Omit<Trait, "id">) => {
    const newTrait: Trait = {
      ...traitData,
      id: storageUtils.generateId()
    }
    const updatedTraits = [...traits, newTrait]
    setTraits(updatedTraits)
    storageUtils.saveTraits(updatedTraits)
  }

  const handleEditTrait = (updatedTrait: Trait) => {
    const updatedTraits = traits.map(trait => 
      trait.id === updatedTrait.id ? updatedTrait : trait
    )
    setTraits(updatedTraits)
    storageUtils.saveTraits(updatedTraits)
  }

  const handleDeleteTrait = (id: string) => {
    const updatedTraits = traits.filter(trait => trait.id !== id)
    setTraits(updatedTraits)
    storageUtils.saveTraits(updatedTraits)
  }

  // Unit handlers
  const handleAddUnit = (unitData: Omit<Unit, "id">) => {
    const newUnit: Unit = {
      ...unitData,
      id: storageUtils.generateId()
    }
    const updatedUnits = [...units, newUnit]
    setUnits(updatedUnits)
    storageUtils.saveUnits(updatedUnits)
  }

  const handleEditUnit = (updatedUnit: Unit) => {
    const updatedUnits = units.map(unit => 
      unit.id === updatedUnit.id ? updatedUnit : unit
    )
    setUnits(updatedUnits)
    storageUtils.saveUnits(updatedUnits)
  }

  const handleDeleteUnit = (id: string) => {
    const updatedUnits = units.filter(unit => unit.id !== id)
    setUnits(updatedUnits)
    storageUtils.saveUnits(updatedUnits)
  }

  // Component handlers
  const handleAddComponent = (componentData: Omit<Component, "id">) => {
    const newComponent: Component = {
      ...componentData,
      id: storageUtils.generateId()
    }
    const updatedComponents = [...components, newComponent]
    setComponents(updatedComponents)
    storageUtils.saveComponents(updatedComponents)
  }

  const handleEditComponent = (updatedComponent: Component) => {
    const updatedComponents = components.map(component => 
      component.id === updatedComponent.id ? updatedComponent : component
    )
    setComponents(updatedComponents)
    storageUtils.saveComponents(updatedComponents)
  }

  const handleDeleteComponent = (id: string) => {
    const updatedComponents = components.filter(component => component.id !== id)
    setComponents(updatedComponents)
    storageUtils.saveComponents(updatedComponents)
  }

  // Item handlers
  const handleAddItem = (itemData: Omit<Item, "id">) => {
    const newItem: Item = {
      ...itemData,
      id: storageUtils.generateId()
    }
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    storageUtils.saveItems(updatedItems)
  }

  const handleEditItem = (updatedItem: Item) => {
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    )
    setItems(updatedItems)
    storageUtils.saveItems(updatedItems)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    setItems(updatedItems)
    storageUtils.saveItems(updatedItems)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage TFT components: traits, units, components, and items</p>
      </div>

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
      </div>
    </div>
  )
}