import type { Constructor } from './constructor.type';
import type { Provider } from './provider.interface';

/**
 * Configuration options for a module decorator.
 * @interface ModuleOptions
 * @property {(Constructor | DynamicModule)[]} [imports] - List of modules to import
 * @property {Provider[]} [providers] - List of service providers to register
 * @property {Provider[]} [exports] - List of providers to export from this module
 * @example
 * // Creating module options
 * const options: ModuleOptions = {
 *   imports: [LoggingModule, ConfigModule],
 *   providers: [UserService, AuthService],
 *   exports: [UserService]
 * };
 * 
 * // Using with the Module decorator
 * @Module({
 *   imports: [CommonModule],
 *   providers: [
 *     UserService, 
 *     { provide: 'API_URL', useValue: 'https://api.example.com' }
 *   ],
 *   exports: [UserService]
 * })
 * export class AppModule {}
 */
export interface ModuleOptions {
  /** Modules to import */
  imports?: Constructor[];
  /** Service providers to register */
  providers?: Provider[];
  /** Providers to export (make available to importing modules) */
  exports?: Provider[];
} 