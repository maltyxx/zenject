import { env } from "bun";
import type { LoggerOptions } from "pino";

export const loggerConfig: LoggerOptions = {
  level: env.LOG_LEVEL ?? "info",
  transport:
    env.LOG_FORMAT === "pretty"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
};
