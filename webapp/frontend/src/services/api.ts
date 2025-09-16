import axios, { AxiosInstance, AxiosResponse } from 'axios';
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

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api'),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  // Search endpoints
  async searchEntities(
    params: EntitySearchParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<ApiResponse<PaginatedResponse<LobbyingFiling>>> {
    const response = await this.api.post('/search/entities', {
      ...params,
      pagination: { page, pageSize }
    });
    return response.data;
  }

  async searchFinancial(
    params: FinancialSearchParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<ApiResponse<PaginatedResponse<LobbyingFiling>>> {
    const response = await this.api.post('/search/financial', {
      ...params,
      pagination: { page, pageSize }
    });
    return response.data;
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