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
   * Creates a new InjectionToken.
   * @param description A human-readable description for debugging
   */
  constructor(public readonly description: string) {}

  /**
   * Returns a string representation of this token for debugging.
   */
  public toString(): string {
    return `InjectionToken[${this.description}]`;
  }
} 