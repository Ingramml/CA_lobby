/**
 * BigQuery Client with Connection Pooling and Optimization for Vercel
 *
 * This module provides a singleton BigQuery client with connection pooling,
 * query optimization, and proper error handling for production deployment.
 */

import { BigQuery, Dataset, Table, Query, QueryOptions, QueryRowsResponse } from '@google-cloud/bigquery';

// Global client instance for connection reuse
let bigqueryClient: BigQuery | null = null;

// Query result cache for frequent queries
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configuration interface
interface BigQueryConfig {
  projectId: string;
  credentials: any;
  location?: string;
  maxResults?: number;
  timeoutMs?: number;
  keyFilename?: string;
}

// Connection pool configuration
interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  acquireTimeout: number;
}

// Default configuration
const DEFAULT_CONFIG: Partial<BigQueryConfig> = {
  location: process.env.BIGQUERY_LOCATION || 'US',
  maxResults: parseInt(process.env.BIGQUERY_MAX_RESULTS || '10000'),
  timeoutMs: 30000, // 30 seconds for Vercel functions
};

const DEFAULT_POOL_CONFIG: ConnectionPoolConfig = {
  maxConnections: 10,
  idleTimeout: 300000, // 5 minutes
  acquireTimeout: 60000, // 1 minute
};

/**
 * Initialize and return a singleton BigQuery client instance
 * @returns BigQuery client instance
 */
export function getBigQueryClient(config?: Partial<BigQueryConfig>): BigQuery {
  if (!bigqueryClient) {
    const projectId = config?.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
    }

    let credentials;

    // Handle different credential formats
    if (config?.credentials) {
      credentials = config.credentials;
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      } catch (error) {
        throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON format');
      }
    } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
      // For local development with key file
      credentials = undefined; // Let BigQuery SDK handle key file
    }

    const clientConfig: any = {
      projectId,
      location: config?.location || DEFAULT_CONFIG.location,
      ...DEFAULT_POOL_CONFIG,
    };

    // Add credentials if available
    if (credentials) {
      clientConfig.credentials = credentials;
    } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
      clientConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
    }

    bigqueryClient = new BigQuery(clientConfig);

    console.log(`✅ BigQuery client initialized for project: ${projectId}`);
  }

  return bigqueryClient;
}

// Legacy export for backward compatibility
export const bigquery = getBigQueryClient();

// Default dataset and table names
export const DATASET_ID = process.env.BIGQUERY_DATASET || 'ca_lobby_data';

export interface QueryOptions {
  query: string;
  parameters?: { [key: string]: any };
  maxResults?: number;
  timeoutMs?: number;
}

export interface UploadOptions {
  tableName: string;
  data: any[];
  schema?: any[];
  writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY';
}

/**
 * Execute a BigQuery query with caching and error handling
 * @param query SQL query string or Query object
 * @param options Query options
 * @param cacheOptions Caching configuration
 */
export async function executeQueryWithCache<T = any>(
  query: string | Query,
  options: QueryOptions = {},
  cacheOptions?: { ttl?: number; key?: string; skipCache?: boolean }
): Promise<T[]> {
  const client = getBigQueryClient();

  // Generate cache key
  const queryString = typeof query === 'string' ? query : query.query || '';
  const cacheKey = cacheOptions?.key || generateCacheKey(queryString, options);

  // Check cache first (unless explicitly skipped)
  if (!cacheOptions?.skipCache && queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < cached.ttl) {
      console.log(`📋 Cache hit for query: ${cacheKey.substring(0, 50)}...`);
      return cached.data;
    } else {
      queryCache.delete(cacheKey);
    }
  }

  try {
    console.log(`🔍 Executing BigQuery: ${queryString.substring(0, 100)}...`);

    const queryOptions: any = {
      ...DEFAULT_CONFIG,
      ...options,
      query: queryString,
    };

    const startTime = Date.now();
    const [rows]: QueryRowsResponse = await client.query(queryOptions);
    const duration = Date.now() - startTime;

    console.log(`✅ Query completed in ${duration}ms, returned ${rows.length} rows`);

    // Cache the results
    if (!cacheOptions?.skipCache) {
      const ttl = cacheOptions?.ttl || parseInt(process.env.CACHE_TTL_BIGQUERY || '1800000'); // 30 minutes default
      queryCache.set(cacheKey, {
        data: rows,
        timestamp: Date.now(),
        ttl,
      });
    }

    return rows as T[];
  } catch (error) {
    console.error('❌ BigQuery execution error:', error);

    // Enhanced error handling with context
    if (error instanceof Error) {
      throw new BigQueryError(error.message, queryString, error);
    }

    throw new BigQueryError('Unknown BigQuery error', queryString);
  }
}

/**
 * Legacy executeQuery function for backward compatibility
 */
export async function executeQuery(options: QueryOptions) {
  try {
    const { query, parameters = {}, maxResults = 1000, timeoutMs = 60000 } = options;

    const rows = await executeQueryWithCache(query, {
      params: parameters,
      maxResults,
      timeoutMs,
      useLegacySql: false,
    });

    return {
      success: true,
      data: rows,
      rowCount: rows.length,
    };
  } catch (error) {
    console.error('BigQuery query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      rowCount: 0,
    };
  }
}

/**
 * Execute multiple queries in parallel with connection pooling
 * @param queries Array of query configurations
 */
export async function executeParallelQueries<T = any>(
  queries: Array<{
    query: string;
    options?: QueryOptions;
    cacheOptions?: { ttl?: number; key?: string; skipCache?: boolean };
  }>
): Promise<T[][]> {
  console.log(`🔄 Executing ${queries.length} parallel queries`);

  const promises = queries.map(({ query, options, cacheOptions }) =>
    executeQueryWithCache<T>(query, options, cacheOptions)
  );

  try {
    const results = await Promise.all(promises);
    console.log('✅ All parallel queries completed successfully');
    return results;
  } catch (error) {
    console.error('❌ Error in parallel query execution:', error);
    throw error;
  }
}

/**
 * Upload data to BigQuery table
 */
export async function uploadToBigQuery(options: UploadOptions) {
  try {
    const { tableName, data, schema, writeDisposition = 'WRITE_APPEND' } = options;

    // Get dataset reference
    const dataset: Dataset = bigquery.dataset(DATASET_ID);

    // Create dataset if it doesn't exist
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await dataset.create({
        location: 'US',
      });
    }

    // Get table reference
    const table: Table = dataset.table(tableName);

    // Create table if it doesn't exist and schema is provided
    const [tableExists] = await table.exists();
    if (!tableExists && schema) {
      await table.create({
        schema: { fields: schema },
      });
    }

    // Insert data
    const insertOptions = {
      writeDisposition,
      createDisposition: 'CREATE_IF_NEEDED',
      ...(schema && { schema: { fields: schema } }),
    };

    await table.insert(data, insertOptions);

    return {
      success: true,
      message: `Successfully uploaded ${data.length} rows to ${tableName}`,
      rowCount: data.length,
    };
  } catch (error) {
    console.error('BigQuery upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      rowCount: 0,
    };
  }
}

/**
 * Download data from BigQuery table
 */
export async function downloadFromBigQuery(
  tableName: string,
  filters?: { [key: string]: any },
  limit?: number
) {
  try {
    let query = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET_ID}.${tableName}\``;

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      const filterConditions = Object.entries(filters)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key} = "${value}"`;
          }
          return `${key} = ${value}`;
        })
        .join(' AND ');

      query += ` WHERE ${filterConditions}`;
    }

    // Add limit if provided
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    return await executeQuery({ query });
  } catch (error) {
    console.error('BigQuery download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      rowCount: 0,
    };
  }
}

/**
 * Get table schema
 */
export async function getTableSchema(tableName: string) {
  try {
    const dataset = bigquery.dataset(DATASET_ID);
    const table = dataset.table(tableName);

    const [metadata] = await table.getMetadata();

    return {
      success: true,
      schema: metadata.schema?.fields || [],
    };
  } catch (error) {
    console.error('BigQuery schema error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      schema: [],
    };
  }
}

/**
 * List all tables in the dataset
 */
export async function listTables() {
  try {
    const dataset = bigquery.dataset(DATASET_ID);
    const [tables] = await dataset.getTables();

    const tableList = tables.map(table => ({
      id: table.id,
      name: table.metadata?.friendlyName || table.id,
      description: table.metadata?.description || '',
      created: table.metadata?.creationTime,
      modified: table.metadata?.lastModifiedTime,
    }));

    return {
      success: true,
      tables: tableList,
    };
  } catch (error) {
    console.error('BigQuery list tables error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      tables: [],
    };
  }
}

/**
 * Check BigQuery connection health
 */
export async function checkConnection() {
  try {
    // Simple query to test connection
    const query = 'SELECT 1 as test_connection';
    const result = await executeQuery({ query });

    return {
      success: result.success,
      connected: result.success,
      message: result.success ? 'BigQuery connection successful' : result.error,
    };
  } catch (error) {
    return {
      success: false,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Enhanced BigQuery connection health check
 */
export async function checkBigQueryConnection(): Promise<boolean> {
  try {
    const client = getBigQueryClient();

    // Simple query to test connection
    const query = 'SELECT 1 as test_connection LIMIT 1';
    await client.query({ query, maxResults: 1 });

    console.log('✅ BigQuery connection healthy');
    return true;
  } catch (error) {
    console.error('❌ BigQuery connection failed:', error);
    return false;
  }
}

/**
 * Clear query cache
 * @param pattern Optional pattern to match cache keys
 */
export function clearQueryCache(pattern?: string): void {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of queryCache.keys()) {
      if (regex.test(key)) {
        queryCache.delete(key);
      }
    }
    console.log(`🗑️ Cleared cache entries matching pattern: ${pattern}`);
  } else {
    queryCache.clear();
    console.log('🗑️ Cleared all query cache');
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  totalMemory: number;
} {
  const keys = Array.from(queryCache.keys());
  const totalMemory = JSON.stringify([...queryCache.values()]).length;

  return {
    size: queryCache.size,
    keys,
    totalMemory,
  };
}

/**
 * Generate a cache key from query and options
 */
function generateCacheKey(query: string, options: any): string {
  const normalizedQuery = query.replace(/\s+/g, ' ').trim();
  const optionsHash = JSON.stringify(options);
  return btoa(`${normalizedQuery}:${optionsHash}`).substring(0, 64);
}

/**
 * Custom BigQuery error class
 */
export class BigQueryError extends Error {
  public readonly query: string;
  public readonly originalError?: Error;

  constructor(message: string, query: string, originalError?: Error) {
    super(message);
    this.name = 'BigQueryError';
    this.query = query;
    this.originalError = originalError;
  }
}

/**
 * Graceful shutdown - close connections
 */
export function closeBigQueryClient(): void {
  if (bigqueryClient) {
    // Clear cache
    queryCache.clear();
    bigqueryClient = null;
    console.log('🔌 BigQuery client connections closed');
  }
}

// Export types for external use
export type { BigQueryConfig, ConnectionPoolConfig };

// Utility functions for common CA Lobby queries
export const CALobbyQueries = {
  /**
   * Get legislative activity summary
   */
  async getLegislativeActivity(dateRange?: { start: string; end: string }) {
    const whereClause = dateRange
      ? `WHERE "RPT_DATE" BETWEEN '${dateRange.start}' AND '${dateRange.end}'`
      : '';

    const query = `
      SELECT
        COUNT(*) as total_activities,
        COUNT(DISTINCT "FILING_ID") as unique_filings,
        COUNT(DISTINCT "FILER_NAML") as unique_filers
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.cvr_lobby_disclosure_cd\`
      ${whereClause}
    `;

    return executeQueryWithCache(query, {}, { ttl: 3600000 }); // 1 hour cache
  },

  /**
   * Get lobby spending summary
   */
  async getLobbySpending(year?: number) {
    const whereClause = year ? `WHERE EXTRACT(YEAR FROM PARSE_DATE('%Y-%m-%d', "RPT_DATE")) = ${year}` : '';

    const query = `
      SELECT
        SUM(CAST("PER_TOTAL" AS FLOAT64)) as total_spending,
        COUNT(DISTINCT "EMPLR_NAML") as unique_employers,
        AVG(CAST("PER_TOTAL" AS FLOAT64)) as avg_spending
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lpay_cd\`
      WHERE "PER_TOTAL" IS NOT NULL
      ${whereClause}
    `;

    return executeQueryWithCache(query, {}, { ttl: 7200000 }); // 2 hour cache
  },

  /**
   * Get payment trends to lobbyists
   */
  async getPaymentTrends(months: number = 12) {
    const query = `
      WITH monthly_payments AS (
        SELECT
          EXTRACT(YEAR FROM PARSE_DATE('%Y-%m-%d', l."RPT_DATE")) as year,
          EXTRACT(MONTH FROM PARSE_DATE('%Y-%m-%d', l."RPT_DATE")) as month,
          SUM(CAST(p."PER_TOTAL" AS FLOAT64)) as total_payments,
          COUNT(DISTINCT p."EMPLR_NAML") as unique_employers
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.cvr_lobby_disclosure_cd\` l
        JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lpay_cd\` p
          ON l."FILING_ID" = p."FILING_ID"
        WHERE p."PER_TOTAL" IS NOT NULL
          AND PARSE_DATE('%Y-%m-%d', l."RPT_DATE") >= DATE_SUB(CURRENT_DATE(), INTERVAL ${months} MONTH)
        GROUP BY year, month
        ORDER BY year, month
      )
      SELECT * FROM monthly_payments
    `;

    return executeQueryWithCache(query, {}, { ttl: 1800000 }); // 30 minute cache
  },

  /**
   * Get top lobbyists by payments received
   */
  async getTopLobbyists(limit: number = 10) {
    const query = `
      SELECT
        l."FILER_NAML" as lobbyist_name,
        l."FIRM_NAME" as firm_name,
        SUM(CAST(p."PER_TOTAL" AS FLOAT64)) as total_payments,
        COUNT(DISTINCT p."EMPLR_NAML") as unique_employers,
        COUNT(*) as payment_count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.cvr_lobby_disclosure_cd\` l
      JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lpay_cd\` p
        ON l."FILING_ID" = p."FILING_ID"
      WHERE p."PER_TOTAL" IS NOT NULL
      GROUP BY l."FILER_NAML", l."FIRM_NAME"
      ORDER BY total_payments DESC
      LIMIT ${limit}
    `;

    return executeQueryWithCache(query, {}, { ttl: 3600000 }); // 1 hour cache
  },

  /**
   * Get association payments summary
   */
  async getAssociationPayments(limit: number = 10) {
    const query = `
      SELECT
        a."RECIP_NAML" as association_name,
        SUM(CAST(a."AMOUNT" AS FLOAT64)) as total_amount,
        COUNT(*) as payment_count,
        COUNT(DISTINCT l."FILER_NAML") as unique_filers
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.latt_cd\` a
      JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.cvr_lobby_disclosure_cd\` l
        ON a."FILING_ID" = l."FILING_ID"
      WHERE a."AMOUNT" IS NOT NULL
      GROUP BY a."RECIP_NAML"
      ORDER BY total_amount DESC
      LIMIT ${limit}
    `;

    return executeQueryWithCache(query, {}, { ttl: 3600000 }); // 1 hour cache
  }
};