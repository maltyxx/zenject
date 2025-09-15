import type { FactoryProvider, Token } from "@zenject/core";
import { pino } from "pino";
import { LOGGER_TOKEN } from "./constants.js";
import { LoggerConfig, type LoggerConfigType } from "./logger.config.js";
import type { Logger } from "./logger.interface.js";

/**
 * Logger provider factory
 * Creates a Pino logger instance with configuration from LoggerConfig
 */
export const LoggerProvider: FactoryProvider<Logger> = {
  provide: LOGGER_TOKEN,
  useFactory: (...args: unknown[]) => {
    const config = args[0] as LoggerConfigType;
    return pino(config) as Logger;
  },
  deps: [LoggerConfig.KEY as unknown as Token<unknown>],
};
