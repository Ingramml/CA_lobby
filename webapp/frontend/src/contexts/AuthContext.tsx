import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, LoginForm } from '../types';
import { getUserPermissions } from '../utils/permissions';
import apiService from '../services/api';

// Frontend logging utility for AuthContext
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] [INFO] [AuthContext] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[${new Date().toISOString()}] [WARN] [AuthContext] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [AuthContext] ${message}`, error || '');
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [AuthContext] ${message}`, data || '');
    }
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<boolean>;
  logout: () => void;
  permissions: ReturnType<typeof getUserPermissions>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  logger.info('🚀 AuthProvider initializing');

  // FOR TESTING: Skip authentication and set up a test admin user
  const testUser: User = {
    id: 'test-admin',
    email: 'admin@ca-lobby.gov',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    permissions: {
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
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  const [authState, setAuthState] = useState<AuthState>({
    user: testUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });

  // Initialize authentication state - DISABLED FOR TESTING
  useEffect(() => {
    // Skip authentication check for testing phase
    logger.warn('🧪 TESTING MODE: Authentication bypassed', {
      user: testUser.email,
      role: testUser.role,
      environment: process.env.NODE_ENV
    });
  }, [testUser.email, testUser.role]);

  const login = async (credentials: LoginForm): Promise<boolean> => {
    logger.info('🔐 Login attempt started', {
      email: credentials.email,
      role: credentials.role
    });

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('authToken', token);

        logger.info('✅ Login successful', {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        });

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        logger.debug('🔄 Auth state updated after successful login');
        return true;
      } else {
        const errorMsg = response.message || 'Login failed';
        logger.error('❌ Login failed - API response not successful', {
          email: credentials.email,
          message: errorMsg
        });

        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      logger.error('❌ Login failed - Exception thrown', {
        email: credentials.email,
        error: errorMsg,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      return false;
    }
  };

  const logout = async () => {
    const currentUser = authState.user;
    logger.info('🚪 Logout initiated', {
      userId: currentUser?.id,
      email: currentUser?.email
    });

    try {
      await apiService.logout();
      logger.info('✅ Logout API call successful');
    } catch (error) {
      logger.error('❌ Logout API call failed', {
        error,
        userId: currentUser?.id
      });
    } finally {
      localStorage.removeItem('authToken');
      logger.debug('🗝 Token removed from localStorage');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      logger.info('✅ Logout completed - user logged out', {
        previousUser: currentUser?.email
      });
    }
  };

  const permissions = getUserPermissions(authState.user?.role || UserRole.GUEST);

  logger.debug('🔑 Permissions calculated', {
    role: authState.user?.role || UserRole.GUEST,
    permissions: {
      canReadBasicData: permissions.canReadBasicData,
      canRunAdvancedSearches: permissions.canRunAdvancedSearches,
      canManageUsers: permissions.canManageUsers
    }
  });

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    permissions,
  };

  logger.debug('✅ AuthProvider value prepared', {
    isAuthenticated: authState.isAuthenticated,
    userEmail: authState.user?.email,
    isLoading: authState.isLoading,
    hasError: !!authState.error
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};