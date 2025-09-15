import type { ConfigType } from "@zenject/config";
import { Inject, Injectable } from "@zenject/core";
import { InjectLogger, type Logger } from "@zenject/logger";
import { appConfig } from "./app.config";

@Injectable()
export class AppService {
  @InjectLogger() private readonly logger!: Logger;

  public constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  public helloWorld(): void {
    this.logger.info(
      {
        config: this.config,
      },
      "Hello, world!",
    );
  }
}
