import type { Constructor } from "./constructor.type";
import type { Provider } from "./provider.interface";

/**
 * Interface representing a dynamically configured module.
 * Used for runtime configuration of modules via methods like forRoot() or forFeature().
 *
 * @interface DynamicModule
 * @property {Constructor} module - The module class this configuration applies to
 * @property {Constructor[]} [imports] - Optional list of modules to import
 * @property {Provider[]} [providers] - Optional list of providers to register
 * @property {any} [exports] - Optional list of providers to export from this module
 *
 * @example
 * // Creating a dynamic module configuration
 * const dynamicModule: DynamicModule = {
 *   module: ConfigModule,
 *   providers: [
 *     { provide: 'CONFIG_OPTIONS', useValue: { apiKey: '123' } }
 *   ]
 * };
 */
export interface DynamicModule {
  /** The module class this configuration belongs to */
  module: Constructor;
  /** Optional list of modules to import */
  imports?: Constructor[];
  /** Optional providers to register */
  providers?: Provider[];
  /** Optional providers to export (make available to importing modules) */
  exports?: Provider[];
}
