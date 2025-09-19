import { NextRequest } from 'next/server'
import { withAdminOnly, createApiResponse, withMethodValidation, withAuditLog, combineMiddleware } from '../../../../lib/api-auth'
import { getAllUsers, updateUserRole, UserRole } from '../../../../lib/auth'

/**
 * GET /api/admin/users - Get all users (admin only)
 */
async function handleGetUsers(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const users = await getAllUsers(limit, offset)

    return createApiResponse(true, {
      users,
      pagination: {
        limit,
        offset,
        total: users.length,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return createApiResponse(
      false,
      null,
      'Failed to fetch users',
      'An error occurred while retrieving user data',
      500
    )
  }
}

/**
 * PUT /api/admin/users - Update user role (admin only)
 */
async function handleUpdateUserRole(req: NextRequest, context: any) {
  try {
    const body = await req.json()
    const { userId, role } = body

    if (!userId || !role) {
      return createApiResponse(
        false,
        null,
        'Missing required fields',
        'userId and role are required',
        400
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'analyst', 'viewer', 'data_manager']
    if (!validRoles.includes(role)) {
      return createApiResponse(
        false,
        null,
        'Invalid role',
        `Role must be one of: ${validRoles.join(', ')}`,
        400
      )
    }

    await updateUserRole(userId, role, context.userId)

    return createApiResponse(
      true,
      { message: `User role updated to ${role} successfully` },
      undefined,
      `User role updated to ${role} successfully`
    )
  } catch (error) {
    console.error('Error updating user role:', error)
    return createApiResponse(
      false,
      null,
      'Failed to update user role',
      'An error occurred while updating the user role',
      500
    )
  }
}

/**
 * Main handler that routes based on HTTP method
 */
async function handler(req: NextRequest, context: any) {
  switch (req.method) {
    case 'GET':
      return handleGetUsers(req, context)
    case 'PUT':
      return handleUpdateUserRole(req, context)
    default:
      return createApiResponse(
        false,
        null,
        'Method not allowed',
        `Method ${req.method} is not allowed`,
        405
      )
  }
}

// Apply middleware: admin auth, audit logging
const protectedHandler = combineMiddleware(
  withAdminOnly,
  withAuditLog
)

export const GET = protectedHandler(handler)
export const PUT = protectedHandler(handler)