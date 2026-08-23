import { config } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };
  }

  private output(entry: LogEntry): void {
    const logLine = JSON.stringify(entry);
    
    if (config.nodeEnv === 'production') {
      console.log(logLine);
    } else {
      const colors = {
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
      };
      const color = colors[entry.level] || colors.reset;
      console.log(`${color}[${entry.level.toUpperCase()}]${colors.reset} ${entry.message}`, entry.meta || '');
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (config.nodeEnv !== 'production') {
      this.output(this.formatEntry('debug', message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.output(this.formatEntry('info', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.output(this.formatEntry('warn', message, meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.output(this.formatEntry('error', message, meta));
  }
}

export const logger = new Logger();