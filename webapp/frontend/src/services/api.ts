import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  LobbyingFiling,
  EntitySearchParams,
  FinancialSearchParams,
  FilingSearchParams,
  DashboardStats,
  Report,
  ReportResult,
  AutocompleteOption,
  ExportOptions,
  User,
  LoginForm
} from '../types';

// Logging utility for frontend
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [CA-Lobby-Frontend]`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  info(message: string, data?: any) {
    if (this.isDevelopment || this.isProduction) {
      console.log(this.formatMessage('INFO', message), data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.isDevelopment || this.isProduction) {
      console.warn(this.formatMessage('WARN', message), data || '');
    }
  }

  error(message: string, error?: any) {
    if (this.isDevelopment || this.isProduction) {
      console.error(this.formatMessage('ERROR', message), error || '');
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('DEBUG', message), data || '');
    }
  }
}

const logger = new Logger();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

    logger.info('🚀 Initializing API Service', {
      baseURL,
      environment: process.env.NODE_ENV,
      timeout: 30000
    });

    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication and logging
    this.api.interceptors.request.use(
      (config) => {
        const requestId = this.generateRequestId();
        config.metadata = { startTime: Date.now(), requestId };

        const token = localStorage.getItem('authToken');
        const hasAuth = token && token !== 'null' && token !== 'undefined';

        // Only add auth header if we have a token (for demo mode, don't send empty auth)
        if (hasAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        logger.debug(`🔄 API Request [${requestId}]`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          hasAuth,
          timeout: config.timeout
        });

        return config;
      },
      (error) => {
        logger.error('❌ Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and logging
    this.api.interceptors.response.use(
      (response) => {
        const config = response.config as any;
        const duration = config.metadata ? Date.now() - config.metadata.startTime : 0;
        const requestId = config.metadata?.requestId || 'unknown';

        logger.info(`✅ API Response [${requestId}]`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          status: response.status,
          duration: `${duration}ms`,
          dataSize: response.data ? JSON.stringify(response.data).length : 0
        });

        return response;
      },
      (error: AxiosError) => {
        const config = error.config as any;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;
        const requestId = config?.metadata?.requestId || 'unknown';

        logger.error(`❌ API Error [${requestId}]`, {
          method: config?.method?.toUpperCase(),
          url: config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          duration: `${duration}ms`,
          message: error.message,
          responseData: error.response?.data
        });

        if (error.response?.status === 401) {
          logger.warn('🔒 Unauthorized - redirecting to login');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

    logger.info('✅ API Service initialized successfully');
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Authentication endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    logger.info('🔐 Attempting login', { email: credentials.email, role: credentials.role });
    try {
      const response = await this.api.post('/auth/login', credentials);
      logger.info('✅ Login successful', {
        email: credentials.email,
        role: response.data.data?.user?.role,
        userId: response.data.data?.user?.id
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Login failed', { email: credentials.email, error });
      throw error;
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    logger.info('🚪 Attempting logout');
    try {
      const response = await this.api.post('/auth/logout');
      logger.info('✅ Logout successful');
      return response.data;
    } catch (error) {
      logger.error('❌ Logout failed', error);
      throw error;
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    logger.info('🔄 Refreshing token');
    try {
      const response = await this.api.post('/auth/refresh');
      logger.info('✅ Token refreshed successfully');
      return response.data;
    } catch (error) {
      logger.error('❌ Token refresh failed', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    logger.debug('👤 Fetching current user info');
    try {
      const response = await this.api.get('/auth/me');
      logger.debug('✅ Current user info retrieved', {
        email: response.data.data?.email,
        role: response.data.data?.role
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Failed to fetch current user', error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    logger.info('📊 Fetching dashboard statistics');
    try {
      const response = await this.api.get('/dashboard/stats');
      const stats = response.data.data;
      logger.info('✅ Dashboard stats retrieved', {
        totalFilings: stats?.totalFilings,
        activeLobbyists: stats?.activeLobbyists,
        cached: response.data.cached
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Failed to fetch dashboard stats', error);
      throw error;
    }
  }

  // Search endpoints
  async searchEntities(
    params: EntitySearchParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<ApiResponse<PaginatedResponse<LobbyingFiling>>> {
    logger.info('🔍 Entity search initiated', {
      searchTerms: {
        filer: params.filer?.slice(0, 50),
        firm: params.firm?.slice(0, 50),
        employer: params.employer?.slice(0, 50)
      },
      page,
      pageSize
    });
    try {
      const response = await this.api.post('/search/entities', {
        ...params,
        pagination: { page, pageSize }
      });
      const results = response.data.data;
      logger.info('✅ Entity search completed', {
        resultsCount: results?.results?.length || 0,
        totalResults: results?.total || 0,
        page: results?.page || page
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Entity search failed', error);
      throw error;
    }
  }

  async searchFinancial(
    params: FinancialSearchParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<ApiResponse<PaginatedResponse<LobbyingFiling>>> {
    logger.info('💰 Financial search initiated', {
      searchCriteria: {
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        dateRange: params.startDate && params.endDate ?
          `${params.startDate} to ${params.endDate}` : 'any'
      },
      page,
      pageSize
    });
    try {
      const response = await this.api.post('/search/financial', {
        ...params,
        pagination: { page, pageSize }
      });
      const results = response.data.data;
      logger.info('✅ Financial search completed', {
        resultsCount: results?.results?.length || 0,
        totalResults: results?.total || 0
      });
      return response.data;
    } catch (error) {
      logger.error('❌ Financial search failed', error);
      throw error;
    }
  }

  async searchFilings(
    params: FilingSearchParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<ApiResponse<PaginatedResponse<LobbyingFiling>>> {
    const response = await this.api.post('/search/filings', {
      ...params,
      pagination: { page, pageSize }
    });
    return response.data;
  }

  // Autocomplete endpoints
  async getAutocompleteSuggestions(
    field: 'filers' | 'firms' | 'employers' | 'counties' | 'cities',
    query: string,
    limit: number = 10
  ): Promise<ApiResponse<AutocompleteOption[]>> {
    const response = await this.api.get(`/autocomplete/${field}`, {
      params: { query, limit }
    });
    return response.data;
  }

  // Data endpoints
  async getCounties(): Promise<ApiResponse<AutocompleteOption[]>> {
    const response = await this.api.get('/data/counties');
    return response.data;
  }

  async getCities(county: string): Promise<ApiResponse<AutocompleteOption[]>> {
    const response = await this.api.get(`/data/cities/${county}`);
    return response.data;
  }

  async getFilingPeriods(): Promise<ApiResponse<AutocompleteOption[]>> {
    const response = await this.api.get('/data/filing-periods');
    return response.data;
  }

  // Report endpoints
  async getPredefinedReports(): Promise<ApiResponse<Report[]>> {
    const response = await this.api.get('/reports/predefined');
    return response.data;
  }

  async generatePredefinedReport(
    reportId: string,
    parameters?: Record<string, any>
  ): Promise<ApiResponse<ReportResult>> {
    const response = await this.api.post(`/reports/predefined/${reportId}/generate`, {
      parameters
    });
    return response.data;
  }

  async generateCustomReport(
    reportConfig: {
      name: string;
      query: string;
      parameters?: Record<string, any>;
      visualizations?: any[];
    }
  ): Promise<ApiResponse<ReportResult>> {
    const response = await this.api.post('/reports/custom/generate', reportConfig);
    return response.data;
  }

  async saveCustomReport(
    reportConfig: {
      name: string;
      description: string;
      query: string;
      parameters?: Record<string, any>;
      visualizations?: any[];
    }
  ): Promise<ApiResponse<Report>> {
    const response = await this.api.post('/reports/custom/save', reportConfig);
    return response.data;
  }

  async getMyReports(): Promise<ApiResponse<Report[]>> {
    const response = await this.api.get('/reports/my-reports');
    return response.data;
  }

  // Export endpoints
  async exportData(
    data: any[],
    options: ExportOptions
  ): Promise<Blob> {
    const response = await this.api.post('/export', {
      data,
      options
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportSearch(
    searchType: 'entities' | 'financial' | 'filings',
    searchParams: any,
    options: ExportOptions
  ): Promise<Blob> {
    const response = await this.api.post(`/export/search/${searchType}`, {
      searchParams,
      options
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportReport(
    reportId: string,
    options: ExportOptions
  ): Promise<Blob> {
    const response = await this.api.post(`/export/report/${reportId}`, {
      options
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Filing detail endpoint
  async getFilingDetail(filingId: string): Promise<ApiResponse<LobbyingFiling>> {
    const response = await this.api.get(`/filings/${filingId}`);
    return response.data;
  }

  // Statistics endpoints
  async getSearchStatistics(): Promise<ApiResponse<{
    totalSearches: number;
    popularTerms: string[];
    recentSearches: any[];
  }>> {
    const response = await this.api.get('/statistics/search');
    return response.data;
  }

  // Admin endpoints (protected)
  async getUsers(page: number = 1, pageSize: number = 25): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.api.get('/admin/users', {
      params: { page, pageSize }
    });
    return response.data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put(`/admin/users/${userId}`, updates);
    return response.data;
  }

  async getSystemStats(): Promise<ApiResponse<{
    activeUsers: number;
    totalQueries: number;
    systemHealth: string;
    uptime: number;
  }>> {
    const response = await this.api.get('/admin/system/stats');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;