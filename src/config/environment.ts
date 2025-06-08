
interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiTimeout: number;
  profileTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  cacheStaleTime: number;
  cacheGcTime: number;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      apiTimeout: this.getNumberEnv('VITE_API_TIMEOUT', 5000), // Reduced from 10000ms
      profileTimeout: this.getNumberEnv('VITE_PROFILE_TIMEOUT', 3000), // New profile-specific timeout
      retryAttempts: this.getNumberEnv('VITE_RETRY_ATTEMPTS', 2),
      retryDelay: this.getNumberEnv('VITE_RETRY_DELAY', 1000),
      logLevel: this.getStringEnv('VITE_LOG_LEVEL', 'info') as any,
      enablePerformanceMonitoring: this.getBooleanEnv('VITE_ENABLE_PERFORMANCE_MONITORING', true),
      enableErrorTracking: this.getBooleanEnv('VITE_ENABLE_ERROR_TRACKING', true),
      cacheStaleTime: this.getNumberEnv('VITE_CACHE_STALE_TIME', 10 * 60 * 1000), // 10 minutes
      cacheGcTime: this.getNumberEnv('VITE_CACHE_GC_TIME', 20 * 60 * 1000), // 20 minutes
    };
  }

  private getStringEnv(key: string, defaultValue: string): string {
    return import.meta.env[key] || defaultValue;
  }

  private getNumberEnv(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  get isDevelopment() {
    return this.config.isDevelopment;
  }

  get isProduction() {
    return this.config.isProduction;
  }

  get apiTimeout() {
    return this.config.apiTimeout;
  }

  get profileTimeout() {
    return this.config.profileTimeout;
  }

  get retryAttempts() {
    return this.config.retryAttempts;
  }

  get retryDelay() {
    return this.config.retryDelay;
  }

  get logLevel() {
    return this.config.logLevel;
  }

  get enablePerformanceMonitoring() {
    return this.config.enablePerformanceMonitoring;
  }

  get enableErrorTracking() {
    return this.config.enableErrorTracking;
  }

  get cacheStaleTime() {
    return this.config.cacheStaleTime;
  }

  get cacheGcTime() {
    return this.config.cacheGcTime;
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }
}

export const environment = new EnvironmentService();
