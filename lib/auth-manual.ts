import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { users, roles } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Simple password hashing using Web Crypto API (Vercel-compatible)
async function hashPasswordSimple(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function comparePasswordSimple(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPasswordSimple(password);
  return hash === hashedPassword;
}

// Types
export interface User {
  id: string
  email: string
  name: string
  role: string
  roleLevel: number
  phone?: string
  isActive: boolean
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
  roleLevel: number
  phone?: string
  iat?: number
  exp?: number
}

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Generate JWT token for user
 */
export async function generateToken(user: User): Promise<string> {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLevel: user.roleLevel,
    phone: user.phone
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Handle demo/fallback token
    if (token === 'authenticated' || token === 'demo-auth-token') {
      console.log('⚠️ Using demo token');
      return null; // Reject demo tokens - require proper auth
    }
    
    // First, try to decode as base64 JSON (from staff initiate route)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(decoded);
      
      // Check if it's our staff auth token format
      if (payload.userId && payload.staffId) {
        return {
          userId: payload.userId,
          email: payload.email || '',
          name: payload.displayName || '',
          role: 'staff',
          roleLevel: 1,
          phone: undefined,
          iat: Math.floor(payload.timestamp / 1000) || Math.floor(Date.now() / 1000),
          exp: (Math.floor(payload.timestamp / 1000) || Math.floor(Date.now() / 1000)) + (30 * 24 * 60 * 60) // 30 days
        }
      }
    } catch (base64Error) {
      // Not base64 JSON, try JWT
    }
    
    // Try JWT verification
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      roleLevel: payload.roleLevel as number,
      phone: payload.phone as string | undefined,
      iat: payload.iat as number,
      exp: payload.exp as number
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from request headers
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  console.log('🔍 extractTokenFromRequest: Checking headers...');
  
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  console.log('🔍 Authorization header:', authHeader ? 'Found' : 'Not found');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    console.log('🔍 Token from Authorization header:', token.substring(0, 20) + '...');
    return token
  }

  // Try cookie
  const tokenCookie = request.cookies.get('auth-token')
  console.log('🔍 Cookie:', tokenCookie ? 'Found' : 'Not found');
  if (tokenCookie) {
    console.log('🔍 Token from cookie:', tokenCookie.value.substring(0, 20) + '...');
    return tokenCookie.value
  }

  console.log('❌ No token found in request');
  return null
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('🔐 Authenticating user:', email)
    
    // Find user by email
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      password: users.password,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
      phone: users.phone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

    if (userResult.length === 0) {
      console.log('❌ User not found:', email)
      return null
    }

    const userData = userResult[0]
    console.log('👤 User found:', userData.email)

    // Check if user is active
    if (!userData.isActive) {
      console.log('❌ User not active:', email)
      return null
    }

    // Verify password
    const isValidPassword = await comparePasswordSimple(password, userData.password)
    console.log('🔐 Password verification:', isValidPassword ? 'SUCCESS' : 'FAILED')
    if (!isValidPassword) {
      return null
    }

    // Get user role
    const roleResult = await db.select({
      name: roles.name,
      level: roles.level
    })
    .from(roles)
    .where(eq(roles.id, userData.roleId))
    .limit(1)

    if (roleResult.length === 0) {
      console.log('❌ Role not found for user:', email)
      return null
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.fullName,
      role: roleResult[0].name,
      roleLevel: roleResult[0].level,
      phone: userData.phone || undefined,
      isActive: userData.isActive
    }
    
    console.log('✅ User authenticated successfully:', user.email)
    return user
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return null
  }
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      console.log('❌ No token found in request')
      return null
    }

    const payload = await verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid token')
      return null
    }

    // Verify user still exists and is active
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      roleId: users.roleId,
      isActive: users.isActive,
      phone: users.phone
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1)

    if (userResult.length === 0) {
      console.log('❌ User not found in database:', payload.userId)
      return null
    }

    const userData = userResult[0]
    if (!userData.isActive) {
      console.log('❌ User is not active:', payload.userId)
      return null
    }

    // Get user role
    const roleResult = await db.select({
      name: roles.name,
      level: roles.level
    })
    .from(roles)
    .where(eq(roles.id, userData.roleId))
    .limit(1)

    if (roleResult.length === 0) {
      console.log('❌ Role not found for user:', payload.userId)
      return null
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.fullName,
      role: roleResult[0].name,
      roleLevel: roleResult[0].level,
      phone: userData.phone || undefined,
      isActive: userData.isActive
    }

    console.log('✅ User verified from token:', user.email)
    return user
  } catch (error) {
    console.error('❌ Error getting authenticated user:', error)
    return null
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordSimple(password)
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return comparePasswordSimple(password, hashedPassword)
}

/**
 * Create user in database
 */
export async function createUser(userData: {
  email: string
  password: string
  fullName: string
  phone?: string
  roleId: string
}): Promise<User | null> {
  try {
    console.log('👤 Creating user:', userData.email)
    
    const hashedPassword = await hashPassword(userData.password)
    
    const result = await db.insert(users).values({
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      phone: userData.phone,
      roleId: userData.roleId,
      isActive: true
    }).returning()

    if (result.length === 0) {
      console.log('❌ Failed to create user')
      return null
    }

    const newUser = result[0]
    
    // Get user role
    const roleResult = await db.select({
      name: roles.name,
      level: roles.level
    })
    .from(roles)
    .where(eq(roles.id, newUser.roleId))
    .limit(1)

    if (roleResult.length === 0) {
      console.log('❌ Role not found for new user')
      return null
    }

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.fullName,
      role: roleResult[0].name,
      roleLevel: roleResult[0].level,
      phone: newUser.phone || undefined,
      isActive: newUser.isActive
    }

    console.log('✅ User created successfully:', user.email)
    return user
  } catch (error) {
    console.error('❌ Error creating user:', error)
    return null
  }
}
