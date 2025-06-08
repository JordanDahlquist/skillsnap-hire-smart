
interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      apiTimeout: this.getNumberEnv('VITE_API_TIMEOUT', 10000),
      retryAttempts: this.getNumberEnv('VITE_RETRY_ATTEMPTS', 2),
      retryDelay: this.getNumberEnv('VITE_RETRY_DELAY', 1000),
      logLevel: this.getStringEnv('VITE_LOG_LEVEL', 'info') as any,
      enablePerformanceMonitoring: this.getBooleanEnv('VITE_ENABLE_PERFORMANCE_MONITORING', true),
      enableErrorTracking: this.getBooleanEnv('VITE_ENABLE_ERROR_TRACKING', true),
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

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }
}

export const environment = new EnvironmentService();
