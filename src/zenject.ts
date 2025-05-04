import type { DependencyContainer } from "tsyringe";
import { AppContainer } from "./container";
import { loadModule } from "./decorators/module";
import type { Constructor } from "./types/constructor.type";

export class Zenject {
  #ready = false;
  #root: Constructor;

  public constructor(root: Constructor) {
    this.#root = root;
  }

  /** Loads the DI graph then executes (optional) a post-boot callback */
  public async bootstrap(
    afterReady?: () => void | Promise<void>,
  ): Promise<void> {
    if (this.#ready) return;

    await loadModule(this.#root);
    this.#ready = true;

    if (afterReady) {
      await afterReady();
    }
  }

  /** Resolves a token when the app is ready */
  public resolve<T>(token: Constructor<T>): T {
    if (!this.#ready) {
      throw new Error("Zenject.bootstrap() must be awaited before resolve()");
    }
    return AppContainer.resolve(token);
  }

  /** Exposes (read-only) the central container */
  public get container(): DependencyContainer {
    if (!this.#ready) {
      throw new Error("Zenject not bootstrapped");
    }
    return AppContainer;
  }
}
