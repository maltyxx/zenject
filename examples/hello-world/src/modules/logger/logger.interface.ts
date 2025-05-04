export interface Logger {
  /**
   * Log an informational message
   * @param message - The primary message to log
   * @param args - Additional arguments to include in the log
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log an error message
   * @param message - The primary message to log
   * @param args - Additional arguments to include in the log
   */
  error(message: string, ...args: unknown[]): void;

  /**
   * Log a debug message
   * @param message - The primary message to log
   * @param args - Additional arguments to include in the log
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Create a child logger with the specified context bindings
   * @param bindings - Context data to attach to all logs from this child
   * @returns {Logger} A new logger instance with the specified context
   */
  child(bindings: Record<string, unknown>): Logger;
}
