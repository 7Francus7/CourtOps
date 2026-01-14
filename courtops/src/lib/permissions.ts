
export const ROLES = {
       OWNER: 'OWNER',
       ADMIN: 'ADMIN',
       STAFF: 'STAFF',
       USER: 'USER'
} as const

// Resources available in the system
export const RESOURCES = {
       BOOKINGS: 'BOOKINGS',
       FINANCE: 'FINANCE',
       SETTINGS: 'SETTINGS',
       CLIENTS: 'CLIENTS',
       AUDIT: 'AUDIT'
} as const

// Actions
export const ACTIONS = {
       CREATE: 'CREATE',
       READ: 'READ',
       UPDATE: 'UPDATE',
       DELETE: 'DELETE',
       MANAGE: 'MANAGE' // Super-action
} as const

type Role = keyof typeof ROLES

// Permission Matrix
const PERMISSIONS: Record<Role, Record<string, string[]>> = {
       OWNER: {
              '*': ['*'] // Full access
       },
       ADMIN: {
              [RESOURCES.BOOKINGS]: ['*'],
              [RESOURCES.FINANCE]: ['*'],
              [RESOURCES.CLIENTS]: ['*'],
              [RESOURCES.SETTINGS]: ['READ', 'UPDATE'], // Can't delete club
              [RESOURCES.AUDIT]: ['READ']
       },
       STAFF: {
              [RESOURCES.BOOKINGS]: ['READ', 'CREATE', 'UPDATE'],
              [RESOURCES.CLIENTS]: ['READ', 'CREATE', 'UPDATE'],
              [RESOURCES.FINANCE]: ['CREATE'], // Can receive payments, but not view reports
              [RESOURCES.SETTINGS]: [], // No access
              [RESOURCES.AUDIT]: [] // No access
       },
       USER: {
              [RESOURCES.BOOKINGS]: ['READ'] // Minimal access
       }
}

/**
 * Check if a user role has permission to perform an action on a resource.
 */
export function hasPermission(role: string, resource: string, action: string): boolean {
       const userRole = (role || 'USER').toUpperCase() as Role
       const rolePermissions = PERMISSIONS[userRole]

       if (!rolePermissions) return false

       // Check Global Wildcard
       if (rolePermissions['*'] && rolePermissions['*'].includes('*')) return true

       // Check Resource Specifics
       const resourcePerms = rolePermissions[resource]
       if (!resourcePerms) return false

       if (resourcePerms.includes('*')) return true
       return resourcePerms.includes(action)
}

/**
 * Helper to check if user is at least Admin
 */
export function isAdmin(role?: string) {
       return role === ROLES.ADMIN || role === ROLES.OWNER || role === 'GOD'
}

/**
 * Helper to check if user is Staff or above
 */
export function isStaff(role?: string) {
       return isAdmin(role) || role === ROLES.STAFF
}
