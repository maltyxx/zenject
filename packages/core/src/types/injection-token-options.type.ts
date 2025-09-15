import type { Scope } from "./scope.enum.js";

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
