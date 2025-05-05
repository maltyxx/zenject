import { Module } from "@zenject/core";
import { LoggerModule } from "@zenject/logger";
import { AppService } from "./app.service";

@Module({
  imports: [LoggerModule],
  providers: [AppService],
})
export class AppModule {}
