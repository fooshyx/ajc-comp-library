"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { hybridStorage } from "@/lib/hybridStorage"
import { Unit, Trait, Component, Item } from "@/types/tft"
import { Composition } from "@/db/schema"

interface BoardUnit {
  unitId: string
  position: number
  items: string[]
}

interface CompositionData {
  id?: string // Add ID for editing
  name: string
  description: string
  units: BoardUnit[]
  rating: 'S' | 'A' | 'B' | 'C' | ''
  isPublic: boolean
}

interface CompositionBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  editComposition?: Composition | null
  onSave?: () => void
}

export default function CompositionBuilderModal({ 
  isOpen, 
  onClose, 
  editComposition = null, 
  onSave 
}: CompositionBuilderModalProps) {
  const { data: session } = useSession()

  // Security check: Don't allow editing if user doesn't own the composition
  useEffect(() => {
    if (isOpen && editComposition && session?.user?.id) {
      const isOwner = editComposition.userId === session.user.id
      const isAdmin = session.user.isAdmin
      
      if (!isOwner && !isAdmin) {
        alert('You can only edit your own compositions')
        onClose()
        return
      }
    }
  }, [isOpen, editComposition, session, onClose])
  
  // Game data (cached for performance)
  const [units, setUnits] = useState<Unit[]>([])
  const [traits, setTraits] = useState<Trait[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [components, setComponents] = useState<Component[]>([])
  
  // Filtering and UI state
  const [selectedCosts, setSelectedCosts] = useState<number[]>([1, 2, 3, 4, 5])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Composition state
  const [composition, setComposition] = useState<CompositionData>({
    name: "",
    description: "",
    units: [],
    rating: "",
    isPublic: false
  })
  
  // Board state (28 hexagons in TFT)
  const [board, setBoard] = useState<(BoardUnit | null)[]>(Array(28).fill(null))
  
  // UI state
  const [activeTab, setActiveTab] = useState<"units" | "traits" | "items">("units")
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [itemSortType, setItemSortType] = useState<'all' | 'standard' | 'emblem' | 'artifact' | 'other'>('all')
  
  // Load game data on mount
  useEffect(() => {
    if (isOpen) {
      loadGameData()
    }
  }, [isOpen])

  // Load composition for editing
  useEffect(() => {
    if (isOpen && editComposition) {
      setComposition({
        id: editComposition.id,
        name: editComposition.name,
        description: editComposition.description || '',
        units: editComposition.units,
        rating: (editComposition.rating as 'S' | 'A' | 'B' | 'C') || '',
        isPublic: editComposition.isPublic
      })
    } else if (isOpen && !editComposition) {
      // Reset for new composition
      setComposition({
        name: "",
        description: "",
        units: [],
        rating: "",
        isPublic: false
      })
    }
  }, [isOpen, editComposition])
  
  const loadGameData = async () => {
    try {
      setLoading(true)
      const gameData = await hybridStorage.getAllGameData()
      setUnits(gameData.units)
      setTraits(gameData.traits)
      setItems(gameData.items)
      setComponents(gameData.components)
    } catch (error) {
      console.error('Error loading game data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Sync board with composition units
  useEffect(() => {
    const newBoard = Array(28).fill(null)
    composition.units.forEach(unit => {
      if (unit.position >= 0 && unit.position < 28) {
        newBoard[unit.position] = unit
      }
    })
    setBoard(newBoard)
  }, [composition.units])
  
  // Filter units based on cost and search
  const filteredUnits = units.filter(unit => {
    const matchesCost = selectedCosts.includes(unit.cost)
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCost && matchesSearch
  })
  
  // Calculate active traits with breakpoints
  const activeTraits = traits.map(trait => {
    const count = composition.units.filter(boardUnit => {
      const unit = units.find(u => u.id === boardUnit.unitId)
      return unit?.traits.includes(trait.name)
    }).length
    
    if (count === 0) return null
    
    // Find the highest active breakpoint
    const activeBreakpoint = trait.breakpoints
      .filter(bp => count >= bp.num)
      .sort((a, b) => b.num - a.num)[0]
    
    return { 
      ...trait, 
      count, 
      activeBreakpoint: activeBreakpoint || null,
      isActive: count > 0
    }
  }).filter((trait): trait is NonNullable<typeof trait> => trait !== null)
  
  // Filter items based on selected type
  const filteredItems = itemSortType === 'all' 
    ? items 
    : items.filter(item => item.type === itemSortType)
  
  // Handle placing a unit on the board
  const handlePlaceUnit = (unit: Unit) => {
    if (selectedPosition === null || board[selectedPosition]) return
    
    const newBoardUnit: BoardUnit = {
      unitId: unit.id,
      position: selectedPosition,
      items: []
    }
    
    setComposition(prev => ({
      ...prev,
      units: [...prev.units, newBoardUnit]
    }))
    
    // Clear selection after placing
    setSelectedPosition(null)
    setActiveTab('units')
  }
  
  // Handle removing unit from board
  const handleRemoveUnit = (position: number) => {
    setComposition(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.position !== position)
    }))
    
    // Clear selection if removing the selected unit
    if (selectedPosition === position) {
      setSelectedPosition(null)
    }
  }
  
  // Handle adding item to unit
  const handleAddItemToUnit = (itemId: string) => {
    if (selectedPosition === null) return
    
    const boardUnit = board[selectedPosition]
    if (!boardUnit || boardUnit.items.length >= 3) return
    
    setComposition(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.position === selectedPosition 
          ? { ...unit, items: [...unit.items, itemId] }
          : unit
      )
    }))
  }
  
  // Handle removing item from unit
  const handleRemoveItemFromUnit = (itemIndex: number) => {
    if (selectedPosition === null) return
    
    setComposition(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.position === selectedPosition 
          ? { ...unit, items: unit.items.filter((_, index) => index !== itemIndex) }
          : unit
      )
    }))
  }
  
  // Handle board square click
  const handleSquareClick = (position: number) => {
    const boardUnit = board[position]
    
    if (boardUnit) {
      // Square has a unit - select it for item management
      setSelectedPosition(position)
      setActiveTab('items')
    } else {
      // Empty square - select it for unit placement
      setSelectedPosition(position)
      setActiveTab('units')
    }
  }
  
  // Save composition
  const handleSaveComposition = async () => {
    if (!session?.user?.id) {
      alert('Please log in first')
      return
    }
    
    if (!composition.name.trim()) {
      alert('Please provide a composition name')
      return
    }
    
    if (composition.units.length === 0) {
      alert('Please add at least one unit to your composition')
      return
    }
    
    try {
      let result
      
      if (composition.id) {
        // Update existing composition
        const updateData = {
          id: composition.id,
          name: composition.name.trim(),
          description: composition.description.trim() || null,
          units: composition.units,
          rating: composition.rating || null,
          isPublic: composition.isPublic
        }
        result = await hybridStorage.updateComposition(updateData)
      } else {
        // Create new composition
        const compositionData = {
          userId: session.user.id,
          addedBy: session.user.name || session.user.email || 'Unknown',
          name: composition.name.trim(),
          description: composition.description.trim() || null,
          units: composition.units,
          rating: composition.rating || null,
          isPublic: composition.isPublic
        }
        result = await hybridStorage.saveComposition(compositionData)
      }
      
      if (result) {
        alert(composition.id ? 'Composition updated successfully!' : 'Composition saved successfully!')
        onSave?.()
        onClose()
      } else {
        alert('Failed to save composition')
      }
    } catch (error) {
      console.error('Error saving composition:', error)
      alert(`Failed to save composition: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // Clear board
  const handleClearBoard = () => {
    setComposition(prev => ({ ...prev, units: [] }))
  }
  
  // Get rating color
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'S': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 'A': return 'bg-gradient-to-r from-green-400 to-green-600 text-white'
      case 'B': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
      case 'C': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
      default: return 'bg-gray-200 text-gray-600'
    }
  }

  if (!isOpen) return null
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-lg">Loading game data...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editComposition ? 'Edit Composition' : 'Build Composition'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Build and save your TFT team compositions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Composition Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Composition Name"
                value={composition.name}
                onChange={(e) => setComposition(prev => ({ ...prev, name: e.target.value }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={composition.description}
                onChange={(e) => setComposition(prev => ({ ...prev, description: e.target.value }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div>
                <select
                  value={composition.rating}
                  onChange={(e) => setComposition(prev => ({ ...prev, rating: e.target.value as 'S' | 'A' | 'B' | 'C' | '' }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Rating (Optional)</option>
                  <option value="S">S Tier - Meta</option>
                  <option value="A">A Tier - Strong</option>
                  <option value="B">B Tier - Good</option>
                  <option value="C">C Tier - Situational</option>
                </select>
              </div>
            </div>
            
            {/* Rating Preview */}
            {composition.rating && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Rating Preview:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(composition.rating)}`}>
                    {composition.rating} Tier
                  </span>
                </div>
              </div>
            )}

            {/* Public Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={composition.isPublic}
                  onChange={(e) => setComposition(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this composition public
                </span>
                <span className="text-xs text-gray-500">
                  (Public compositions can be viewed by all users)
                </span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveComposition}
                disabled={!session || !composition.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editComposition ? 'Update Composition' : 'Save Composition'}
              </button>
              
              <button
                onClick={handleClearBoard}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear Board
              </button>

              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Panel - Game Data */}
            <div className="lg:col-span-1">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab("units")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "units"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Units ({filteredUnits.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("traits")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "traits"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Traits ({activeTraits.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("items")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "items"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Items ({items.length})
                    </button>
                  </nav>
                </div>
                
                <div className="p-6">
                  {/* Units Tab */}
                  {activeTab === "units" && (
                    <div className="space-y-4">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search units..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      
                      {/* Cost Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cost Filter</label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map(cost => (
                            <label key={cost} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCosts.includes(cost)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCosts(prev => [...prev, cost])
                                  } else {
                                    setSelectedCosts(prev => prev.filter(c => c !== cost))
                                  }
                                }}
                                className="mr-1"
                              />
                              <span className="text-sm">{cost} cost</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Selected Square Info */}
                      {selectedPosition !== null && !board[selectedPosition] && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800 font-medium">
                            Position {selectedPosition + 1} selected - Choose a unit to place
                          </p>
                        </div>
                      )}
                      
                      {/* Units List */}
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {filteredUnits.map(unit => (
                          <div
                            key={unit.id}
                            className={`
                              flex items-center p-2 rounded-md cursor-pointer transition-colors
                              ${selectedPosition !== null && !board[selectedPosition] 
                                ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                                : 'bg-gray-50 hover:bg-gray-100'}
                            `}
                            onClick={() => handlePlaceUnit(unit)}
                          >
                            <img
                              src={unit.image}
                              alt={unit.name}
                              className="w-8 h-8 rounded mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{unit.name}</div>
                              <div className="text-xs text-gray-500">
                                Cost: {unit.cost} | {unit.traits.join(", ")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedPosition === null && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            Select an empty square on the board first, then choose a unit to place there.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Traits Tab */}
                  {activeTab === "traits" && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {activeTraits.map(trait => (
                        <div key={trait.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                          <div
                            className="w-8 h-8 rounded mr-3 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: trait.image }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{trait.name}</div>
                            <div className="text-xs text-gray-500">
                              Active: {trait.count} units
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {activeTraits.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          Place units on the board to see active traits
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Items Tab */}
                  {activeTab === "items" && (
                    <div className="space-y-4">
                      {/* Selected Unit Info */}
                      {selectedPosition !== null && board[selectedPosition] && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center">
                            <img
                              src={units.find(u => u.id === board[selectedPosition]?.unitId)?.image}
                              alt="Selected unit"
                              className="w-6 h-6 rounded mr-2"
                            />
                            <div>
                              <p className="text-sm text-green-800 font-medium">
                                Managing items for {units.find(u => u.id === board[selectedPosition]?.unitId)?.name}
                              </p>
                              <p className="text-xs text-green-600">
                                {board[selectedPosition]?.items.length || 0}/3 items equipped
                              </p>
                            </div>
                          </div>
                          
                          {/* Current Items */}
                          {board[selectedPosition]?.items.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-green-700 mb-2">Current Items:</p>
                              <div className="flex flex-wrap gap-2">
                                {board[selectedPosition]?.items.map((itemId, itemIndex) => {
                                  const item = items.find(i => i.id === itemId)
                                  return (
                                    <div
                                      key={itemIndex}
                                      className="flex items-center bg-white rounded px-2 py-1 border border-green-200 cursor-pointer hover:bg-red-50"
                                      onClick={() => handleRemoveItemFromUnit(itemIndex)}
                                    >
                                      <img
                                        src={item?.image}
                                        alt={item?.name}
                                        className="w-4 h-4 rounded mr-1"
                                      />
                                      <span className="text-xs">{item?.name}</span>
                                      <span className="ml-1 text-red-500 hover:text-red-700">×</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Item Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                        <div className="flex flex-wrap gap-2">
                          {(['all', 'standard', 'emblem', 'artifact', 'other'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setItemSortType(type)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                itemSortType === type
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Items List */}
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredItems.map(item => (
                          <div
                            key={item.id}
                            className={`
                              flex items-center p-2 rounded-md cursor-pointer transition-colors
                              ${selectedPosition !== null && board[selectedPosition] && board[selectedPosition]?.items.length < 3
                                ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
                                : 'bg-gray-50 hover:bg-gray-100'}
                            `}
                            onClick={() => handleAddItemToUnit(item.id)}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500 capitalize">{item.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedPosition === null && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            Select a unit on the board to manage its items.
                          </p>
                        </div>
                      )}
                      
                      {selectedPosition !== null && !board[selectedPosition] && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            The selected square is empty. Place a unit first to manage items.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Panel - Board */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Team Board</h3>
                
                {/* Active Traits Display */}
                {activeTraits.length > 0 && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Active Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeTraits.map(trait => (
                        <div 
                          key={trait.id}
                          className="flex items-center space-x-2 bg-white rounded-lg p-2 border"
                          style={{ 
                            borderColor: trait.activeBreakpoint?.color || '#e5e7eb',
                            backgroundColor: trait.activeBreakpoint ? `${trait.activeBreakpoint.color}10` : 'white'
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: trait.image }}
                          />
                          <div className="text-sm">
                            <span className="font-medium">{trait.name}</span>
                            <span 
                              className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold text-white"
                              style={{ backgroundColor: trait.activeBreakpoint?.color || '#6b7280' }}
                            >
                              {trait.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Board Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {board.map((boardUnit, index) => {
                    const unit = boardUnit ? units.find(u => u.id === boardUnit.unitId) : null
                    const isSelected = selectedPosition === index
                    
                    return (
                      <div
                        key={index}
                        className={`
                          aspect-square border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer relative
                          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                          ${unit ? 'bg-gray-100' : 'bg-gray-50'}
                        `}
                        onClick={() => handleSquareClick(index)}
                      >
                        {unit && boardUnit ? (
                          <>
                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveUnit(index)
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs z-10"
                            >
                              ×
                            </button>
                            
                            <img
                              src={unit.image}
                              alt={unit.name}
                              className="w-8 h-8 rounded mb-1"
                            />
                            <div className="text-xs text-center font-medium truncate w-full px-1">{unit.name}</div>
                            
                            {/* Items display */}
                            {boardUnit.items.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {boardUnit.items.slice(0, 3).map((itemId, itemIndex) => {
                                  const item = items.find(i => i.id === itemId)
                                  return (
                                    <img
                                      key={itemIndex}
                                      src={item?.image}
                                      alt={item?.name}
                                      className="w-3 h-3 rounded border border-gray-400"
                                    />
                                  )
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-400 text-center">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Instructions */}
                <div className="text-sm text-gray-600">
                  <p><strong>Workflow:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Step 1:</strong> Click an empty square on the board to select it</li>
                    <li><strong>Step 2:</strong> Choose a unit from the Units tab to place there</li>
                    <li><strong>Step 3:</strong> Click a unit on the board to manage its items</li>
                    <li><strong>Remove:</strong> Use the red × button on any unit to remove it</li>
                    <li><strong>Items:</strong> Click equipped items in the management panel to remove them</li>
                  </ul>
                </div>
                
                {selectedPosition !== null && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      {board[selectedPosition] 
                        ? `Managing position ${selectedPosition + 1} - Switch to Items tab to equip items`
                        : `Position ${selectedPosition + 1} selected - Switch to Units tab to place a unit`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}