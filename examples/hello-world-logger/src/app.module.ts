import { Module } from "@maltyxx/zenject";
import { AppService } from "./app.service";
import { LoggerModule } from "./modules/logger/logger.module";

@Module({
  imports: [LoggerModule],
  providers: [AppService],
})
export class AppModule {}
