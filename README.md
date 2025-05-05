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

## 📥 Contributing

Contributions are welcome!
Feel free to [open an issue](https://github.com/maltyxx/zenject/issues) or a [pull request](https://github.com/maltyxx/zenject/pulls).

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/maltyxx/zenject/blob/main/LICENSE).
