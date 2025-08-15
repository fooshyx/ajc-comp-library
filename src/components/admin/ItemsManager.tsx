"use client"

import { useState } from "react"
import { Item, ItemType, Component } from "@/types/tft"
import { processItemImage, validateImageFile } from "@/lib/imageUtils"

interface ItemsManagerProps {
  items: Item[]
  components: Component[]
  onAddItem: (item: Omit<Item, "id">) => void
  onEditItem: (item: Item) => void
  onDeleteItem: (id: string) => void
}

const itemTypes: ItemType[] = ['standard', 'emblem', 'artifact', 'other']

export default function ItemsManager({ items, components, onAddItem, onEditItem, onDeleteItem }: ItemsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "standard" as ItemType,
    image: "",
    recipe: null as string[] | null
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const resetForm = () => {
    setFormData({ name: "", type: "standard", image: "", recipe: null })
    setImageFile(null)
    setImagePreview(null)
    setSelectedComponents([])
    setIsAdding(false)
    setEditingItem(null)
  }

  const sortedItems = items.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalFormData = { ...formData }
    
    if (imageFile) {
      try {
        const processedImage = await processItemImage(imageFile)
        finalFormData.image = processedImage
      } catch (error) {
        alert('Error processing image. Please try again.')
        return
      }
    }

    // Set recipe from selected components
    if (selectedComponents.length > 0) {
      finalFormData.recipe = selectedComponents
    } else {
      finalFormData.recipe = null
    }
    
    if (editingItem) {
      onEditItem({ ...editingItem, ...finalFormData })
    } else {
      onAddItem(finalFormData)
    }
    
    resetForm()
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      image: item.image,
      recipe: item.recipe
    })
    setSelectedComponents(item.recipe || [])
    setImagePreview(item.image || null)
    setIsAdding(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!validateImageFile(file)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP, AVIF) under 5MB.')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  const getComponentName = (componentId: string): string => {
    const component = components.find(c => c.id === componentId)
    return component?.name || 'Unknown Component'
  }

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case 'standard': return 'bg-gray-100 text-gray-800'
      case 'emblem': return 'bg-purple-100 text-purple-800'
      case 'artifact': return 'bg-blue-100 text-blue-800'
      case 'other': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Items Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? "Edit Item" : "Add New Item"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ItemType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {itemTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (64x64px)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Preview (will be resized to 64x64px)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Components (optional)
              </label>
              <div className="space-y-2">
                {components.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No components available. Create components first.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    {components.map(component => (
                      <label key={component.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(component.id)}
                          onChange={() => handleComponentToggle(component.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{component.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectedComponents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Selected components:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedComponents.map(componentId => (
                        <span
                          key={componentId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {getComponentName(componentId)}
                          <button
                            type="button"
                            onClick={() => handleComponentToggle(componentId)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the components needed to craft this item
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Existing Items</h3>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sort {sortOrder === 'asc' ? '↓' : '↑'} A-Z
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No items created yet. Add your first item above.
            </div>
          ) : (
            sortedItems.map(item => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover border border-gray-300 rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    {item.recipe && (
                      <p className="text-sm text-gray-600">
                        Recipe: {item.recipe.map(componentId => getComponentName(componentId)).join(' + ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}