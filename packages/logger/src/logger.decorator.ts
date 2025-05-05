import "reflect-metadata";
import { createInjectionDecorator } from "@zenject/core";
import { LOGGER_LOGGER_TOKEN } from "./constants";
import type { Logger } from "./logger.interface";

/**
 * Property decorator that injects a contextualized logger directly.
 * This returns a Pino Logger instance with the class name as context.
 * Caches logger instances to prevent multiple instantiations.
 *
 * @example
 * ```typescript
 * class MyService {
 *   @InjectLogger() private readonly logger!: Logger;
 *
 *   public doSomething(): void {
 *     this.logger.info('Method called'); // Will include class context
 *   }
 * }
 * ```
 *
 * @returns {PropertyDecorator} A property decorator function
 */
export function InjectLogger(): PropertyDecorator {
  return createInjectionDecorator<Logger>(
    LOGGER_LOGGER_TOKEN,
    (logger, _, context) => logger.child({ context }),
  );
}

