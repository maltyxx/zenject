import { createConfig } from "@zenject/config";
import { type LoggerOptions, pino } from "pino";
import { z } from "zod";

const loggerSchema = z.object({
  level: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  format: z.enum(["json", "pretty"]).default("json"),
  colorize: z.boolean().default(true),
  messageFormat: z.string().default("[{context}] {msg}"),
});

export const LoggerConfig = createConfig("logger", {
  schema: loggerSchema,
  description: "Configuration for the logging system",
  envOverrides: {
    level: "LOGGER_LEVEL",
    format: "LOGGER_FORMAT",
    colorize: ["COLOR", "LOGGER_COLORIZE"],
    messageFormat: "LOGGER_MESSAGE_FORMAT",
  },
  transform: (config: z.infer<typeof loggerSchema>): LoggerOptions => ({
    level: config.level,

    serializers: {
      ...pino.stdSerializers,
      error: pino.stdSerializers.err,
    },
    transport:
      config.format === "pretty"
        ? {
            target: "pino-pretty",
            options: {
              colorize: config.colorize,
              messageFormat: config.messageFormat,
            },
          }
        : undefined,
  }),
});

export type LoggerConfigType = LoggerOptions;
