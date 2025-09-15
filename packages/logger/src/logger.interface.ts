/**
 * Logger interface compatible with Pino API
 * Supports all Pino log levels and method signatures
 */
export interface Logger {
  /**
   * Write a 'trace' level log (most verbose)
   * Used for extremely detailed debugging information
   *
   * @example
   * ```typescript
   * logger.trace("Function entry");
   * logger.trace("User %s entered function %s", userId, functionName);
   * logger.trace({ userId, params }, "Function called");
   * ```
   */
  trace(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  trace(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  trace(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Write a 'debug' level log
   * Used for debugging information during development
   *
   * @example
   * ```typescript
   * logger.debug("Processing user data");
   * logger.debug("Processing user %s with %d items", userId, itemCount);
   * logger.debug({ userId, itemCount }, "Processing started");
   * ```
   */
  debug(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  debug(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  debug(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Write an 'info' level log
   * Used for general informational messages about application flow
   *
   * @example
   * ```typescript
   * logger.info("User authenticated successfully");
   * logger.info("User %s logged in at %s", userId, timestamp);
   * logger.info({ userId, sessionId }, "Authentication successful");
   * ```
   */
  info(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  info(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  info(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Write a 'warn' level log
   * Used for potentially harmful situations that don't stop execution
   *
   * @example
   * ```typescript
   * logger.warn("Memory usage is high");
   * logger.warn("Rate limit approaching: %d/%d requests", current, limit);
   * logger.warn({ memoryUsage, threshold }, "Memory threshold exceeded");
   * ```
   */
  warn(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  warn(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  warn(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Write an 'error' level log
   * Used for error events that allow the application to continue running
   *
   * @example
   * ```typescript
   * logger.error("Database connection failed");
   * logger.error("Failed to process order %s: %s", orderId, error.message);
   * logger.error({ orderId, error: error.message }, "Order processing failed");
   * logger.error(error); // Direct error logging
   * ```
   */
  error(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param error - Error instance or unknown value to log directly
   */
  error(error: Error | unknown): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  error(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  error(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Write a 'fatal' level log (most severe)
   * Used for very severe error events that will lead the application to abort
   *
   * ⚠️ **Warning**: Fatal logs always sync flush the destination for performance reasons.
   * Only use for final log messages before process crashes or exits.
   *
   * @example
   * ```typescript
   * logger.fatal("Application startup failed");
   * logger.fatal("Critical error in %s: %s", module, error.message);
   * logger.fatal({ error: error.stack }, "Application crash imminent");
   * logger.fatal(error); // Direct error logging
   * ```
   */
  fatal(message: string, ...interpolationValues: unknown[]): void;
  /**
   * @param error - Error instance or unknown value to log directly
   */
  fatal(error: Error | unknown): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   */
  fatal(mergingObject: object): void;
  /**
   * @param mergingObject - Object whose properties will be merged into the log record
   * @param message - The message to log
   * @param interpolationValues - Values for string interpolation (%s, %d, %j, etc.)
   */
  fatal(
    mergingObject: object,
    message: string,
    ...interpolationValues: unknown[]
  ): void;

  /**
   * Noop function that does nothing
   * Useful for conditional logging or testing scenarios
   *
   * @example
   * ```typescript
   * logger.silent(); // Does absolutely nothing
   * ```
   */
  silent(): void;

  /**
   * Create a child logger with specified context bindings
   *
   * Child loggers inherit the parent's configuration and output stream,
   * but add persistent key-value pairs to every log entry.
   * The child's log level can be set independently from the parent.
   *
   * @param bindings - Key-value pairs to attach to all logs from this child
   * @param options - Optional configuration for the child logger
   * @param options.level - Set a specific log level for this child logger
   * @returns A new Logger instance with the specified context
   *
   * @example
   * ```typescript
   * // Basic child logger
   * const childLogger = logger.child({ userId: "123", module: "auth" });
   * childLogger.info("User logged in"); // Will include userId and module in log
   *
   * // Child logger with custom level
   * const debugChild = logger.child({ component: "db" }, { level: "debug" });
   * debugChild.debug("SQL query executed"); // Only shows if debug level enabled
   * ```
   */
  child(
    bindings: Record<string, unknown>,
    options?: { level?: string },
  ): Logger;
}
