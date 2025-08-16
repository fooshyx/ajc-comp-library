"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { hybridStorage } from "@/lib/hybridStorage"
import { Composition } from "@/db/schema"
import { Unit, Trait, Item } from "@/types/tft"
import CompositionBuilderModal from "./CompositionBuilderModal"

interface CompositionWithDetails extends Composition {
  expandedDetails?: {
    units: Unit[]
    traits: { name: string, count: number, color?: string }[]
    items: Item[]
  }
}

interface CompositionsListProps {
  showPublicOnly?: boolean
  allowEdit?: boolean
}

export default function CompositionsList({ showPublicOnly = true, allowEdit = false }: CompositionsListProps) {
  const { data: session } = useSession()
  
  const [compositions, setCompositions] = useState<CompositionWithDetails[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [traits, setTraits] = useState<Trait[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedComposition, setExpandedComposition] = useState<string | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingComposition, setEditingComposition] = useState<Composition | null>(null)

  useEffect(() => {
    loadCompositions()
    loadGameData()
  }, [session])

  const loadGameData = async () => {
    try {
      const gameData = await hybridStorage.getAllGameData()
      setUnits(gameData.units)
      setTraits(gameData.traits)
      setItems(gameData.items)
    } catch (error) {
      console.error('Error loading game data:', error)
    }
  }

  const loadCompositions = async () => {
    try {
      setLoading(true)
      let comps: Composition[]
      
      if (showPublicOnly) {
        comps = await hybridStorage.getCompositions(undefined, true)
      } else if (session?.user?.id) {
        comps = await hybridStorage.getCompositions(session.user.id)
      } else {
        comps = []
      }
      
      setCompositions(comps.map(comp => ({ ...comp, expandedDetails: undefined })))
    } catch (error) {
      console.error('Error loading compositions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'S': return 'from-yellow-400 to-yellow-600'
      case 'A': return 'from-green-400 to-green-600'
      case 'B': return 'from-blue-400 to-blue-600'
      case 'C': return 'from-gray-400 to-gray-600'
      default: return 'from-gray-200 to-gray-300'
    }
  }

  const getRatingBorderColor = (rating: string | null) => {
    switch (rating) {
      case 'S': return 'border-yellow-500'
      case 'A': return 'border-green-500'
      case 'B': return 'border-blue-500'
      case 'C': return 'border-gray-500'
      default: return 'border-gray-300'
    }
  }

  const calculateCompositionDetails = (composition: Composition) => {
    const compositionUnits = composition.units.map(boardUnit => {
      const unit = units.find(u => u.id === boardUnit.unitId)
      return unit
    }).filter(Boolean) as Unit[]

    // Sort units by cost ascending
    compositionUnits.sort((a, b) => a.cost - b.cost)

    // Calculate traits with counts
    const traitCounts = new Map<string, number>()
    compositionUnits.forEach(unit => {
      unit.traits.forEach(traitName => {
        traitCounts.set(traitName, (traitCounts.get(traitName) || 0) + 1)
      })
    })

    const activeTraits = Array.from(traitCounts.entries()).map(([traitName, count]) => {
      const trait = traits.find(t => t.name === traitName)
      const activeBreakpoint = trait?.breakpoints
        .filter(bp => count >= bp.num)
        .sort((a, b) => b.num - a.num)[0]
      
      return {
        name: traitName,
        count,
        color: activeBreakpoint?.color
      }
    }).filter(trait => trait.count > 0)

    // Get unique items from all units
    const itemIds = new Set<string>()
    composition.units.forEach(boardUnit => {
      boardUnit.items.forEach(itemId => itemIds.add(itemId))
    })
    const compositionItems = Array.from(itemIds).map(id => items.find(item => item.id === id)).filter(Boolean) as Item[]

    return {
      units: compositionUnits,
      traits: activeTraits,
      items: compositionItems
    }
  }

  const handleCompositionClick = (composition: Composition) => {
    if (expandedComposition === composition.id) {
      setExpandedComposition(null)
    } else {
      const details = calculateCompositionDetails(composition)
      const updatedComposition = { ...composition, expandedDetails: details }
      setCompositions(prev => prev.map(comp => 
        comp.id === composition.id ? updatedComposition : comp
      ))
      setExpandedComposition(composition.id)
    }
  }

  const handleEdit = (composition: Composition) => {
    setEditingComposition(composition)
    setBuilderOpen(true)
  }

  const handleNewComposition = () => {
    setEditingComposition(null)
    setBuilderOpen(true)
  }

  const handleBuilderClose = () => {
    setBuilderOpen(false)
    setEditingComposition(null)
  }

  const handleBuilderSave = () => {
    // Refresh compositions after save
    loadCompositions()
  }

  const handleDelete = async (composition: Composition) => {
    if (!session?.user?.id) return
    
    const isOwner = composition.userId === session.user.id
    const isAdmin = session.user.isAdmin

    if (!isOwner && !isAdmin) {
      alert('You can only delete your own compositions')
      return
    }

    if (confirm(`Are you sure you want to delete "${composition.name}"?`)) {
      try {
        const success = await hybridStorage.deleteComposition(composition.id)
        if (success) {
          await loadCompositions()
        } else {
          alert('Failed to delete composition')
        }
      } catch (error) {
        console.error('Error deleting composition:', error)
        alert('Failed to delete composition')
      }
    }
  }

  // Group compositions by rating
  const groupedCompositions = compositions.reduce((groups, comp) => {
    const rating = comp.rating || 'Unrated'
    if (!groups[rating]) {
      groups[rating] = []
    }
    groups[rating].push(comp)
    return groups
  }, {} as Record<string, CompositionWithDetails[]>)

  // Sort ratings: S, A, B, C, Unrated
  const ratingOrder = ['S', 'A', 'B', 'C', 'Unrated']
  const sortedRatings = ratingOrder.filter(rating => groupedCompositions[rating]?.length > 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading compositions...</div>
      </div>
    )
  }

  if (compositions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No compositions found.</p>
        {!showPublicOnly && (
          <p className="text-sm text-gray-500 mt-2">Create your first composition using the builder!</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {sortedRatings.map(rating => (
          <div key={rating} className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              {rating === 'Unrated' ? 'Unrated Compositions' : `${rating} Tier Compositions`}
            </h3>
            <div className="space-y-2">
              {groupedCompositions[rating].map(composition => (
                <div key={composition.id}>
                  {/* Main composition row */}
                  <div
                    className={`
                      ${session?.user?.id && (composition.userId === session.user.id || session.user.isAdmin) 
                        ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
                        : 'cursor-default'
                      } transition-all duration-200 rounded-lg border-2 p-4
                      bg-gradient-to-r ${getRatingColor(composition.rating)} ${getRatingBorderColor(composition.rating)}
                    `}
                    onClick={() => {
                      if (session?.user?.id && (composition.userId === session.user.id || session.user.isAdmin)) {
                        handleEdit(composition)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Left: Name (Fixed width) */}
                      <div className="flex-shrink-0 w-48">
                        <h4 className="font-medium text-white text-lg drop-shadow-sm truncate">
                          {composition.name}
                        </h4>
                        {composition.description && (
                          <p className="text-sm text-white/80 drop-shadow-sm truncate">
                            {composition.description}
                          </p>
                        )}
                      </div>

                      {/* Middle: Traits */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {calculateCompositionDetails(composition).traits.slice(0, 6).map((trait, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-black/20 rounded px-2 py-1"
                            >
                              <span className="text-white text-xs font-medium drop-shadow-sm">
                                {trait.name}
                              </span>
                              <span className="ml-1 text-white/80 text-xs drop-shadow-sm">
                                ({trait.count})
                              </span>
                            </div>
                          ))}
                          {calculateCompositionDetails(composition).traits.length > 6 && (
                            <div className="text-white/80 text-xs drop-shadow-sm">
                              +{calculateCompositionDetails(composition).traits.length - 6} more
                            </div>
                          )}
                        </div>

                        {/* Units by cost */}
                        <div className="flex flex-wrap gap-1">
                          {calculateCompositionDetails(composition).units.slice(0, 8).map((unit, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-white/20 rounded px-2 py-1"
                            >
                              <img
                                src={unit.image}
                                alt={unit.name}
                                className="w-4 h-4 rounded mr-1"
                              />
                              <span className="text-white text-xs font-medium drop-shadow-sm">
                                {unit.name}
                              </span>
                              <span className="ml-1 text-white/70 text-xs drop-shadow-sm">
                                ({unit.cost})
                              </span>
                            </div>
                          ))}
                          {calculateCompositionDetails(composition).units.length > 8 && (
                            <div className="text-white/80 text-xs drop-shadow-sm">
                              +{calculateCompositionDetails(composition).units.length - 8} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Added by */}
                      <div className="flex-shrink-0 w-32 text-right">
                        <p className="text-sm text-white/80 drop-shadow-sm">
                          Added by
                        </p>
                        <p className="font-medium text-white drop-shadow-sm truncate">
                          {composition.addedBy}
                        </p>
                      </div>

                      {/* Rating Badge */}
                      {composition.rating && (
                        <div className="flex-shrink-0">
                          <div className="text-white font-bold text-sm drop-shadow-sm bg-black/30 px-3 py-1 rounded-full">
                            {composition.rating}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {allowEdit && session?.user?.id && (composition.userId === session.user.id || session.user.isAdmin) && (
                        <div className="flex-shrink-0 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(composition)
                            }}
                            className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Builder Modal */}
      <CompositionBuilderModal
        isOpen={builderOpen}
        onClose={handleBuilderClose}
        editComposition={editingComposition}
        onSave={handleBuilderSave}
      />
    </>
  )
}