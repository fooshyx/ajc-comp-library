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
  name: string
  description: string
  units: BoardUnit[]
}

export default function CompositionBuilder() {
  const { data: session } = useSession()
  
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
    units: []
  })
  
  // Board state (28 hexagons in TFT)
  const [board, setBoard] = useState<(BoardUnit | null)[]>(Array(28).fill(null))
  
  // UI state
  const [activeTab, setActiveTab] = useState<"units" | "traits" | "items">("units")
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  
  // Load game data on mount
  useEffect(() => {
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
    
    loadGameData()
  }, [])
  
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
  
  // Calculate active traits
  const activeTraits = traits.filter(trait => {
    const unitsWithTrait = composition.units.filter(boardUnit => {
      const unit = units.find(u => u.id === boardUnit.unitId)
      return unit?.traits.includes(trait.name)
    }).length
    
    return unitsWithTrait > 0
  }).map(trait => {
    const count = composition.units.filter(boardUnit => {
      const unit = units.find(u => u.id === boardUnit.unitId)
      return unit?.traits.includes(trait.name)
    }).length
    
    return { ...trait, count }
  })
  
  // Handle placing a unit on the board
  const handlePlaceUnit = (unit: Unit, position: number) => {
    if (board[position]) return // Position occupied
    
    const newBoardUnit: BoardUnit = {
      unitId: unit.id,
      position,
      items: []
    }
    
    setComposition(prev => ({
      ...prev,
      units: [...prev.units, newBoardUnit]
    }))
  }
  
  // Handle removing unit from board
  const handleRemoveUnit = (position: number) => {
    setComposition(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.position !== position)
    }))
  }
  
  // Handle adding item to unit
  const handleAddItemToUnit = (position: number, itemId: string) => {
    const boardUnit = board[position]
    if (!boardUnit || boardUnit.items.length >= 3) return
    
    setComposition(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.position === position 
          ? { ...unit, items: [...unit.items, itemId] }
          : unit
      )
    }))
  }
  
  // Handle removing item from unit
  const handleRemoveItemFromUnit = (position: number, itemIndex: number) => {
    setComposition(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.position === position 
          ? { ...unit, items: unit.items.filter((_, index) => index !== itemIndex) }
          : unit
      )
    }))
  }
  
  // Save composition
  const handleSaveComposition = async () => {
    if (!session?.user?.id || !composition.name.trim()) {
      alert('Please log in and provide a composition name')
      return
    }
    
    try {
      const result = await hybridStorage.saveComposition({
        userId: session.user.id,
        name: composition.name,
        description: composition.description,
        units: composition.units,
        isPublic: false
      })
      
      if (result) {
        alert('Composition saved successfully!')
      } else {
        alert('Failed to save composition')
      }
    } catch (error) {
      console.error('Error saving composition:', error)
      alert('Failed to save composition')
    }
  }
  
  // Clear board
  const handleClearBoard = () => {
    setComposition(prev => ({ ...prev, units: [] }))
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading game data...</div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Composition Builder</h1>
        <p className="text-gray-600 mt-2">Build and save your TFT team compositions</p>
      </div>
      
      {/* Composition Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Composition Name"
            value={composition.name}
            onChange={(e) => setComposition(prev => ({ ...prev, name: e.target.value }))}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={composition.description}
            onChange={(e) => setComposition(prev => ({ ...prev, description: e.target.value }))}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSaveComposition}
            disabled={!session || !composition.name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Save Composition
          </button>
          
          <button
            onClick={handleClearBoard}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Clear Board
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
                  
                  {/* Units List */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredUnits.map(unit => (
                      <div
                        key={unit.id}
                        className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedUnit(unit)}
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
                </div>
              )}
              
              {/* Traits Tab */}
              {activeTab === "traits" && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (selectedPosition !== null) {
                          handleAddItemToUnit(selectedPosition, item.id)
                        }
                      }}
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
              )}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Board */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Team Board</h3>
            
            {/* Board Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {board.map((boardUnit, index) => {
                const unit = boardUnit ? units.find(u => u.id === boardUnit.unitId) : null
                const isSelected = selectedPosition === index
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                      ${unit ? 'bg-gray-100' : 'bg-gray-50'}
                    `}
                    onClick={() => {
                      if (unit) {
                        setSelectedPosition(isSelected ? null : index)
                      } else if (selectedUnit) {
                        handlePlaceUnit(selectedUnit, index)
                        setSelectedUnit(null)
                      } else {
                        setSelectedPosition(isSelected ? null : index)
                      }
                    }}
                    onDoubleClick={() => {
                      if (unit) {
                        handleRemoveUnit(index)
                        setSelectedPosition(null)
                      }
                    }}
                  >
                    {unit && boardUnit ? (
                      <>
                        <img
                          src={unit.image}
                          alt={unit.name}
                          className="w-8 h-8 rounded mb-1"
                        />
                        <div className="text-xs text-center font-medium">{unit.name}</div>
                        {boardUnit.items.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {boardUnit.items.slice(0, 3).map((itemId, itemIndex) => {
                              const item = items.find(i => i.id === itemId)
                              return (
                                <img
                                  key={itemIndex}
                                  src={item?.image}
                                  alt={item?.name}
                                  className="w-3 h-3 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItemFromUnit(index, itemIndex)
                                  }}
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
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Click on a unit from the left panel, then click an empty board position to place it</li>
                <li>Click on a unit on the board to select it, then click items to equip them</li>
                <li>Double-click a unit on the board to remove it</li>
                <li>Click on equipped items to remove them</li>
              </ul>
            </div>
            
            {selectedPosition !== null && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Position {selectedPosition + 1} selected. Click items from the left panel to equip them.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}