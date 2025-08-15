import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { components } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allComponents = await db.select().from(components)
    return NextResponse.json(allComponents)
  } catch (error) {
    console.error('Failed to fetch components:', error)
    return NextResponse.json({ error: 'Failed to fetch components' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, image } = body

    const newComponent = await db.insert(components).values({
      id,
      name,
      image
    }).returning()

    return NextResponse.json(newComponent[0])
  } catch (error) {
    console.error('Failed to create component:', error)
    return NextResponse.json({ error: 'Failed to create component' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, image } = body

    const updatedComponent = await db.update(components)
      .set({ name, image, updatedAt: new Date() })
      .where(eq(components.id, id))
      .returning()

    return NextResponse.json(updatedComponent[0])
  } catch (error) {
    console.error('Failed to update component:', error)
    return NextResponse.json({ error: 'Failed to update component' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Component ID is required' }, { status: 400 })
    }

    await db.delete(components).where(eq(components.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete component:', error)
    return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 })
  }
}