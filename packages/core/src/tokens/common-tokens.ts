import { InjectionToken } from "./injection-token";

/**
 * Token for application name.
 * @type {InjectionToken<string>}
 */
export const APP_NAME = new InjectionToken<string>("APP_NAME");

/**
 * Token for application version.
 * @type {InjectionToken<string>}
 */
export const APP_VERSION = new InjectionToken<string>("APP_VERSION");

/**
 * Token for application environment (development, production, etc).
 * @type {InjectionToken<string>}
 */
export const APP_ENV = new InjectionToken<string>("APP_ENV");

/**
 * Token for application configuration object.
 * @type {InjectionToken<Record<string, unknown>>}
 */
export const APP_CONFIG = new InjectionToken<Record<string, unknown>>(
  "APP_CONFIG",
);

/**
 * Token for logger service.
 * @type {InjectionToken<unknown>}
 */
export const LOGGER = new InjectionToken<unknown>("LOGGER");
