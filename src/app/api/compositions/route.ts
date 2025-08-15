import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { compositions } from '@/db/schema'
import { eq } from 'drizzle-orm'

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// GET - Fetch all compositions (with optional user filtering)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const publicOnly = url.searchParams.get('public') === 'true'

    let result

    if (publicOnly) {
      result = await db.select().from(compositions).where(eq(compositions.isPublic, true))
    } else if (userId) {
      result = await db.select().from(compositions).where(eq(compositions.userId, userId))
    } else {
      result = await db.select().from(compositions)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching compositions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compositions' },
      { status: 500 }
    )
  }
}

// POST - Create new composition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description, units, isPublic } = body

    if (!name || !units || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, units, userId' },
        { status: 400 }
      )
    }

    const newComposition = {
      id: generateId(),
      userId,
      name,
      description: description || null,
      units,
      isPublic: isPublic || false
    }

    const result = await db.insert(compositions).values(newComposition).returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating composition:', error)
    return NextResponse.json(
      { error: 'Failed to create composition' },
      { status: 500 }
    )
  }
}

// PUT - Update composition
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, units, isPublic } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing composition ID' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (units !== undefined) updateData.units = units
    if (isPublic !== undefined) updateData.isPublic = isPublic
    updateData.updatedAt = new Date()

    const result = await db
      .update(compositions)
      .set(updateData)
      .where(eq(compositions.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Composition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating composition:', error)
    return NextResponse.json(
      { error: 'Failed to update composition' },
      { status: 500 }
    )
  }
}

// DELETE - Delete composition
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing composition ID' },
        { status: 400 }
      )
    }

    const result = await db
      .delete(compositions)
      .where(eq(compositions.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Composition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Composition deleted successfully' })
  } catch (error) {
    console.error('Error deleting composition:', error)
    return NextResponse.json(
      { error: 'Failed to delete composition' },
      { status: 500 }
    )
  }
}