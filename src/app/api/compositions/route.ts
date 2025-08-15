import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    console.log('POST /api/compositions called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, addedBy, name, description, units, rating, isPublic } = body

    console.log('Extracted fields:', { userId, addedBy, name, description, units, rating, isPublic })

    if (!name || !units || !userId || !addedBy) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: name, units, userId, addedBy' },
        { status: 400 }
      )
    }

    const newComposition = {
      id: generateId(),
      userId: userId,
      addedBy: addedBy,
      name,
      description: description || null,
      units,
      rating: rating || null,
      isPublic: isPublic || false
    }

    console.log('New composition to insert:', newComposition)

    const result = await db.insert(compositions).values(newComposition).returning()
    
    console.log('Database insert result:', result)

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating composition:', error)
    return NextResponse.json(
      { error: 'Failed to create composition', details: error instanceof Error ? error.message : 'Unknown error' },
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

// DELETE - Delete composition (with ownership check)
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing composition ID' },
        { status: 400 }
      )
    }

    // First, get the composition to check ownership
    const composition = await db
      .select()
      .from(compositions)
      .where(eq(compositions.id, id))
      .limit(1)

    if (composition.length === 0) {
      return NextResponse.json(
        { error: 'Composition not found' },
        { status: 404 }
      )
    }

    // Check if user owns the composition or is admin
    const isOwner = composition[0].userId === session.user.id
    const isAdmin = session.user.isAdmin

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own compositions' },
        { status: 403 }
      )
    }

    // Delete the composition
    const result = await db
      .delete(compositions)
      .where(eq(compositions.id, id))
      .returning()

    return NextResponse.json({ message: 'Composition deleted successfully' })
  } catch (error) {
    console.error('Error deleting composition:', error)
    return NextResponse.json(
      { error: 'Failed to delete composition' },
      { status: 500 }
    )
  }
}