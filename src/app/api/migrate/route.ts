import { NextRequest, NextResponse } from 'next/server'
import { dbStorageUtils } from '@/lib/dbStorage'

export async function POST(request: NextRequest) {
  try {
    // Get localStorage data from request body
    const { traits, units, components, items } = await request.json()

    const results = {
      traits: { success: 0, failed: 0 },
      units: { success: 0, failed: 0 },
      components: { success: 0, failed: 0 },
      items: { success: 0, failed: 0 }
    }

    // Migrate traits
    if (traits && Array.isArray(traits)) {
      for (const trait of traits) {
        const saved = await dbStorageUtils.saveTrait(trait)
        if (saved) {
          results.traits.success++
        } else {
          results.traits.failed++
        }
      }
    }

    // Migrate units
    if (units && Array.isArray(units)) {
      for (const unit of units) {
        const saved = await dbStorageUtils.saveUnit(unit)
        if (saved) {
          results.units.success++
        } else {
          results.units.failed++
        }
      }
    }

    // Migrate components
    if (components && Array.isArray(components)) {
      for (const component of components) {
        const saved = await dbStorageUtils.saveComponent(component)
        if (saved) {
          results.components.success++
        } else {
          results.components.failed++
        }
      }
    }

    // Migrate items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const saved = await dbStorageUtils.saveItem(item)
        if (saved) {
          results.items.success++
        } else {
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