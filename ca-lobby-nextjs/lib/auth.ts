import { User } from '@clerk/nextjs/server'
import { auth, clerkClient } from '@clerk/nextjs'

// Define user roles
export type UserRole = 'admin' | 'analyst' | 'viewer' | 'data_manager'

// Define permissions for each role
export interface Permission {
  name: string
  description: string
}

export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: { name: 'view_dashboard', description: 'View dashboard' },

  // Data permissions
  VIEW_DATA: { name: 'view_data', description: 'View lobbying data' },
  UPLOAD_DATA: { name: 'upload_data', description: 'Upload data files' },
  DOWNLOAD_DATA: { name: 'download_data', description: 'Download data files' },
  DELETE_DATA: { name: 'delete_data', description: 'Delete data records' },
  TRANSFORM_DATA: { name: 'transform_data', description: 'Transform and process data' },
  ANALYZE_DATA: { name: 'analyze_data', description: 'Perform data analysis' },

  // Report permissions
  VIEW_REPORTS: { name: 'view_reports', description: 'View reports' },
  CREATE_REPORTS: { name: 'create_reports', description: 'Create new reports' },
  EDIT_REPORTS: { name: 'edit_reports', description: 'Edit existing reports' },
  DELETE_REPORTS: { name: 'delete_reports', description: 'Delete reports' },

  // User management permissions
  VIEW_USERS: { name: 'view_users', description: 'View user list' },
  MANAGE_USERS: { name: 'manage_users', description: 'Manage user accounts' },
  ASSIGN_ROLES: { name: 'assign_roles', description: 'Assign roles to users' },

  // System permissions
  VIEW_SYSTEM_SETTINGS: { name: 'view_system_settings', description: 'View system settings' },
  MANAGE_SYSTEM_SETTINGS: { name: 'manage_system_settings', description: 'Manage system settings' },
  VIEW_AUDIT_LOGS: { name: 'view_audit_logs', description: 'View audit logs' },
} as const

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.UPLOAD_DATA,
    PERMISSIONS.DOWNLOAD_DATA,
    PERMISSIONS.DELETE_DATA,
    PERMISSIONS.TRANSFORM_DATA,
    PERMISSIONS.ANALYZE_DATA,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.EDIT_REPORTS,
    PERMISSIONS.DELETE_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  analyst: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.DOWNLOAD_DATA,
    PERMISSIONS.ANALYZE_DATA,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.EDIT_REPORTS,
  ],
  data_manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.UPLOAD_DATA,
    PERMISSIONS.DOWNLOAD_DATA,
    PERMISSIONS.TRANSFORM_DATA,
    PERMISSIONS.ANALYZE_DATA,
    PERMISSIONS.VIEW_REPORTS,
  ],
  viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.VIEW_REPORTS,
  ],
}

// User metadata interface
export interface UserMetadata {
  role: UserRole
  department?: string
  permissions?: string[]
  lastActive?: string
  createdBy?: string
}

/**
 * Get the current user's role from Clerk user metadata
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'viewer'

  const metadata = user.publicMetadata as Partial<UserMetadata>
  return metadata?.role || 'viewer'
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer
}

/**
 * Get the current user's permissions
 */
export function getUserPermissions(user: User | null): Permission[] {
  const role = getUserRole(user)
  const rolePermissions = getRolePermissions(role)

  // Get custom permissions from user metadata
  const metadata = user?.publicMetadata as Partial<UserMetadata>
  const customPermissions = metadata?.permissions || []

  // Combine role permissions with custom permissions
  const allPermissions = [...rolePermissions]

  // Add custom permissions that aren't already included
  customPermissions.forEach(permName => {
    const permission = Object.values(PERMISSIONS).find(p => p.name === permName)
    if (permission && !allPermissions.some(p => p.name === permission.name)) {
      allPermissions.push(permission)
    }
  })

  return allPermissions
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  const userPermissions = getUserPermissions(user)
  return userPermissions.some(p => p.name === permission.name)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Get current authenticated user with server-side auth
 */
export async function getCurrentUser() {
  const { userId } = auth()
  if (!userId) return null

  try {
    const user = await clerkClient.users.getUser(userId)
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

/**
 * Check if current user has permission (server-side)
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  return hasPermission(user, permission)
}

/**
 * Update user role and metadata
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  updatedBy?: string
): Promise<void> {
  try {
    const currentMetadata = await clerkClient.users.getUser(userId)
      .then(user => user.publicMetadata as Partial<UserMetadata>)
      .catch(() => ({}))

    const newMetadata: Partial<UserMetadata> = {
      ...currentMetadata,
      role,
      lastActive: new Date().toISOString(),
      ...(updatedBy && { createdBy: updatedBy }),
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: newMetadata as Record<string, any>,
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }
}

/**
 * Get all users with their roles (admin only)
 */
export async function getAllUsers(limit = 20, offset = 0) {
  try {
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
    })

    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses,
      imageUrl: user.imageUrl,
      lastActiveAt: user.lastSignInAt,
      createdAt: user.createdAt,
      role: getUserRole(user),
      metadata: user.publicMetadata as Partial<UserMetadata>,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

/**
 * Validate role assignment permissions
 */
export function canAssignRole(
  currentUser: User | null,
  currentUserRole?: UserRole
): boolean {
  const userRole = currentUserRole || getUserRole(currentUser)

  // Only admins can assign roles
  if (userRole !== 'admin') return false

  // Admins can assign any role
  return true
}

/**
 * Get route permissions for navigation filtering
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': [PERMISSIONS.VIEW_DASHBOARD],
  '/lobbying-data': [PERMISSIONS.VIEW_DATA],
  '/lobbying-data/payments': [PERMISSIONS.VIEW_DATA],
  '/lobbying-data/associations': [PERMISSIONS.VIEW_DATA],
  '/lobbying-data/trends': [PERMISSIONS.VIEW_DATA],
  '/reports': [PERMISSIONS.VIEW_REPORTS],
  '/reports/create': [PERMISSIONS.CREATE_REPORTS],
  '/data/upload': [PERMISSIONS.UPLOAD_DATA],
  '/data/transform': [PERMISSIONS.TRANSFORM_DATA],
  '/data/analyze': [PERMISSIONS.ANALYZE_DATA],
  '/admin/users': [PERMISSIONS.MANAGE_USERS],
  '/admin/settings': [PERMISSIONS.MANAGE_SYSTEM_SETTINGS],
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[route]
  if (!requiredPermissions || requiredPermissions.length === 0) return true

  return hasAnyPermission(user, requiredPermissions)
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions<T extends { href: string; children?: T[] }>(
  items: T[],
  user: User | null
): T[] {
  return items.filter(item => {
    // Check if user can access this route
    const canAccess = canAccessRoute(user, item.href)

    if (item.children) {
      // Filter children recursively
      const filteredChildren = filterNavigationByPermissions(item.children, user)
      // Include parent if it has accessible children or if parent itself is accessible
      return canAccess || filteredChildren.length > 0
    }

    return canAccess
  }).map(item => ({
    ...item,
    ...(item.children && {
      children: filterNavigationByPermissions(item.children, user)
    })
  }))
}