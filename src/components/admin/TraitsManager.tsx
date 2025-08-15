"use client"

import { useState } from "react"
import { Trait, Breakpoint, BreakpointColor } from "@/types/tft"
import { processSVGFile, validateSVGFile, createSVGDataURL } from "@/lib/svgUtils"
import { BREAKPOINT_COLORS, getBreakpointColorHex, getBreakpointColorName, getAllBreakpointColors } from "@/lib/traitColors"

interface TraitsManagerProps {
  traits: Trait[]
  onAddTrait: (trait: Omit<Trait, "id">) => Promise<void>
  onEditTrait: (trait: Trait) => Promise<void>
  onDeleteTrait: (id: string) => Promise<void>
}

export default function TraitsManager({ traits, onAddTrait, onEditTrait, onDeleteTrait }: TraitsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingTrait, setEditingTrait] = useState<Trait | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    breakpoints: [] as Breakpoint[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const resetForm = () => {
    setFormData({ name: "", image: "", breakpoints: [] })
    setImageFile(null)
    setImagePreview(null)
    setIsAdding(false)
    setEditingTrait(null)
  }

  const sortedTraits = traits.sort((a, b) => {
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
        const processedSVG = await processSVGFile(imageFile)
        finalFormData.image = processedSVG
      } catch (error) {
        alert('Error processing SVG. Please try again.')
        return
      }
    }
    
    if (editingTrait) {
      onEditTrait({ ...editingTrait, ...finalFormData })
    } else {
      onAddTrait(finalFormData)
    }
    
    resetForm()
  }

  const handleEdit = (trait: Trait) => {
    setEditingTrait(trait)
    setFormData({
      name: trait.name,
      image: trait.image,
      breakpoints: [...trait.breakpoints]
    })
    // Convert SVG content to data URL for preview
    if (trait.image) {
      const dataUrl = createSVGDataURL(trait.image)
      setImagePreview(dataUrl)
    } else {
      setImagePreview(null)
    }
    setIsAdding(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!validateSVGFile(file)) {
        alert('Please select a valid SVG file under 1MB.')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const svgContent = e.target?.result as string
        const dataUrl = createSVGDataURL(svgContent)
        setImagePreview(dataUrl)
      }
      reader.readAsText(file)
    }
  }

  const addBreakpoint = () => {
    setFormData(prev => ({
      ...prev,
      breakpoints: [...prev.breakpoints, { num: 1, color: "bronze" }]
    }))
  }

  const removeBreakpoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breakpoints: prev.breakpoints.filter((_, i) => i !== index)
    }))
  }

  const updateBreakpoint = (index: number, field: keyof Breakpoint, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      breakpoints: prev.breakpoints.map((bp, i) => 
        i === index ? { ...bp, [field]: value } : bp
      )
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Traits/Classes Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Trait
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">
            {editingTrait ? "Edit Trait" : "Add New Trait"}
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
                SVG Image (64x64px)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-600">SVG Preview (64x64px)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Breakpoints
                </label>
                <button
                  type="button"
                  onClick={addBreakpoint}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Breakpoint
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.breakpoints.map((breakpoint, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Number</label>
                      <input
                        type="number"
                        min="1"
                        value={breakpoint.num}
                        onChange={(e) => updateBreakpoint(index, "num", parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <select
                        value={breakpoint.color}
                        onChange={(e) => updateBreakpoint(index, "color", e.target.value as BreakpointColor)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {getAllBreakpointColors().map(color => (
                          <option key={color} value={color}>
                            {getBreakpointColorName(color)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreakpoint(index)}
                      className="mt-5 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                {formData.breakpoints.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No breakpoints added yet.</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingTrait ? "Update Trait" : "Add Trait"}
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
            <h3 className="text-lg font-medium text-gray-900">Existing Traits</h3>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sort {sortOrder === 'asc' ? '↓' : '↑'} A-Z
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {traits.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No traits created yet. Add your first trait above.
            </div>
          ) : (
            sortedTraits.map(trait => (
              <div key={trait.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {trait.image && (
                      <div 
                        className="w-12 h-12 border border-gray-300 rounded flex items-center justify-center overflow-hidden"
                        style={{ maxWidth: '48px', maxHeight: '48px' }}
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: trait.image }}
                          style={{ 
                            fontSize: '0',
                            lineHeight: '0'
                          }}
                        />
                      </div>
                    )}
                    <h4 className="font-medium text-gray-900">{trait.name}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(trait)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteTrait(trait.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {trait.breakpoints.map((bp, index) => {
                    const colorHex = getBreakpointColorHex(bp.color)
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-2 py-1 rounded text-sm border"
                        style={{ backgroundColor: colorHex + "20", borderColor: colorHex }}
                      >
                        <span className="font-medium">{bp.num}</span>
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span className="text-xs text-gray-600">{getBreakpointColorName(bp.color)}</span>
                      </div>
                    )
                  })}
                  {trait.breakpoints.length === 0 && (
                    <span className="text-sm text-gray-500 italic">No breakpoints</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}