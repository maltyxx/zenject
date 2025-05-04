import { injectable } from "@maltyxx/zenject";
import { InjectLogger, type Logger } from "./modules/logger";

@injectable()
export class AppService {
  @InjectLogger() private readonly logger!: Logger;

  public helloWorld(): void {
    this.logger.info("Hello, world!");
  }
}
