import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, LoginForm } from '../types';
import { getUserPermissions } from '../utils/permissions';
import apiService from '../services/api';

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
  // FOR TESTING: Skip authentication and set up a test admin user
  const testUser: User = {
    id: 'test-admin',
    email: 'admin@ca-lobby.gov',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    permissions: {
      canReadBasicData: true,
      canRunAdvancedSearches: true,
      canRunCustomReports: true,
      canExportUnlimited: true,
      canAccessBulkDownloads: true,
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
    console.log('🧪 TESTING MODE: Authentication bypassed - logged in as Admin');
  }, []);

  const login = async (credentials: LoginForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('authToken', token);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Login failed',
        }));
        return false;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const permissions = getUserPermissions(authState.user?.role || UserRole.GUEST);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    permissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};