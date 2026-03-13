export interface EmployeePermissions {
       canCreateBooking: boolean
       canDeleteBooking: boolean
       canViewReports: boolean
       canManageSettings: boolean
       canManageClients: boolean
       canManagePayments: boolean
}

export const DEFAULT_EMPLOYEE_PERMISSIONS: EmployeePermissions = {
       canCreateBooking: true,
       canDeleteBooking: false,
       canViewReports: false,
       canManageSettings: false,
       canManageClients: true,
       canManagePayments: true
}
