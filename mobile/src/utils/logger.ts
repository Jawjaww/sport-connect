export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel = 'debug';

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch(level) {
      case 'debug':
        console.log(logMessage, context);
        break;
      case 'info':
        console.info(logMessage, context);
        break;
      case 'warn':
        console.warn(logMessage, context);
        break;
      case 'error':
        console.error(logMessage, context);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
