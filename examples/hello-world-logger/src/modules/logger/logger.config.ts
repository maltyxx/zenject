import { env } from "bun";
import type { LoggerOptions } from "pino";

export const loggerConfig: LoggerOptions = {
  level: env.LOGGER_LEVEL ?? "info",
  transport:
    env.LOGGER_FORMAT === "pretty"
      ? {
          target: import.meta.resolve("pino-pretty"),
          options: {
            colorize: true,
            messageFormat: '[{context}] {msg}',
          },
        }
      : undefined,
};
