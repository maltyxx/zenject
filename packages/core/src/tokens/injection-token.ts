import { Scope } from "../types/scope.enum";

/**
 * Options for InjectionToken
 */
export interface InjectionTokenOptions {
  /**
   * The scope of the token
   * @default Scope.SINGLETON
   */
  scope?: Scope;

  /**
   * Description for debugging
   */
  description: string;
}

/**
 * A class that represents a token for dependency injection.
 * Use this for non-class dependencies or abstract concepts.
 *
 * @class InjectionToken
 * @template T The type of value this token represents
 *
 * @example
 * // Creating a new token
 * const API_URL = new InjectionToken<string>('API_URL');
 *
 * // Using the token in a service
 * @Injectable()
 * class ApiService {
 *   constructor(@Inject(API_URL) private apiUrl: string) {}
 * }
 *
 * // Providing a value for the token
 * AppContainer.register(API_URL, { useValue: 'https://api.example.com' });
 */
export class InjectionToken<T = unknown> {
  /**
   * The scope of this token
   */
  public readonly scope: Scope;

  /**
   * The human-readable description
   */
  public readonly description: string;

  /**
   * Creates a new InjectionToken.
   * @param descriptionOrOptions A human-readable description or options
   */
  public constructor(descriptionOrOptions: string | InjectionTokenOptions) {
    if (typeof descriptionOrOptions === "string") {
      this.description = descriptionOrOptions;
      this.scope = Scope.SINGLETON;
    } else {
      this.description = descriptionOrOptions.description;
      this.scope = descriptionOrOptions.scope || Scope.SINGLETON;
    }
  }

  /**
   * Returns a string representation of this token for debugging.
   */
  public toString(): string {
    return `InjectionToken[${this.description}]`;
  }
}
