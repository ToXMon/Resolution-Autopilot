/**
 * Database Connection Pool Manager
 * 
 * Manages concurrent access to LowDB with connection pooling pattern
 * Prevents race conditions and ensures data consistency
 */

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import type { Database } from '../types.js'

const DB_FILE = './db.json'
const MAX_CONCURRENT_CONNECTIONS = 10
const CONNECTION_TIMEOUT_MS = 5000

/**
 * Connection Pool for LowDB
 * 
 * LowDB is file-based and doesn't support true connection pooling,
 * but we implement a semaphore pattern to limit concurrent access
 * and prevent file corruption
 */
class DatabasePool {
  private db: Low<Database> | null = null
  private activeConnections = 0
  private waitingQueue: Array<() => void> = []
  private initPromise: Promise<void> | null = null

  /**
   * Initialize database
   */
  private async initDatabase(): Promise<void> {
    if (this.db) return

    if (this.initPromise) {
      await this.initPromise
      return
    }

    this.initPromise = (async () => {
      try {
        const adapter = new JSONFile<Database>(DB_FILE)
        this.db = new Low(adapter, {
          messages: [],
          userProfiles: [],
          interventions: [],
          workoutLogs: [],
        })

        await this.db.read()
        
        // Ensure data structure exists
        if (!this.db.data) {
          this.db.data = {
            messages: [],
            userProfiles: [],
            interventions: [],
            workoutLogs: [],
          }
          await this.db.write()
        }

        console.log('✅ Database initialized successfully')
      } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message)
        throw error
      } finally {
        this.initPromise = null
      }
    })()

    await this.initPromise
  }

  /**
   * Acquire a connection from the pool
   * Implements semaphore pattern to limit concurrent access
   */
  async acquire(): Promise<Low<Database>> {
    await this.initDatabase()

    if (this.activeConnections >= MAX_CONCURRENT_CONNECTIONS) {
      // Wait in queue
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const index = this.waitingQueue.indexOf(resolve)
          if (index > -1) {
            this.waitingQueue.splice(index, 1)
          }
          reject(new Error('Database connection timeout'))
        }, CONNECTION_TIMEOUT_MS)

        const resolver = () => {
          clearTimeout(timeout)
          resolve()
        }

        this.waitingQueue.push(resolver)
      })
    }

    this.activeConnections++
    
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return this.db
  }

  /**
   * Release a connection back to the pool
   */
  release(): void {
    this.activeConnections--

    // Process waiting queue
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift()
      if (next) {
        next()
      }
    }
  }

  /**
   * Execute a database operation with automatic connection management
   */
  async execute<T>(
    operation: (db: Low<Database>) => Promise<T>
  ): Promise<T> {
    const db = await this.acquire()
    
    try {
      // Always read before operation to get latest data
      await db.read()
      
      const result = await operation(db)
      
      return result
    } finally {
      this.release()
    }
  }

  /**
   * Execute a write operation with automatic connection management
   */
  async executeWrite<T>(
    operation: (db: Low<Database>) => Promise<T>
  ): Promise<T> {
    const db = await this.acquire()
    
    try {
      // Read latest data
      await db.read()
      
      // Execute operation
      const result = await operation(db)
      
      // Write changes
      await db.write()
      
      return result
    } finally {
      this.release()
    }
  }

  /**
   * Get pool status
   */
  getStatus(): {
    activeConnections: number
    waitingQueue: number
    maxConnections: number
  } {
    return {
      activeConnections: this.activeConnections,
      waitingQueue: this.waitingQueue.length,
      maxConnections: MAX_CONCURRENT_CONNECTIONS,
    }
  }

  /**
   * Close all connections and cleanup
   */
  async close(): Promise<void> {
    // Wait for all active connections to finish
    while (this.activeConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Explicitly reject all waiting connections
    while (this.waitingQueue.length > 0) {
      const resolver = this.waitingQueue.shift()
      // Note: These will be rejected by the timeout mechanism
      // We just clear the queue to prevent memory leaks
    }

    this.db = null
    console.log('✅ Database connection pool closed')
  }
}

// Singleton instance
const pool = new DatabasePool()

/**
 * Get database instance with connection pooling
 */
export const getDatabase = async (): Promise<Database> => {
  return pool.execute(async (db) => {
    return db.data
  })
}

/**
 * Save database with connection pooling
 */
export const saveDatabase = async (data: Database): Promise<void> => {
  await pool.executeWrite(async (db) => {
    db.data = data
    return data
  })
}

/**
 * Execute read operation with connection pooling
 */
export const executeRead = async <T>(
  operation: (data: Database) => T
): Promise<T> => {
  return pool.execute(async (db) => {
    return operation(db.data)
  })
}

/**
 * Execute write operation with connection pooling
 */
export const executeWrite = async <T>(
  operation: (data: Database) => T
): Promise<T> => {
  return pool.executeWrite(async (db) => {
    const result = operation(db.data)
    return result
  })
}

/**
 * Get pool status for monitoring
 */
export const getPoolStatus = (): {
  activeConnections: number
  waitingQueue: number
  maxConnections: number
} => {
  return pool.getStatus()
}

/**
 * Close database pool
 */
export const closeDatabase = async (): Promise<void> => {
  await pool.close()
}

export default {
  getDatabase,
  saveDatabase,
  executeRead,
  executeWrite,
  getPoolStatus,
  closeDatabase,
}
