import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { units } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allUnits = await db.select().from(units)
    return NextResponse.json(allUnits)
  } catch (error) {
    console.error('Failed to fetch units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, cost, image, traits: unitTraits } = body

    const newUnit = await db.insert(units).values({
      id,
      name,
      cost,
      image,
      traits: unitTraits
    }).returning()

    return NextResponse.json(newUnit[0])
  } catch (error) {
    console.error('Failed to create unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, cost, image, traits: unitTraits } = body

    const updatedUnit = await db.update(units)
      .set({ name, cost, image, traits: unitTraits, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning()

    return NextResponse.json(updatedUnit[0])
  } catch (error) {
    console.error('Failed to update unit:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 })
    }

    await db.delete(units).where(eq(units.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete unit:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}