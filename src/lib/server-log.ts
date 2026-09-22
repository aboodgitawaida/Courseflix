type LogContext = Record<string, string | number | boolean | null | undefined>;

function write(level: "error" | "warn", event: string, context: LogContext = {}) {
  const payload = JSON.stringify({
    level,
    event,
    ...context,
    at: new Date().toISOString(),
  });
  console[level](payload);
}

export const serverLog = {
  error: (event: string, context?: LogContext) => write("error", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
};
