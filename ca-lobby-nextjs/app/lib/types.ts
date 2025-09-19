/**
 * Comprehensive TypeScript Types and Interfaces for CA Lobby Next.js API
 *
 * This module provides all TypeScript types, interfaces, and schemas
 * for the CA Lobby application API endpoints and data structures.
 */

// Base Types and Common Interfaces

export interface BaseAPIResponse {
  success: boolean
  timestamp: string
  requestId?: string
  version?: string
}

export interface ErrorResponse extends BaseAPIResponse {
  success: false
  error: string
  code: string
  details?: Record<string, any>
  statusCode?: number
}

export interface SuccessResponse<TData = any> extends BaseAPIResponse {
  success: true
  data: TData
  meta?: ResponseMeta
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasMore?: boolean
  executionTime?: number
  fromCache?: boolean
  cacheExpires?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// California Lobby Data Types

export interface CALobbyFiling {
  FILING_ID: string
  FILER_NAML: string
  FIRM_NAME?: string
  RPT_DATE: string
  FROM_DATE: string
  THRU_DATE: string
  CUM_BEG_DT?: string
  AMEND_ID: string
  FORM_TYPE?: string
  REC_TYPE?: string
  ENTITY_CD?: string
  FILER_ID?: string
}

export interface LobbyistPayment {
  FILING_ID: string
  LINE_ITEM: number
  AMEND_ID: string
  EMPLR_NAML: string
  FEES_AMT?: number
  REIMB_AMT?: number
  ADVAN_AMT?: number
  ADVAN_DSCR?: string
  PER_TOTAL?: number
  CUM_TOTAL?: number
  REC_TYPE?: string
  FORM_TYPE?: string
  ENTITY_CD?: string
}

export interface AssociationPayment {
  FILING_ID: string
  LINE_ITEM: number
  AMEND_ID: string
  RECIP_NAML: string
  PMT_DATE: string
  AMOUNT: number
  CUM_AMT?: number
  PMT_DSCR?: string
  REC_TYPE?: string
  FORM_TYPE?: string
  ENTITY_CD?: string
}

export interface LobbyContact {
  FILING_ID: string
  LINE_ITEM: number
  AMEND_ID: string
  LNDRSHIP_CD?: string
  FIRM_NAME?: string
  SUBJ_NAML?: string
  SUBJ_NAMF?: string
  SUBJ_NAMT?: string
  SUBJ_NAMS?: string
  CONTACT_DATE?: string
  DESCRIP?: string
  REC_TYPE?: string
  FORM_TYPE?: string
  ENTITY_CD?: string
}

export interface LobbyExpense {
  FILING_ID: string
  LINE_ITEM: number
  AMEND_ID: string
  EXPN_DATE: string
  AMOUNT: number
  DESCRIP?: string
  RECIP_NAML?: string
  RECIP_CITY?: string
  RECIP_ST?: string
  RECIP_ZIP4?: string
  REC_TYPE?: string
  FORM_TYPE?: string
  ENTITY_CD?: string
}

// BLN API Types

export type BLNTableName =
  | 'cvr_lobby_disclosure_cd'
  | 'cvr_registration_cd'
  | 'latt_cd'
  | 'lccm_cd'
  | 'lemp_cd'
  | 'lexp_cd'
  | 'loth_cd'
  | 'lpay_cd'
  | 'filername_cd'

export interface BLNTableInfo {
  name: string
  description: string
  category: 'disclosure' | 'registration' | 'payments' | 'activity' | 'employment' | 'expenses' | 'reference'
  recordCount?: number
  lastUpdated?: string
  schema?: BLNColumnSchema[]
}

export interface BLNColumnSchema {
  name: string
  type: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'DATE' | 'TIMESTAMP'
  mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED'
  description?: string
}

export interface BLNDownloadOptions {
  files?: BLNTableName[]
  format?: 'csv' | 'json'
  outputDir?: string
  skipExisting?: boolean
  includeMetadata?: boolean
}

export interface BLNDownloadResult {
  success: boolean
  tableName: string
  data?: any[]
  rowCount?: number
  downloadedAt: string
  fromCache?: boolean
  error?: string
  metadata?: {
    lastModified?: string
    version?: string
    dataQuality?: number
  }
}

// BigQuery API Types

export interface BigQueryRequest {
  query: string
  parameters?: Record<string, any>
  maxResults?: number
  timeoutMs?: number
  useLegacySql?: boolean
  dryRun?: boolean
}

export interface BigQueryResponse extends BaseAPIResponse {
  data: any[]
  rowCount: number
  totalBytesProcessed?: string
  totalSlotMs?: string
  executionTime: number
  fromCache?: boolean
  cacheKey?: string
  query?: string
}

export interface BigQueryUploadOptions {
  tableName: string
  data: any[]
  schema?: BLNColumnSchema[]
  writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY'
  createDisposition?: 'CREATE_IF_NEEDED' | 'CREATE_NEVER'
}

export interface BigQueryUploadResponse extends BaseAPIResponse {
  tableName: string
  rowsUploaded: number
  schema: BLNColumnSchema[]
  uploadedAt: string
  jobId?: string
  tableId?: string
}

// Data Analysis Types

export type AnalysisType =
  | 'basic_stats'
  | 'data_quality'
  | 'schema_analysis'
  | 'null_analysis'
  | 'duplicate_analysis'
  | 'value_distribution'
  | 'data_profiling'
  | 'trend_analysis'

export interface DataSource {
  type: 'table' | 'query' | 'file' | 'url'
  source: string
  format?: 'csv' | 'json'
}

export interface AnalysisOptions {
  dataSource: DataSource
  analysisType: AnalysisType[]
  includeStatistics?: boolean
  includeQualityCheck?: boolean
  sampleSize?: number
  customQueries?: string[]
}

export interface AnalysisResult {
  type: AnalysisType
  results: any
  status: 'completed' | 'failed' | 'skipped'
  executionTime: number
  errorMessage?: string
}

export interface AnalysisSummary {
  totalRows: number
  totalColumns: number
  nullPercentage: number
  duplicateRows: number
  dataQualityScore: number
  schemaConsistency: boolean
  memoryUsage?: string
}

export interface DataAnalysisResponse extends BaseAPIResponse {
  dataSource: DataSource
  analysisResults: AnalysisResult[]
  summary: AnalysisSummary
  recommendations: string[]
  executionTime: number
  analyzedAt: string
  errors: string[]
}

// Data Transformation Types

export type TransformationType = 'column_rename' | 'column_mapping' | 'data_cleaning' | 'schema_update'

export interface TransformationRule {
  type: 'rename' | 'cast' | 'clean' | 'remove' | 'add'
  sourceColumn?: string
  targetColumn?: string
  dataType?: string
  cleaningPattern?: string
  defaultValue?: any
  expression?: string
}

export interface TransformOptions {
  sourceTable: string
  targetTable?: string
  transformationType: TransformationType
  transformationRules: TransformationRule[]
  validateSchema?: boolean
  createBackup?: boolean
}

export interface AppliedTransformation {
  rule: TransformationRule
  status: 'success' | 'failed' | 'skipped'
  errorMessage?: string
  rowsAffected?: number
}

export interface TransformResponse extends BaseAPIResponse {
  sourceTable: string
  targetTable: string
  transformationsApplied: AppliedTransformation[]
  rowsAffected: number
  columnsModified: number
  backupTable?: string
  executionTime: number
  startedAt: string
  completedAt: string
  errors: string[]
}

// File Management Types

export interface FileInfo {
  fileName: string
  fullPath: string
  size?: number
  created?: string
  modified?: string
  type: string
  isProcessable: boolean
  excludeReason?: string
}

export interface FileSelectionOptions {
  directory?: string
  filePattern?: string
  excludePatterns?: string[]
  includeMetadata?: boolean
  sortBy?: 'name' | 'date' | 'size'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export interface FileSelectionResponse extends BaseAPIResponse {
  operation: string
  files: FileInfo[]
  processableFiles: FileInfo[]
  excludedFiles: FileInfo[]
  totalFiles: number
  processableCount: number
  excludedCount: number
  selectionCriteria: FileSelectionOptions
  selectedAt: string
}

// Upload Pipeline Types

export interface ProcessedFile {
  fileName: string
  tableName: string
  status: 'uploaded' | 'skipped' | 'failed'
  rowCount: number
  errorMessage?: string
  processingTime: number
}

export interface UploadPipelineOptions {
  files?: File[]
  tablePrefix?: string
  projectId?: string
  datasetId?: string
  processExistingFiles?: boolean
  cleanFilePrefix?: string[]
  validateData?: boolean
  batchSize?: number
}

export interface UploadPipelineResponse extends BaseAPIResponse {
  processedFiles: ProcessedFile[]
  errors: string[]
  totalRowsUploaded: number
  processingTime: number
  startedAt: string
  completedAt: string
}

// Query API Types

export interface QueryRequest {
  parameters?: Record<string, any>
  format?: 'json' | 'csv'
  limit?: number
  useCache?: boolean
  customSql?: string
}

export interface QueryResponse extends BaseAPIResponse {
  queryName?: string
  data: any[]
  rowCount: number
  executionTime: number
  executedAt: string
  format: string
  fromCache?: boolean
  error?: string
}

export interface QueryInfo {
  name: string
  description: string
  endpoint: string
  parameters: string[]
  tags: string[]
  sampleUsage: {
    GET: string
    POST: Record<string, any>
  }
}

export interface QueryListResponse extends BaseAPIResponse {
  availableQueries: Record<string, QueryInfo>
  totalQueries: number
  supportedFormats: string[]
  commonParameters: string[]
  features: string[]
}

// Cache Types

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  compress?: boolean
  version?: string
  serialize?: boolean
}

export interface CacheStats {
  totalKeys: number
  memoryUsage: number
  hitRate: number
  missRate: number
  evictions: number
  errors: number
}

export interface CacheResponse extends BaseAPIResponse {
  stats: CacheStats
  backend: string
  operations: string[]
}

// Authentication and Permission Types

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  permissions: Permission[]
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export type UserRole = 'admin' | 'analyst' | 'viewer' | 'api_user'

export type Permission =
  | 'bigquery:read'
  | 'bigquery:write'
  | 'bigquery:delete'
  | 'data:download'
  | 'data:upload'
  | 'data:transform'
  | 'cache:manage'
  | 'admin:users'
  | 'admin:system'

export interface AuthRequest {
  token?: string
  apiKey?: string
  permissions?: Permission[]
}

export interface AuthResponse extends BaseAPIResponse {
  user?: User
  token?: string
  expiresAt?: string
  permissions: Permission[]
}

// Monitoring and Logging Types

export interface LogEntry {
  timestamp: string
  requestId: string
  method: string
  url: string
  statusCode: number
  duration: number
  userAgent?: string
  ipAddress?: string
  userId?: string
  error?: string
  responseSize?: number
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  checks: HealthCheck[]
  uptime: number
  version: string
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  responseTime?: number
  message?: string
  details?: Record<string, any>
}

export interface MetricData {
  name: string
  value: number
  unit: string
  timestamp: string
  tags?: Record<string, string>
}

// Validation Types

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ValidationResult<T = any> {
  isValid: boolean
  data?: T
  errors: ValidationError[]
  warnings?: string[]
}

// API Route Helper Types

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'

export interface RouteHandler<TRequest = any, TResponse = any> {
  method: HTTPMethod
  path: string
  handler: (request: TRequest) => Promise<TResponse>
  permissions?: Permission[]
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  cache?: CacheOptions
}

export interface APIEndpoint {
  path: string
  methods: HTTPMethod[]
  description: string
  parameters?: APIParameter[]
  responses: APIResponseSchema[]
  examples?: APIExample[]
}

export interface APIParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  example?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: string[]
  }
}

export interface APIResponseSchema {
  statusCode: number
  description: string
  schema: any // JSON schema
  example?: any
}

export interface APIExample {
  title: string
  description: string
  request: any
  response: any
}

// Utility Types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithTimestamps<T> = T & {
  createdAt: string
  updatedAt: string
}

export type WithMetadata<T> = T & {
  id: string
  version: number
  metadata?: Record<string, any>
}

// Type Guards

export function isErrorResponse(response: BaseAPIResponse): response is ErrorResponse {
  return !response.success
}

export function isSuccessResponse<T>(response: BaseAPIResponse): response is SuccessResponse<T> {
  return response.success
}

export function isBigQueryResponse(response: BaseAPIResponse): response is BigQueryResponse {
  return response.success && 'data' in response && 'rowCount' in response
}

export function isValidBLNTableName(name: string): name is BLNTableName {
  const validTables: BLNTableName[] = [
    'cvr_lobby_disclosure_cd',
    'cvr_registration_cd',
    'latt_cd',
    'lccm_cd',
    'lemp_cd',
    'lexp_cd',
    'loth_cd',
    'lpay_cd',
    'filername_cd'
  ]
  return validTables.includes(name as BLNTableName)
}

export function isValidAnalysisType(type: string): type is AnalysisType {
  const validTypes: AnalysisType[] = [
    'basic_stats',
    'data_quality',
    'schema_analysis',
    'null_analysis',
    'duplicate_analysis',
    'value_distribution',
    'data_profiling',
    'trend_analysis'
  ]
  return validTypes.includes(type as AnalysisType)
}

// Export all types for external use
export * from './validation'
export * from './cache'