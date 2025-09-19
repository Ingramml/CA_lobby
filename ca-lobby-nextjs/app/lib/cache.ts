/**
 * Comprehensive Caching Strategy for CA Lobby Next.js Application
 *
 * This module provides intelligent caching for BigQuery results, API responses,
 * and frequent data operations with multiple backend support and cache invalidation.
 */

import { kv } from '@vercel/kv'

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[] // Cache tags for grouped invalidation
  compress?: boolean // Whether to compress cached data
  version?: string // Cache version for invalidation
  serialize?: boolean // Whether to serialize complex objects
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  version: string
  compressed: boolean
  hits: number
}

export interface CacheStats {
  totalKeys: number
  memoryUsage: number
  hitRate: number
  missRate: number
  evictions: number
  errors: number
}

export interface CacheBackend {
  get<T = any>(key: string): Promise<T | null>
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>
  delete(key: string): Promise<boolean>
  clear(pattern?: string): Promise<number>
  exists(key: string): Promise<boolean>
  keys(pattern?: string): Promise<string[]>
  stats(): Promise<CacheStats>
}

/**
 * In-Memory Cache Backend (for development and small datasets)
 */
export class MemoryCacheBackend implements CacheBackend {
  private cache = new Map<string, CacheEntry>()
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    errors: 0
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key)

      if (!entry) {
        this.stats.misses++
        return null
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        this.stats.evictions++
        this.stats.misses++
        return null
      }

      entry.hits++
      this.stats.hits++

      // Decompress if needed
      let data = entry.data
      if (entry.compressed && typeof data === 'string') {
        data = JSON.parse(this.decompress(data))
      }

      return data as T

    } catch (error) {
      this.stats.errors++
      console.error('Memory cache get error:', error)
      return null
    }
  }

  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const {
        ttl = 3600000, // 1 hour default
        tags = [],
        compress = false,
        version = '1.0',
        serialize = true
      } = options

      let data = value
      if (serialize && typeof value === 'object') {
        data = JSON.stringify(value) as T
      }

      if (compress && typeof data === 'string') {
        data = this.compress(data) as T
      }

      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
        version,
        compressed: compress,
        hits: 0
      }

      this.cache.set(key, entry)

      // Clean up expired entries periodically
      if (this.cache.size % 100 === 0) {
        this.cleanup()
      }

    } catch (error) {
      this.stats.errors++
      console.error('Memory cache set error:', error)
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(pattern?: string): Promise<number> {
    if (!pattern) {
      const size = this.cache.size
      this.cache.clear()
      return size
    }

    const regex = new RegExp(pattern)
    let deleted = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys())

    if (!pattern) return allKeys

    const regex = new RegExp(pattern)
    return allKeys.filter(key => regex.test(key))
  }

  async stats(): Promise<CacheStats> {
    const totalKeys = this.cache.size
    const memoryUsage = JSON.stringify([...this.cache.values()]).length
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0

    return {
      totalKeys,
      memoryUsage,
      hitRate,
      missRate,
      evictions: this.stats.evictions,
      errors: this.stats.errors
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`)
    }
  }

  private compress(data: string): string {
    // Simple compression placeholder - in production use a real compression library
    return btoa(data)
  }

  private decompress(data: string): string {
    // Simple decompression placeholder
    return atob(data)
  }
}

/**
 * Vercel KV Cache Backend (for production)
 */
export class VercelKVCacheBackend implements CacheBackend {
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    errors: 0
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const entry = await kv.get<CacheEntry<T>>(key)

      if (!entry) {
        this.stats.misses++
        return null
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await kv.del(key)
        this.stats.evictions++
        this.stats.misses++
        return null
      }

      this.stats.hits++

      // Update hit count
      entry.hits++
      await kv.set(key, entry, { ex: Math.floor(entry.ttl / 1000) })

      return entry.data

    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache get error:', error)
      return null
    }
  }

  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const {
        ttl = 3600000, // 1 hour default
        tags = [],
        compress = false,
        version = '1.0'
      } = options

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        tags,
        version,
        compressed: compress,
        hits: 0
      }

      // Convert TTL to seconds for Vercel KV
      const expirationSeconds = Math.floor(ttl / 1000)
      await kv.set(key, entry, { ex: expirationSeconds })

      // Store tags for batch invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          const tagKey = `tag:${tag}`
          const taggedKeys = await kv.get<string[]>(tagKey) || []
          if (!taggedKeys.includes(key)) {
            taggedKeys.push(key)
            await kv.set(tagKey, taggedKeys, { ex: expirationSeconds })
          }
        }
      }

    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache set error:', error)
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await kv.del(key)
      return result > 0
    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache delete error:', error)
      return false
    }
  }

  async clear(pattern?: string): Promise<number> {
    try {
      if (!pattern) {
        // Clear all keys - dangerous operation
        const keys = await kv.keys('*')
        if (keys.length > 0) {
          await kv.del(...keys)
        }
        return keys.length
      }

      const keys = await kv.keys(pattern)
      if (keys.length > 0) {
        await kv.del(...keys)
      }
      return keys.length

    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache clear error:', error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await kv.exists(key)
      return result === 1
    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache exists error:', error)
      return false
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      return await kv.keys(pattern || '*')
    } catch (error) {
      this.stats.errors++
      console.error('Vercel KV cache keys error:', error)
      return []
    }
  }

  async stats(): Promise<CacheStats> {
    // Note: Vercel KV doesn't provide detailed stats, so we return our tracked stats
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0

    try {
      const keys = await kv.keys('*')
      return {
        totalKeys: keys.length,
        memoryUsage: 0, // Not available from Vercel KV
        hitRate,
        missRate,
        evictions: this.stats.evictions,
        errors: this.stats.errors
      }
    } catch (error) {
      return {
        totalKeys: 0,
        memoryUsage: 0,
        hitRate,
        missRate,
        evictions: this.stats.evictions,
        errors: this.stats.errors
      }
    }
  }
}

/**
 * Multi-tier Cache Manager
 */
export class CacheManager {
  private backends: Map<string, CacheBackend> = new Map()
  private defaultBackend: string

  constructor() {
    // Initialize backends
    this.backends.set('memory', new MemoryCacheBackend())

    // Use Vercel KV in production if available
    if (process.env.KV_URL) {
      this.backends.set('kv', new VercelKVCacheBackend())
      this.defaultBackend = 'kv'
    } else {
      this.defaultBackend = 'memory'
    }
  }

  /**
   * Get cached data with fallback to multiple backends
   */
  async get<T = any>(key: string, backend?: string): Promise<T | null> {
    const cacheBackend = this.backends.get(backend || this.defaultBackend)
    if (!cacheBackend) {
      throw new Error(`Cache backend '${backend}' not found`)
    }

    return cacheBackend.get<T>(key)
  }

  /**
   * Set cached data across multiple backends
   */
  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions & { backend?: string; replicate?: boolean } = {}
  ): Promise<void> {
    const { backend, replicate = false, ...cacheOptions } = options

    if (replicate) {
      // Replicate to all backends
      const promises = Array.from(this.backends.values()).map(b =>
        b.set(key, value, cacheOptions)
      )
      await Promise.allSettled(promises)
    } else {
      // Use specific backend or default
      const cacheBackend = this.backends.get(backend || this.defaultBackend)
      if (!cacheBackend) {
        throw new Error(`Cache backend '${backend}' not found`)
      }
      await cacheBackend.set(key, value, cacheOptions)
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string, backend?: string): Promise<boolean> {
    const cacheBackend = this.backends.get(backend || this.defaultBackend)
    if (!cacheBackend) {
      throw new Error(`Cache backend '${backend}' not found`)
    }

    return cacheBackend.delete(key)
  }

  /**
   * Clear cache by pattern
   */
  async clear(pattern?: string, backend?: string): Promise<number> {
    const cacheBackend = this.backends.get(backend || this.defaultBackend)
    if (!cacheBackend) {
      throw new Error(`Cache backend '${backend}' not found`)
    }

    return cacheBackend.clear(pattern)
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[], backend?: string): Promise<number> {
    const cacheBackend = this.backends.get(backend || this.defaultBackend)
    if (!cacheBackend) {
      throw new Error(`Cache backend '${backend}' not found`)
    }

    let invalidated = 0

    for (const tag of tags) {
      try {
        if (backend === 'kv' || this.defaultBackend === 'kv') {
          // For Vercel KV, get tagged keys and delete them
          const tagKey = `tag:${tag}`
          const taggedKeys = await (cacheBackend as VercelKVCacheBackend).get<string[]>(tagKey)

          if (taggedKeys && taggedKeys.length > 0) {
            for (const key of taggedKeys) {
              await cacheBackend.delete(key)
              invalidated++
            }
            await cacheBackend.delete(tagKey)
          }
        } else {
          // For memory cache, search by pattern
          const pattern = `.*${tag}.*`
          invalidated += await cacheBackend.clear(pattern)
        }
      } catch (error) {
        console.error(`Error invalidating tag ${tag}:`, error)
      }
    }

    return invalidated
  }

  /**
   * Get cache statistics
   */
  async getStats(backend?: string): Promise<CacheStats> {
    const cacheBackend = this.backends.get(backend || this.defaultBackend)
    if (!cacheBackend) {
      throw new Error(`Cache backend '${backend}' not found`)
    }

    return cacheBackend.stats()
  }

  /**
   * Get or set with cache-aside pattern
   */
  async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions & { backend?: string }
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options?.backend)
    if (cached !== null) {
      return cached
    }

    // Cache miss - fetch data
    const data = await fetcher()

    // Store in cache
    await this.set(key, data, options)

    return data
  }

  /**
   * Memoize function with caching
   */
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    options: {
      keyGenerator?: (...args: TArgs) => string
      ttl?: number
      tags?: string[]
      backend?: string
    } = {}
  ): (...args: TArgs) => Promise<TReturn> {
    const {
      keyGenerator = (...args) => `memoized:${JSON.stringify(args)}`,
      ttl = 3600000,
      tags = [],
      backend
    } = options

    return async (...args: TArgs): Promise<TReturn> => {
      const key = keyGenerator(...args)

      return this.getOrSet(
        key,
        () => fn(...args),
        { ttl, tags, backend }
      )
    }
  }
}

/**
 * CA Lobby specific cache utilities
 */
export class CALobbyCacheUtils {
  constructor(private cacheManager: CacheManager) {}

  /**
   * Cache BigQuery results with intelligent TTL based on data type
   */
  async cacheBigQueryResult<T = any>(
    query: string,
    data: T,
    options: {
      tableName?: string
      isAggregation?: boolean
      isRealtime?: boolean
    } = {}
  ): Promise<void> {
    const { tableName, isAggregation = false, isRealtime = false } = options

    // Generate cache key
    const queryHash = btoa(query).substring(0, 32)
    const key = `bigquery:${queryHash}`

    // Determine TTL based on data characteristics
    let ttl = 3600000 // 1 hour default

    if (isRealtime) {
      ttl = 300000 // 5 minutes for real-time data
    } else if (isAggregation) {
      ttl = 7200000 // 2 hours for aggregations
    } else if (tableName && tableName.includes('disclosure')) {
      ttl = 1800000 // 30 minutes for disclosure data
    }

    // Set cache tags
    const tags = ['bigquery']
    if (tableName) tags.push(`table:${tableName}`)
    if (isAggregation) tags.push('aggregation')

    await this.cacheManager.set(key, data, {
      ttl,
      tags,
      compress: true,
      version: '1.0'
    })
  }

  /**
   * Get cached BigQuery result
   */
  async getCachedBigQueryResult<T = any>(query: string): Promise<T | null> {
    const queryHash = btoa(query).substring(0, 32)
    const key = `bigquery:${queryHash}`

    return this.cacheManager.get<T>(key)
  }

  /**
   * Cache API response with request-based TTL
   */
  async cacheAPIResponse<T = any>(
    endpoint: string,
    params: Record<string, any>,
    data: T,
    ttl?: number
  ): Promise<void> {
    const paramsHash = btoa(JSON.stringify(params)).substring(0, 16)
    const key = `api:${endpoint}:${paramsHash}`

    // Default TTL based on endpoint type
    const defaultTTL = endpoint.includes('download') ? 1800000 : // 30 minutes for downloads
                       endpoint.includes('upload') ? 300000 :    // 5 minutes for uploads
                       endpoint.includes('query') ? 3600000 :    // 1 hour for queries
                       600000 // 10 minutes default

    await this.cacheManager.set(key, data, {
      ttl: ttl || defaultTTL,
      tags: ['api', `endpoint:${endpoint}`],
      compress: true
    })
  }

  /**
   * Get cached API response
   */
  async getCachedAPIResponse<T = any>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T | null> {
    const paramsHash = btoa(JSON.stringify(params)).substring(0, 16)
    const key = `api:${endpoint}:${paramsHash}`

    return this.cacheManager.get<T>(key)
  }

  /**
   * Invalidate caches for specific tables
   */
  async invalidateTableCaches(tableNames: string[]): Promise<number> {
    const tags = tableNames.map(name => `table:${name}`)
    return this.cacheManager.invalidateByTags(tags)
  }

  /**
   * Invalidate all BigQuery caches
   */
  async invalidateBigQueryCaches(): Promise<number> {
    return this.cacheManager.invalidateByTags(['bigquery'])
  }

  /**
   * Warm up cache for common queries
   */
  async warmupCache(commonQueries: Array<{ query: string; tableName: string }>): Promise<void> {
    console.log(`🔥 Warming up cache for ${commonQueries.length} common queries`)

    const promises = commonQueries.map(async ({ query, tableName }) => {
      try {
        // This would execute the query and cache the result
        // For now, we'll just set a placeholder
        const key = `bigquery:${btoa(query).substring(0, 32)}`
        await this.cacheManager.set(key, { warmed: true }, {
          ttl: 3600000,
          tags: ['bigquery', `table:${tableName}`]
        })
      } catch (error) {
        console.error(`Failed to warm up cache for query on ${tableName}:`, error)
      }
    })

    await Promise.allSettled(promises)
    console.log('🔥 Cache warmup completed')
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()
export const caLobbyCacheUtils = new CALobbyCacheUtils(cacheManager)

// Convenience functions
export async function getCachedData<T = any>(key: string): Promise<T | null> {
  return cacheManager.get<T>(key)
}

export async function setCachedData<T = any>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  return cacheManager.set(key, value, options)
}

export async function deleteCachedData(key: string): Promise<boolean> {
  return cacheManager.delete(key)
}

export async function clearCache(pattern?: string): Promise<number> {
  return cacheManager.clear(pattern)
}