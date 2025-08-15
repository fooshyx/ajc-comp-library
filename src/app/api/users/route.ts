import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users)
    
    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, password, isAdmin = false } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 })
    }

    const existingUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    const existingEmail = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await db.insert(users).values({
      id: generateId(),
      username,
      email,
      passwordHash,
      isAdmin: Boolean(isAdmin)
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })

    return NextResponse.json(newUser[0])
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, username, email, password, isAdmin } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    const isCurrentUserAdmin = currentUser[0]?.isAdmin
    const isUpdatingSelf = session.user.id === id

    if (!isCurrentUserAdmin && !isUpdatingSelf) {
      return NextResponse.json({ error: 'Unauthorized to update this user' }, { status: 403 })
    }

    const updateData: any = {}
    
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12)
    if (isCurrentUserAdmin && typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin
    
    updateData.updatedAt = new Date()

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        updatedAt: users.updatedAt
      })

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await db.delete(users).where(eq(users.id, id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}