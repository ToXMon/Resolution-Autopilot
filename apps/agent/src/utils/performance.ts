/**
 * Performance Monitoring Utility
 * 
 * Tracks response times, LLM call durations, and system metrics
 * Ensures agent responds in < 2 seconds
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceStats {
  count: number
  total: number
  average: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private activeTimers: Map<string, number> = new Map()
  private readonly MAX_METRICS_PER_KEY = 1000 // Keep last 1000 metrics

  /**
   * Start timing an operation
   */
  start(name: string): void {
    this.activeTimers.set(name, performance.now())
  }

  /**
   * End timing an operation and record metric
   */
  end(name: string, metadata?: Record<string, any>): number {
    const startTime = this.activeTimers.get(name)
    
    if (!startTime) {
      console.warn(`⚠️  No start time found for metric: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.activeTimers.delete(name)

    // Record metric
    this.record(name, duration, metadata)

    return duration
  }

  /**
   * Record a metric
   */
  record(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metrics = this.metrics.get(name)!
    metrics.push(duration)

    // Keep only last MAX_METRICS_PER_KEY entries
    if (metrics.length > this.MAX_METRICS_PER_KEY) {
      metrics.shift()
    }

    // Log slow operations
    if (name.includes('agent') && duration > 2000) {
      console.warn(`⚠️  Slow agent response: ${duration.toFixed(2)}ms (target: < 2000ms)`)
    }

    if (name.includes('llm') && duration > 1500) {
      console.warn(`⚠️  Slow LLM call: ${duration.toFixed(2)}ms`)
    }

    if (metadata) {
      console.log(`📊 [${name}] ${duration.toFixed(2)}ms`, metadata)
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name)
    
    if (!metrics || metrics.length === 0) {
      return null
    }

    const sorted = [...metrics].sort((a, b) => a - b)
    const count = sorted.length
    const total = sorted.reduce((sum, val) => sum + val, 0)
    const average = total / count

    // Helper function for proper percentile calculation
    const percentile = (p: number): number => {
      if (count === 1) return sorted[0]
      
      const index = (p / 100) * (count - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower
      
      // Linear interpolation between values
      return sorted[lower] * (1 - weight) + sorted[upper] * weight
    }

    return {
      count,
      total,
      average,
      min: sorted[0],
      max: sorted[count - 1],
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    }
  }

  /**
   * Get all statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {}

    for (const [name, _metrics] of this.metrics.entries()) {
      const stat = this.getStats(name)
      if (stat) {
        stats[name] = stat
      }
    }

    return stats
  }

  /**
   * Check if performance targets are met
   */
  checkTargets(): {
    agentResponseTime: { target: number; actual: number; passing: boolean }
    llmCallTime: { target: number; actual: number; passing: boolean }
  } {
    const agentStats = this.getStats('agent_response')
    const llmStats = this.getStats('llm_call')

    return {
      agentResponseTime: {
        target: 2000,
        actual: agentStats?.p95 || 0,
        passing: (agentStats?.p95 || 0) < 2000,
      },
      llmCallTime: {
        target: 1500,
        actual: llmStats?.p95 || 0,
        passing: (llmStats?.p95 || 0) < 1500,
      },
    }
  }

  /**
   * Print performance report
   */
  printReport(): void {
    console.log('\n📊 Performance Report\n')
    console.log('─'.repeat(80))

    const allStats = this.getAllStats()

    for (const [name, stats] of Object.entries(allStats)) {
      console.log(`\n${name}:`)
      console.log(`  Count:    ${stats.count}`)
      console.log(`  Average:  ${stats.average.toFixed(2)}ms`)
      console.log(`  Min:      ${stats.min.toFixed(2)}ms`)
      console.log(`  Max:      ${stats.max.toFixed(2)}ms`)
      console.log(`  P50:      ${stats.p50.toFixed(2)}ms`)
      console.log(`  P95:      ${stats.p95.toFixed(2)}ms`)
      console.log(`  P99:      ${stats.p99.toFixed(2)}ms`)
    }

    console.log('\n' + '─'.repeat(80))

    const targets = this.checkTargets()
    
    console.log('\nPerformance Targets:')
    console.log(`  Agent Response (P95): ${targets.agentResponseTime.actual.toFixed(2)}ms / ${targets.agentResponseTime.target}ms ${targets.agentResponseTime.passing ? '✅' : '❌'}`)
    console.log(`  LLM Call (P95):       ${targets.llmCallTime.actual.toFixed(2)}ms / ${targets.llmCallTime.target}ms ${targets.llmCallTime.passing ? '✅' : '❌'}`)
    
    console.log('\n')
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear()
    this.activeTimers.clear()
    console.log('✅ Performance metrics reset')
  }

  /**
   * Clear metrics for a specific name
   */
  clear(name: string): void {
    this.metrics.delete(name)
    this.activeTimers.delete(name)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(metricName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.start(metricName)
      
      try {
        const result = await originalMethod.apply(this, args)
        performanceMonitor.end(metricName)
        return result
      } catch (error) {
        performanceMonitor.end(metricName, { error: true })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Utility function to measure async operations
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.start(name)
  
  try {
    const result = await operation()
    performanceMonitor.end(name, metadata)
    return result
  } catch (error) {
    performanceMonitor.end(name, { ...metadata, error: true })
    throw error
  }
}

/**
 * Utility function to measure sync operations
 */
export function measure<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.start(name)
  
  try {
    const result = operation()
    performanceMonitor.end(name, metadata)
    return result
  } catch (error) {
    performanceMonitor.end(name, { ...metadata, error: true })
    throw error
  }
}

export default performanceMonitor
