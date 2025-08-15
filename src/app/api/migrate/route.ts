import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { traits, units, components, items } from '@/db/schema'

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function POST(request: NextRequest) {
  try {
    // Get localStorage data from request body
    const { traits: traitsData, units: unitsData, components: componentsData, items: itemsData } = await request.json()

    const results = {
      traits: { success: 0, failed: 0 },
      units: { success: 0, failed: 0 },
      components: { success: 0, failed: 0 },
      items: { success: 0, failed: 0 }
    }

    // Migrate traits
    if (traitsData && Array.isArray(traitsData)) {
      for (const trait of traitsData) {
        try {
          await db.insert(traits).values({
            id: trait.id || generateId(),
            name: trait.name,
            image: trait.image,
            breakpoints: trait.breakpoints
          })
          results.traits.success++
        } catch (error) {
          console.error('Error migrating trait:', trait.name, error)
          results.traits.failed++
        }
      }
    }

    // Migrate units
    if (unitsData && Array.isArray(unitsData)) {
      for (const unit of unitsData) {
        try {
          await db.insert(units).values({
            id: unit.id || generateId(),
            name: unit.name,
            cost: unit.cost,
            image: unit.image,
            traits: unit.traits
          })
          results.units.success++
        } catch (error) {
          console.error('Error migrating unit:', unit.name, error)
          results.units.failed++
        }
      }
    }

    // Migrate components
    if (componentsData && Array.isArray(componentsData)) {
      for (const component of componentsData) {
        try {
          await db.insert(components).values({
            id: component.id || generateId(),
            name: component.name,
            image: component.image
          })
          results.components.success++
        } catch (error) {
          console.error('Error migrating component:', component.name, error)
          results.components.failed++
        }
      }
    }

    // Migrate items
    if (itemsData && Array.isArray(itemsData)) {
      for (const item of itemsData) {
        try {
          await db.insert(items).values({
            id: item.id || generateId(),
            name: item.name,
            type: item.type,
            image: item.image,
            recipe: item.recipe
          })
          results.items.success++
        } catch (error) {
          console.error('Error migrating item:', item.name, error)
          results.items.failed++
        }
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      results
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}