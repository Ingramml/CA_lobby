import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user to check permissions
    const currentUser = await clerkClient.users.getUser(userId)
    const userRole = currentUser.publicMetadata?.role as string

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch all users
    const response = await clerkClient.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    })

    // Transform users for the frontend
    const users = response.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses,
      imageUrl: user.imageUrl,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      role: user.publicMetadata?.role || 'viewer',
      metadata: {
        role: user.publicMetadata?.role || 'viewer',
        department: user.publicMetadata?.department,
        lastActive: user.lastActiveAt?.toISOString(),
      },
    }))

    return NextResponse.json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId: currentUserId } = auth()

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user to check permissions
    const currentUser = await clerkClient.users.getUser(currentUserId)
    const userRole = currentUser.publicMetadata?.role as string

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: 'Missing userId or role' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['admin', 'analyst', 'data_manager', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      }, { status: 400 })
    }

    // Prevent admins from changing their own role
    if (userId === currentUserId) {
      return NextResponse.json({ success: false, error: 'Cannot change your own role' }, { status: 400 })
    }

    // Update user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        lastUpdatedBy: currentUserId,
        lastUpdatedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

