import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Failed to change password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}