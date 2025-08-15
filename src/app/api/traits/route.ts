import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { traits } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allTraits = await db.select().from(traits)
    return NextResponse.json(allTraits)
  } catch (error) {
    console.error('Failed to fetch traits:', error)
    return NextResponse.json({ error: 'Failed to fetch traits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, image, breakpoints } = body

    const newTrait = await db.insert(traits).values({
      id,
      name,
      image,
      breakpoints
    }).returning()

    return NextResponse.json(newTrait[0])
  } catch (error) {
    console.error('Failed to create trait:', error)
    return NextResponse.json({ error: 'Failed to create trait' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, image, breakpoints } = body

    const updatedTrait = await db.update(traits)
      .set({ name, image, breakpoints, updatedAt: new Date() })
      .where(eq(traits.id, id))
      .returning()

    return NextResponse.json(updatedTrait[0])
  } catch (error) {
    console.error('Failed to update trait:', error)
    return NextResponse.json({ error: 'Failed to update trait' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trait ID is required' }, { status: 400 })
    }

    await db.delete(traits).where(eq(traits.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete trait:', error)
    return NextResponse.json({ error: 'Failed to delete trait' }, { status: 500 })
  }
}