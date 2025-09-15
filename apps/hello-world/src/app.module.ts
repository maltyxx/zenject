import { ConfigModule } from "@zenject/config";
import { Module } from "@zenject/core";
import { LoggerModule } from "@zenject/logger";
import { appConfig } from "./app.config";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    LoggerModule,
  ],
  providers: [AppService],
})
export class AppModule {}
