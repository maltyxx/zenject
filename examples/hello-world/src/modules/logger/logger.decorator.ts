import { AppContainer } from "../../../../../src";
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
  return (target, key) => {
    const ctx = target.constructor.name;

    Object.defineProperty(target, key, {
      get() {
        if (!this.__loggerCache) {
          this.__loggerCache = {};
        }

        const cacheKey = String(key);
        if (!this.__loggerCache[cacheKey]) {
          const rootLogger = AppContainer.resolve<Logger>(LOGGER_LOGGER_TOKEN);
          this.__loggerCache[cacheKey] = rootLogger.child({ context: ctx });
        }

        return this.__loggerCache[cacheKey];
      },
      enumerable: false,
      configurable: false,
    });
  };
}
