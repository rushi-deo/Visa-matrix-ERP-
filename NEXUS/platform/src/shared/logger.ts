export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogContext = Readonly<Record<string, unknown>>;

export type LogEntry = Readonly<{
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId: string | undefined;
  requestId: string | undefined;
  context: LogContext | undefined;
}>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;
}

export type LoggerTransport = (entry: LogEntry) => void;

const write = (level: LogLevel, message: string, context: LogContext | undefined, transport: LoggerTransport): void => {
  transport({
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: undefined,
    requestId: undefined,
    context,
  });
};

export const createConsoleLogger = (): Logger => ({
  debug: (message, context) => write('debug', message, context, (entry) => console.debug(entry)),
  info: (message, context) => write('info', message, context, (entry) => console.info(entry)),
  warn: (message, context) => write('warn', message, context, (entry) => console.warn(entry)),
  error: (message, context) => write('error', message, context, (entry) => console.error(entry)),
  fatal: (message, context) => write('fatal', message, context, (entry) => console.error(entry)),
});

export const createJsonLogger = (transport: LoggerTransport = (entry) => console.log(JSON.stringify(entry))): Logger => ({
  debug: (message, context) => write('debug', message, context, transport),
  info: (message, context) => write('info', message, context, transport),
  warn: (message, context) => write('warn', message, context, transport),
  error: (message, context) => write('error', message, context, transport),
  fatal: (message, context) => write('fatal', message, context, transport),
});

export const createLoggerFactory = (mode: 'console' | 'json' = 'json'): Logger =>
  mode === 'console' ? createConsoleLogger() : createJsonLogger();
