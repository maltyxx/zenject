import { injectable } from "@zenject/core";
import { InjectLogger, type Logger } from "@zenject/logger";

@injectable()
export class AppService {
  @InjectLogger() private readonly logger!: Logger;

  public helloWorld(): void {
    this.logger.info("Hello, world!");
  }
}
