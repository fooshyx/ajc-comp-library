"use client"

import { useState } from "react"
import { Component } from "@/types/tft"
import { processComponentImage, validateImageFile } from "@/lib/imageUtils"

interface ComponentsManagerProps {
  components: Component[]
  onAddComponent: (component: Omit<Component, "id">) => void
  onEditComponent: (component: Component) => void
  onDeleteComponent: (id: string) => void
}

export default function ComponentsManager({ components, onAddComponent, onEditComponent, onDeleteComponent }: ComponentsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const resetForm = () => {
    setFormData({ name: "", image: "" })
    setImageFile(null)
    setImagePreview(null)
    setIsAdding(false)
    setEditingComponent(null)
  }

  const sortedComponents = components.sort((a, b) => {
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
        const processedImage = await processComponentImage(imageFile)
        finalFormData.image = processedImage
      } catch (error) {
        alert('Error processing image. Please try again.')
        return
      }
    }
    
    if (editingComponent) {
      onEditComponent({ ...editingComponent, ...finalFormData })
    } else {
      onAddComponent(finalFormData)
    }
    
    resetForm()
  }

  const handleEdit = (component: Component) => {
    setEditingComponent(component)
    setFormData({
      name: component.name,
      image: component.image
    })
    setImagePreview(component.image || null)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Components Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Component
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">
            {editingComponent ? "Edit Component" : "Add New Component"}
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
                Image (32x32px)
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
                    <span className="text-sm text-gray-600">Preview (32x32px actual size)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingComponent ? "Update Component" : "Add Component"}
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
            <h3 className="text-lg font-medium text-gray-900">Existing Components</h3>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sort {sortOrder === 'asc' ? '↓' : '↑'} A-Z
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {components.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No components created yet. Add your first component above.
            </div>
          ) : (
            sortedComponents.map(component => (
              <div key={component.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {component.image && (
                    <img
                      src={component.image}
                      alt={component.name}
                      className="w-8 h-8 object-cover border border-gray-300 rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(component)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteComponent(component.id)}
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