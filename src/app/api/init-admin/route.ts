import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 })
    }

    // Check if any admin users already exist
    const existingAdmins = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1)
    
    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: 'Admin user already exists' }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newAdmin = await db.insert(users).values({
      id: generateId(),
      username,
      email,
      passwordHash,
      isAdmin: true
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      user: newAdmin[0]
    })
  } catch (error) {
    console.error('Failed to create admin user:', error)
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}