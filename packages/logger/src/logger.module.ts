import { type LoggerOptions, pino } from "pino";
import { Module } from "@zenject/core";
import { LOGGER_CONFIG_TOKEN, LOGGER_LOGGER_TOKEN } from "./constants";
import { loggerConfig } from "./logger.config";

@Module({
  providers: [
    {
      provide: LOGGER_CONFIG_TOKEN,
      useValue: loggerConfig,
    },
    {
      provide: LOGGER_LOGGER_TOKEN,
      useFactory: (config: LoggerOptions) => {
        return pino(config);
      },
      deps: [LOGGER_CONFIG_TOKEN],
    },
  ],
})
export class LoggerModule {}
