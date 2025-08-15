import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: NextRequest) {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "components" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "image" text NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "items" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "image" text NOT NULL,
        "recipe" jsonb,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "traits" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "image" text NOT NULL,
        "breakpoints" jsonb NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "units" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "cost" integer NOT NULL,
        "image" text NOT NULL,
        "traits" jsonb NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "username" text NOT NULL,
        "email" text NOT NULL,
        "password_hash" text NOT NULL,
        "is_admin" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_username_unique" UNIQUE("username"),
        CONSTRAINT "users_email_unique" UNIQUE("email")
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "compositions" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "name" text NOT NULL,
        "description" text,
        "units" jsonb NOT NULL,
        "is_public" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({ 
      message: 'Database tables created successfully',
      tables: ['components', 'items', 'traits', 'units', 'users', 'compositions']
    })
  } catch (error) {
    console.error('Failed to create database tables:', error)
    return NextResponse.json({ 
      error: 'Failed to create database tables', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}