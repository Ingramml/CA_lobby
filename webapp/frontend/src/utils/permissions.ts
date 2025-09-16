import { UserRole, Permissions, ExportLimits } from '../types';

export const getUserPermissions = (role: UserRole): Permissions => {
  const permissions: Record<UserRole, Permissions> = {
    [UserRole.GUEST]: {
      canReadBasicData: true,
      canRunSimpleSearches: true,
      canRunAdvancedSearches: false,
      canExportLimited: false,
      canReadAllData: false,
      canRunCustomReports: false,
      canExportUnlimited: false,
      canBulkDownload: false,
      canManageUsers: false,
      canAccessSystemSettings: false,
    },
    [UserRole.PUBLIC]: {
      canReadBasicData: true,
      canRunSimpleSearches: true,
      canRunAdvancedSearches: true,
      canExportLimited: true,
      canReadAllData: false,
      canRunCustomReports: false,
      canExportUnlimited: false,
      canBulkDownload: false,
      canManageUsers: false,
      canAccessSystemSettings: false,
    },
    [UserRole.RESEARCHER]: {
      canReadBasicData: true,
      canRunSimpleSearches: true,
      canRunAdvancedSearches: true,
      canExportLimited: true,
      canReadAllData: true,
      canRunCustomReports: true,
      canExportUnlimited: true,
      canBulkDownload: false,
      canManageUsers: false,
      canAccessSystemSettings: false,
    },
    [UserRole.JOURNALIST]: {
      canReadBasicData: true,
      canRunSimpleSearches: true,
      canRunAdvancedSearches: true,
      canExportLimited: true,
      canReadAllData: true,
      canRunCustomReports: true,
      canExportUnlimited: true,
      canBulkDownload: true,
      canManageUsers: false,
      canAccessSystemSettings: false,
    },
    [UserRole.ADMIN]: {
      canReadBasicData: true,
      canRunSimpleSearches: true,
      canRunAdvancedSearches: true,
      canExportLimited: true,
      canReadAllData: true,
      canRunCustomReports: true,
      canExportUnlimited: true,
      canBulkDownload: true,
      canManageUsers: true,
      canAccessSystemSettings: true,
    },
  };

  return permissions[role];
};

export const getExportLimits = (role: UserRole): ExportLimits => {
  const limits: Record<UserRole, ExportLimits> = {
    [UserRole.GUEST]: {
      maxRows: 0,
      maxExportsPerDay: 0,
      allowedFormats: [],
    },
    [UserRole.PUBLIC]: {
      maxRows: 1000,
      maxExportsPerDay: 5,
      allowedFormats: ['CSV', 'JSON'],
    },
    [UserRole.RESEARCHER]: {
      maxRows: 10000,
      maxExportsPerDay: 20,
      allowedFormats: ['CSV', 'PDF', 'JSON', 'EXCEL'],
    },
    [UserRole.JOURNALIST]: {
      maxRows: 50000,
      maxExportsPerDay: Infinity,
      allowedFormats: ['CSV', 'PDF', 'JSON', 'EXCEL'],
    },
    [UserRole.ADMIN]: {
      maxRows: Infinity,
      maxExportsPerDay: Infinity,
      allowedFormats: ['CSV', 'PDF', 'JSON', 'EXCEL'],
    },
  };

  return limits[role];
};

export const canAccessRoute = (role: UserRole, route: string): boolean => {
  const permissions = getUserPermissions(role);

  const routePermissions: Record<string, keyof Permissions> = {
    '/dashboard': 'canReadBasicData',
    '/search': 'canRunAdvancedSearches',
    '/reports': 'canRunCustomReports',
    '/admin': 'canManageUsers',
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Public routes

  return permissions[requiredPermission];
};