import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { items } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allItems = await db.select().from(items)
    return NextResponse.json(allItems)
  } catch (error) {
    console.error('Failed to fetch items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, type, image, recipe } = body

    const newItem = await db.insert(items).values({
      id,
      name,
      type,
      image,
      recipe
    }).returning()

    return NextResponse.json(newItem[0])
  } catch (error) {
    console.error('Failed to create item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, type, image, recipe } = body

    const updatedItem = await db.update(items)
      .set({ name, type, image, recipe, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning()

    return NextResponse.json(updatedItem[0])
  } catch (error) {
    console.error('Failed to update item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    await db.delete(items).where(eq(items.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}