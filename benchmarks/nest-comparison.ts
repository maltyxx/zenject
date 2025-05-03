/**
 * Benchmark comparing Zenject with NestJS DI
 *
 * This benchmark simulates the performance difference between
 * Zenject's DI system and NestJS's DI system (based on a simplified
 * implementation to avoid full dependency on NestJS).
 */

import { AppContainer } from "../src/container";
import { injectable } from "tsyringe";
import { Module, loadModule } from "../src/decorators/module";

// Configuration
const ITERATIONS = 10000;
const WARMUP_ITERATIONS = 1000;

// ----- Zenject Implementation -----

@injectable()
class ZenjectService {
  public getData(): string {
    return "Zenject data";
  }
}

@injectable()
class ZenjectController {
  public constructor(private service: ZenjectService) {}

  public getResult(): string {
    return `Controller using: ${this.service.getData()}`;
  }
}

@Module({
  providers: [ZenjectService, ZenjectController],
  exports: [ZenjectController],
})
class ZenjectModule {}

// ----- NestJS-like Implementation -----

// Simplified NestJS-like implementation
const nestProviders = new Map();
const nestModules = new Map();

function NestInject(token: any): ParameterDecorator {
  return (target: any, key: string | symbol, index: number) => {
    const params = Reflect.getMetadata("design:paramtypes", target) || [];
    params[index] = token;
    Reflect.defineMetadata("design:paramtypes", params, target);
  };
}

function NestInjectable(): ClassDecorator {
  return (target: any) => {
    const params = Reflect.getMetadata("design:paramtypes", target) || [];
    nestProviders.set(target, { target, params });
  };
}

function NestModule(options: {
  providers: any[];
  exports?: any[];
}): ClassDecorator {
  return (target: any) => {
    nestModules.set(target, options);
  };
}

function resolveNestDependency(token: any): any {
  if (!nestProviders.has(token)) {
    const provider = { target: token, params: [] };
    nestProviders.set(token, provider);
  }

  const provider = nestProviders.get(token);
  if (!provider.instance) {
    const params = provider.params.map((param: any) =>
      resolveNestDependency(param),
    );
    provider.instance = new provider.target(...params);
  }

  return provider.instance;
}

@NestInjectable()
class NestService {
  public getData(): string {
    return "Nest data";
  }
}

@NestInjectable()
class NestController {
  public constructor(private service: NestService) {}

  public getResult(): string {
    return `Controller using: ${this.service.getData()}`;
  }
}

@NestModule({
  providers: [NestService, NestController],
  exports: [NestController],
})
class NestModule {}

// ----- Benchmarking -----

async function runBenchmarks() {
  console.log("=".repeat(50));
  console.log("ZENJECT vs NESTJS DI BENCHMARK");
  console.log("=".repeat(50));

  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    AppContainer.resolve(ZenjectController);
    resolveNestDependency(NestController);
  }

  // Zenject benchmark
  console.log("\nRunning Zenject benchmark...");

  // Load module time
  const zenjectModuleLoadStart = Bun.nanoseconds();
  await loadModule(ZenjectModule);
  const zenjectModuleLoadTime =
    (Bun.nanoseconds() - zenjectModuleLoadStart) / 1_000_000; // ms

  const zenjectStart = Bun.nanoseconds();

  for (let i = 0; i < ITERATIONS; i++) {
    const controller = AppContainer.resolve(ZenjectController);
    controller.getResult();
  }

  const zenjectTime = (Bun.nanoseconds() - zenjectStart) / 1_000_000; // ms

  // NestJS-like benchmark
  console.log("Running NestJS-like benchmark...");

  const nestStart = Bun.nanoseconds();

  for (let i = 0; i < ITERATIONS; i++) {
    const controller = resolveNestDependency(NestController);
    controller.getResult();
  }

  const nestTime = (Bun.nanoseconds() - nestStart) / 1_000_000; // ms

  // Results
  console.log("\n=".repeat(50));
  console.log("BENCHMARK RESULTS");
  console.log("=".repeat(50));

  console.log(
    `\nZenject Module Load Time: ${zenjectModuleLoadTime.toFixed(2)} ms`,
  );
  console.log(
    `Zenject Resolution Time (${ITERATIONS} iterations): ${zenjectTime.toFixed(2)} ms`,
  );
  console.log(
    `Zenject Time per resolution: ${(zenjectTime / ITERATIONS).toFixed(6)} ms`,
  );

  console.log(
    `\nNestJS-like Resolution Time (${ITERATIONS} iterations): ${nestTime.toFixed(2)} ms`,
  );
  console.log(
    `NestJS-like Time per resolution: ${(nestTime / ITERATIONS).toFixed(6)} ms`,
  );

  const speedup = nestTime / zenjectTime;

  console.log(
    `\nZenject is approximately ${speedup.toFixed(2)}x faster than NestJS-like DI`,
  );
  console.log(`Performance improvement: ${((speedup - 1) * 100).toFixed(2)}%`);

  console.log("\n=".repeat(50));
  console.log(
    "Note: This is a simplified comparison and may not reflect the exact",
  );
  console.log("performance characteristics of the actual NestJS framework.");
  console.log("=".repeat(50));
}

// Run the benchmarks
runBenchmarks().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
