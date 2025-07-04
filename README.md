# Zenject

*A lightweight, **CLI / backend framework** for Bun + TypeScript, designed for micro‑services, HTTP / WS servers, and ultra‑fast Lambda‑style cold starts.*

[![bun](https://img.shields.io/badge/bun-powered-blue)](https://bun.sh)
[![license](https://img.shields.io/github/license/maltyxx/zenject)](https://github.com/maltyxx/zenject/blob/main/LICENSE)

---

## ✨ Why Zenject?

| Feature                  | Description                                                                                  |
|--------------------------|----------------------------------------------------------------------------------------------|
| ⚡ **Blazing‑fast**       | Built on Bun + `tsyringe`, with zero reflection metadata.                                    |
| 🧩 **Module pattern**     | `@Module({ imports, providers, exports })` – clean and composable.                           |
| 🌀 **Lazy loading**       | Nothing is instantiated until `await app.bootstrap()` – ideal for **Lambda cold starts**.    |
| 🔁 **Lifecycle hooks**    | `onInit()` / `onDestroy()` (sync or async) for graceful start/stop.                          |
| 🧘 **Clean API**          | One object → `new Zenject(AppModule)`; one call → `await bootstrap()`.                       |
| 🚀 **CLI‑ready**          | Scaffold templates with `bunx @zenject/cli new:module/service/app`.                          |
| 🧩 **Microservice‑ready** | Each service or transport (HTTP, WS, cron, queue) is a module – monolith or distributed.     |
| 🚫 **No build step**      | Run `.ts` files directly in Bun – no transpilation required.                                 |

---

## 🚀 Quick Start

### 1. Install

```bash
# Install the core package
bun add @zenject/core

# Optional packages
bun add @zenject/logger # For logging functionality
bun add @zenject/testing # For testing utilities
bun add @zenject/cli # For CLI tools
````

### 2. Run Example

A minimal Hello World example is available in the repository:

📁 [`examples/hello-world`](https://github.com/maltyxx/zenject/tree/main/examples/hello-world)

```bash
cd examples/hello-world
bun run src/main.ts
# → Hello World 👋
```

### Logger configuration

The `@zenject/logger` package can be tuned via environment variables:

- `LOGGER_LEVEL` – sets the logging level (defaults to `info`)
- `LOGGER_FORMAT` – set to `pretty` for colored, human‑readable output.

---

### Example files

#### `hello.service.ts`

```ts
export class HelloService {
  public helloWorld(): string {
    return "Hello World 👋";
  }
}
```

#### `hello.module.ts`

```ts
import { Module } from "@zenject/core";
import { HelloService } from "./hello.service";

@Module({ providers: [HelloService] })
export class HelloModule {}
```

#### `main.ts`

```ts
import { Zenject } from "@zenject/core";
import { HelloModule } from "./hello.module";
import { HelloService } from "./hello.service";

const app = new Zenject(HelloModule);

app.bootstrap(() => {
  const service = app.resolve(HelloService);
  console.log(service.helloWorld());
});
```

---

## 🛠 Supported Architectures

| Use‑case              | How Zenject helps                                                             |
| --------------------- | ----------------------------------------------------------------------------- |
| **Monolith API**      | Combine HTTP, WebSocket, cron modules under one `AppModule`.                  |
| **Micro‑services**    | Package each bounded context as a module; reuse core modules like logger, DB. |
| **Serverless Lambda** | Lazy loading enables fast cold starts.                                        |
| **CLI tools**         | Share DI graph with runtime apps; built-in CLI scaffolder helps bootstrap.    |

---

## 🧪 Testing

```ts
import { createTestContext } from "@zenject/testing";

// Example test for a service with mocks
const { resolve } = await createTestContext({
  providers: [AppService],
  overrides: [{ provide: LOGGER_TOKEN, useValue: loggerMock }],
});

const appService = resolve(AppService);
// Now test the service with the mocked dependencies
```

More examples and test helpers are available in the testing package.

---

## 🧩 Dynamic Modules

Dynamic modules allow runtime configuration of providers and imports. A module can expose a
`forRoot()` method (or any factory) that returns a `DynamicModule` object. This object
describes the module class along with additional providers or sub-modules to load.

```ts
// config.module.ts
import { Module, type DynamicModule } from "@zenject/core";

@Module()
export class ConfigModule {
  static forRoot(options: Record<string, unknown>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: "CONFIG_OPTIONS", useValue: options }],
      exports: ["CONFIG_OPTIONS"],
    };
  }
}

// Loading at runtime
await loadModule(ConfigModule.forRoot({ env: "prod" }));
```

## 🔌 Plugin Manager

`PluginManager` offers lazy registration of optional features. Plugins are registered with a
name and a loader function, then loaded on demand:

```ts
PluginManager.register("redis", () => import("@zenject/redis"));
await PluginManager.load("redis"); // loaded once even if called multiple times
```

`isRegistered()` and `isLoaded()` help track the plugin state.

## 🚀 Example Application

Below is a minimal HTTP server illustrating a complete setup:

```ts
import { Module, loadModule, Zenject } from "@zenject/core";

@Module({ providers: [] })
class HttpModule {}

class HttpService {
  start() {
    return Bun.serve({
      port: 3000,
      fetch() {
        return new Response("Hello HTTP!");
      },
    });
  }
}

@Module({ providers: [HttpService] })
class AppModule {}

const app = new Zenject(AppModule);
await app.bootstrap(() => {
  const srv = app.resolve(HttpService).start();
  console.log("Listening on", srv.port);
});
```

## ⚙️ CLI & Project Structure

Install the CLI and scaffold new components with:

```bash
bun add -d @zenject/cli
bunx @zenject/cli new:app api
```

Typical workspace layout:

```
my-project/
  apps/
    api/
      src/
        api.module.ts
        main.ts
  packages/
    core-lib/
    logger/
```


## 📥 Contributing

Contributions are welcome!
Feel free to [open an issue](https://github.com/maltyxx/zenject/issues) or a [pull request](https://github.com/maltyxx/zenject/pulls).

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/maltyxx/zenject/blob/main/LICENSE).
