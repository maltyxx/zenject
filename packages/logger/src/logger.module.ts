import { ConfigModule } from "@zenject/config";
import { Module } from "@zenject/core";
import { LoggerConfig } from "./logger.config.js";
import { LoggerProvider } from "./logger.provider.js";

@Module({
  imports: [ConfigModule.forFeature([LoggerConfig])],
  providers: [LoggerProvider],
  exports: [LoggerProvider],
})
export class LoggerModule {}
