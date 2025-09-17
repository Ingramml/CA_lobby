/**
 * Frontend Logger Service
 * Sends logs to backend for centralized logging in Vercel dashboard
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  data?: any;
  timestamp: string;
  sessionId: string;
  userAgent: string;
  url: string;
}

class LoggerService {
  private sessionId: string;
  private logQueue: LogEntry[] = [];
  private isProcessing = false;
  private baseUrl: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.baseUrl = process.env.REACT_APP_API_URL || '';

    // Only send logs to server in production or when explicitly enabled
    const enableServerLogs = process.env.REACT_APP_ENABLE_SERVER_LOGS === 'true' || process.env.NODE_ENV === 'production';

    if (enableServerLogs) {
      // Send queued logs periodically
      setInterval(() => this.flushLogs(), 5000);

      // Send logs before page unload
      window.addEventListener('beforeunload', () => this.flushLogs());
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createLogEntry(level: LogLevel, message: string, component?: string, data?: any): LogEntry {
    return {
      level,
      message,
      component,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  debug(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, component, data);
    this.queueLog(entry);
    console.debug(`[${component || 'App'}] ${message}`, data);
  }

  info(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, component, data);
    this.queueLog(entry);
    console.info(`[${component || 'App'}] ${message}`, data);
  }

  warn(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, component, data);
    this.queueLog(entry);
    console.warn(`[${component || 'App'}] ${message}`, data);
  }

  error(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, component, data);
    this.queueLog(entry);
    console.error(`[${component || 'App'}] ${message}`, data);

    // Send errors immediately
    this.flushLogs();
  }

  private queueLog(entry: LogEntry) {
    this.logQueue.push(entry);

    // Send immediately if queue is getting large or it's an error
    if (this.logQueue.length >= 10 || entry.level === LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  private async flushLogs() {
    const enableServerLogs = process.env.REACT_APP_ENABLE_SERVER_LOGS === 'true' || process.env.NODE_ENV === 'production';

    if (!enableServerLogs || this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      const response = await fetch(`${this.baseUrl}/api/logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });

      if (!response.ok) {
        // If sending fails, put logs back in queue (but don't retry errors indefinitely)
        this.logQueue.unshift(...logs.slice(-5)); // Keep only last 5 failed logs
      }
    } catch (error) {
      // If network fails, put logs back in queue
      this.logQueue.unshift(...logs.slice(-5)); // Keep only last 5 failed logs
      console.warn('Failed to send logs to server:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

// Create singleton instance
export const logger = new LoggerService();

// Legacy console replacement for gradual migration
export const createLegacyLogger = (component: string) => ({
  log: (message: string, ...args: any[]) => logger.info(message, component, args.length > 0 ? args : undefined),
  info: (message: string, ...args: any[]) => logger.info(message, component, args.length > 0 ? args : undefined),
  warn: (message: string, ...args: any[]) => logger.warn(message, component, args.length > 0 ? args : undefined),
  error: (message: string, ...args: any[]) => logger.error(message, component, args.length > 0 ? args : undefined),
  debug: (message: string, ...args: any[]) => logger.debug(message, component, args.length > 0 ? args : undefined)
});