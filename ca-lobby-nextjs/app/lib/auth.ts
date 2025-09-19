import { auth } from '@clerk/nextjs'

export interface UserRole {
  id: string
  name: string
  permissions: string[]
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  createdAt: Date
  lastSignIn?: Date
}

// Define user roles and permissions
export const USER_ROLES: { [key: string]: UserRole } = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    permissions: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:users',
      'manage:system',
      'bigquery:read',
      'bigquery:write',
      'bigquery:delete',
    ],
  },
  ANALYST: {
    id: 'analyst',
    name: 'Data Analyst',
    permissions: [
      'read:data',
      'read:reports',
      'write:reports',
      'bigquery:read',
      'bigquery:write',
    ],
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      'read:data',
      'read:reports',
      'bigquery:read',
    ],
  },
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { userId, sessionClaims } = auth()

    if (!userId) {
      return null
    }

    // In a real implementation, you would fetch user details from your database
    // For now, we'll use session claims and default values
    const userRole = getUserRole(sessionClaims?.role as string || 'viewer')

    return {
      id: userId,
      email: sessionClaims?.email as string || '',
      firstName: sessionClaims?.firstName as string,
      lastName: sessionClaims?.lastName as string,
      role: userRole,
      createdAt: new Date(sessionClaims?.createdAt as number || Date.now()),
      lastSignIn: new Date(),
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get user role by role ID
 */
export function getUserRole(roleId: string): UserRole {
  const role = USER_ROLES[roleId.toUpperCase()]
  return role || USER_ROLES.VIEWER
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false
  return user.role.permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false
  return permissions.some(permission => user.role.permissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user) return false
  return permissions.every(permission => user.role.permissions.includes(permission))
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role.id === 'admin'
}

/**
 * Check if user can access BigQuery operations
 */
export function canAccessBigQuery(user: User | null): boolean {
  return hasAnyPermission(user, ['bigquery:read', 'bigquery:write'])
}

/**
 * Check if user can write to BigQuery
 */
export function canWriteBigQuery(user: User | null): boolean {
  return hasPermission(user, 'bigquery:write')
}

/**
 * Check if user can delete from BigQuery
 */
export function canDeleteBigQuery(user: User | null): boolean {
  return hasPermission(user, 'bigquery:delete')
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Anonymous'

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }

  if (user.firstName) {
    return user.firstName
  }

  return user.email || 'User'
}

/**
 * Format user for display
 */
export function formatUser(user: User): {
  id: string
  name: string
  email: string
  role: string
  lastSignIn: string
} {
  return {
    id: user.id,
    name: getUserDisplayName(user),
    email: user.email,
    role: user.role.name,
    lastSignIn: user.lastSignIn?.toLocaleDateString() || 'Never',
  }
}

// Middleware helper functions
export function requireAuth() {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

export async function requirePermission(permission: string) {
  const user = await getCurrentUser()
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission required: ${permission}`)
  }
  return user
}

export async function requireBigQueryAccess() {
  const user = await getCurrentUser()
  if (!canAccessBigQuery(user)) {
    throw new Error('BigQuery access required')
  }
  return user
}