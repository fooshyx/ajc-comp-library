"use client"

import { useState } from "react"
import { Unit, Trait } from "@/types/tft"
import { processUnitImage, validateImageFile } from "@/lib/imageUtils"

interface UnitsManagerProps {
  units: Unit[]
  traits: Trait[]
  onAddUnit: (unit: Omit<Unit, "id">) => Promise<void>
  onEditUnit: (unit: Unit) => Promise<void>
  onDeleteUnit: (id: string) => Promise<void>
}

export default function UnitsManager({ units, traits, onAddUnit, onEditUnit, onDeleteUnit }: UnitsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    cost: 1,
    image: "",
    traits: [] as string[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCosts, setSelectedCosts] = useState<number[]>([1, 2, 3, 4, 5])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const resetForm = () => {
    setFormData({ name: "", cost: 1, image: "", traits: [] })
    setImageFile(null)
    setImagePreview(null)
    setIsAdding(false)
    setEditingUnit(null)
  }

  const handleCostFilterToggle = (cost: number) => {
    setSelectedCosts(prev => 
      prev.includes(cost) 
        ? prev.filter(c => c !== cost)
        : [...prev, cost]
    )
  }

  const filteredAndSortedUnits = units
    .filter(unit => selectedCosts.includes(unit.cost))
    .sort((a, b) => {
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
        const processedImage = await processUnitImage(imageFile)
        finalFormData.image = processedImage
      } catch (error) {
        alert('Error processing image. Please try again.')
        return
      }
    }
    
    if (editingUnit) {
      onEditUnit({ ...editingUnit, ...finalFormData })
    } else {
      onAddUnit(finalFormData)
    }
    
    resetForm()
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      cost: unit.cost,
      image: unit.image,
      traits: unit.traits
    })
    setImagePreview(unit.image || null)
    setIsAdding(true)
  }

  const handleTraitToggle = (traitName: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.includes(traitName)
        ? prev.traits.filter(t => t !== traitName)
        : [...prev.traits, traitName]
    }))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Unit
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">
            {editingUnit ? "Edit Unit" : "Add New Unit"}
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
                Cost
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image (128x128px)
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
                    <span className="text-sm text-gray-600">Preview (will be resized to 128x128px)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traits/Classes
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {traits.map(trait => (
                  <label key={trait.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.traits.includes(trait.name)}
                      onChange={() => handleTraitToggle(trait.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{trait.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingUnit ? "Update Unit" : "Add Unit"}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Existing Units</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Sort {sortOrder === 'asc' ? '↓' : '↑'} A-Z
              </button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Cost:
            </label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map(cost => (
                <label key={cost} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCosts.includes(cost)}
                    onChange={() => handleCostFilterToggle(cost)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{cost} cost</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {units.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No units created yet. Add your first unit above.
            </div>
          ) : filteredAndSortedUnits.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No units match the selected filters.
            </div>
          ) : (
            filteredAndSortedUnits.map(unit => (
              <div key={unit.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {unit.image && (
                    <img
                      src={unit.image}
                      alt={unit.name}
                      className="w-16 h-16 object-cover border border-gray-300 rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{unit.name}</h4>
                    <p className="text-sm text-gray-600">
                      Cost: {unit.cost} | Traits: {unit.traits.join(", ") || "None"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteUnit(unit.id)}
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