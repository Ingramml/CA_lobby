// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: Permissions;
  createdAt?: Date;
}

export enum UserRole {
  GUEST = 'GUEST',
  PUBLIC = 'PUBLIC',
  RESEARCHER = 'RESEARCHER',
  JOURNALIST = 'JOURNALIST',
  ADMIN = 'ADMIN',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Data Types
export interface LobbyingFiling {
  filing_id: string;
  filer_name: string;
  firm_name: string;
  employer_name: string;
  report_date: string;
  from_date: string;
  thru_date: string;
  total_amount: number;
  county: string;
  city: string;
  status: 'Active' | 'Inactive';
  amendment_id: number;
  line_item: string;
  fees_amount?: number;
  reimbursement_amount?: number;
  advance_amount?: number;
  advance_description?: string;
  period_total?: number;
  cumulative_total?: number;
  latest_amendment_flag: boolean;
}

export interface EntitySearchParams {
  filerName?: string;
  firmName?: string;
  employerName?: string;
  counties?: string[];
  cities?: string[];
  registrationStatus?: 'Active' | 'Inactive' | 'All';
  registrationDateFrom?: string;
  registrationDateTo?: string;
}

export interface FinancialSearchParams {
  amountMin?: number;
  amountMax?: number;
  paymentTypes?: PaymentType[];
  reportDateFrom?: string;
  reportDateTo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  filingPeriod?: string;
}

export interface FilingSearchParams {
  filingId?: string;
  amendmentTracking?: boolean;
  documentTypes?: DocumentType[];
  filingStatus?: 'Original' | 'Amended' | 'All';
  latestAmendmentOnly?: boolean;
}

export enum PaymentType {
  LOBBYING_FEES = 'LOBBYING_FEES',
  REIMBURSEMENTS = 'REIMBURSEMENTS',
  ADVANCES = 'ADVANCES',
  OTHER_PAYMENTS = 'OTHER_PAYMENTS',
}

export enum DocumentType {
  DISCLOSURE_FORMS = 'DISCLOSURE_FORMS',
  REGISTRATION_FORMS = 'REGISTRATION_FORMS',
  PAYMENT_RECORDS = 'PAYMENT_RECORDS',
  EMPLOYMENT_RECORDS = 'EMPLOYMENT_RECORDS',
}

// Search and Results Types
export interface SearchResults {
  data: LobbyingFiling[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchState {
  results: SearchResults | null;
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchHistoryItem[];
}

export interface SearchHistoryItem {
  id: string;
  searchType: 'Entity' | 'Financial' | 'Filing';
  parameters: EntitySearchParams | FinancialSearchParams | FilingSearchParams;
  resultCount: number;
  timestamp: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalFilings: number;
  totalPayments: number;
  activeLobbyists: number;
  latestPeriod: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'Filing' | 'Amendment' | 'Registration';
  description: string;
  timestamp: Date;
  filingId?: string;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  createdBy?: string;
  createdDate: Date;
  parameters?: Record<string, any>;
  isCustom: boolean;
}

export enum ReportCategory {
  FINANCIAL_ANALYSIS = 'FINANCIAL_ANALYSIS',
  ENTITY_ANALYSIS = 'ENTITY_ANALYSIS',
  GEOGRAPHIC_REPORTS = 'GEOGRAPHIC_REPORTS',
  TIME_SERIES_REPORTS = 'TIME_SERIES_REPORTS',
}

export interface ReportResult {
  reportId: string;
  data: any[];
  charts?: ChartData[];
  metadata: {
    generatedAt: Date;
    rowCount: number;
    parameters: Record<string, any>;
  };
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'heatmap' | 'network' | 'timeline';
  title: string;
  data: any;
  options?: any;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Export Options
export interface ExportOptions {
  format: 'CSV' | 'PDF' | 'JSON' | 'EXCEL';
  filename?: string;
  includeHeaders?: boolean;
  columns?: string[];
}

export interface ExportLimits {
  maxRows: number;
  maxExportsPerDay: number;
  allowedFormats: ExportOptions['format'][];
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  organization?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: Record<string, boolean>;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Permissions
export interface Permissions {
  canReadBasicData: boolean;
  canRunSimpleSearches: boolean;
  canRunAdvancedSearches: boolean;
  canExportLimited: boolean;
  canReadAllData: boolean;
  canRunCustomReports: boolean;
  canExportUnlimited: boolean;
  canBulkDownload: boolean;
  canManageUsers: boolean;
  canAccessSystemSettings: boolean;
}

// Autocomplete Types
export interface AutocompleteOption {
  label: string;
  value: string;
  count?: number;
}

// Table Column Configuration
export interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}