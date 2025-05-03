# Zenject Architecture

This document describes the architecture and main features of the Zenject framework, a lightweight and performant dependency injection container for Bun.js applications.

## Core Concepts

### Container

The container is the central element of the framework. It stores dependencies and manages their resolution. We use `tsyringe` as a foundation and build our own abstractions on top of it.

```typescript
// Basic usage
import { AppContainer } from '@maltyxx/zenject';

// Register a service
AppContainer.register(UserService, { useClass: UserServiceImpl });

// Resolve a service
const userService = AppContainer.resolve(UserService);
```

### Decorators

Decorators are the most elegant way to use Zenject. They allow you to define modules and dependency providers declaratively.

```typescript
// Define a module
@Module({
  imports: [CommonModule],
  providers: [UserService, AuthService],
  exports: [UserService]
})
export class UserModule {}
```

### Lifecycle Hooks

Zenject provides lifecycle hooks that allow services to initialize resources and clean them up properly.

```typescript
@injectable()
export class DatabaseService implements OnInit, OnDestroy {
  async onInit(): Promise<void> {
    // Initialize connection
  }
  
  async onDestroy(): Promise<void> {
    // Close connection properly
  }
}
```

### Tokens

Tokens allow you to inject values that are not classes, such as configurations or primitives.

```typescript
// Define a token
export const API_URL = new InjectionToken<string>('API_URL');

// Provide a value
AppContainer.register(API_URL, { useValue: 'https://api.example.com' });

// Inject the value
@injectable()
export class ApiService {
  constructor(@inject(API_URL) private apiUrl: string) {}
}
```

### Dynamic Modules

Dynamic modules allow for runtime configuration, ideal for environment parameters.

```typescript
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        ConfigService
      ],
      exports: [ConfigService]
    };
  }
}

// Usage
@Module({
  imports: [ConfigModule.forRoot({ env: 'production' })]
})
export class AppModule {}
```

### Scopes

Scopes allow you to define different injection contexts.

```typescript
// Define a token with a scope
export const REQUEST_ID = new InjectionToken<string>({
  description: 'REQUEST_ID',
  scope: Scope.REQUEST
});

// Create a scope for an HTTP request
const requestScope = createScope();
requestScope.register(REQUEST_ID, { useValue: '123456' });
```

## Performance Optimizations

Zenject is designed to be highly performant:

1. **Lazy Loading**: Modules are only loaded when needed
2. **Tree-Shaking Optimization**: Flat ESM exports to allow efficient elimination of dead code
3. **Minimal Runtime Overhead**: No reflection or runtime metadata

## Plugin System

The plugin system allows for modular extension of Zenject:

```typescript
// Register a plugin
PluginManager.register('redis', () => import('./redis-module'));

// Load a plugin on demand
await PluginManager.load('redis');
```

## Testing Utilities

Testing utilities make it easy to create mocks:

```typescript
// Create a test container with mocks
const testContainer = createTestingContainer({
  LoggerService: mockLogger,
  DATABASE_URL: 'test:memory'
});

// Resolve a service from the test container
const userService = testContainer.resolve(UserService);
```

## Performance Benchmarks

Our benchmarks demonstrate Zenject's superior performance compared to other dependency injection frameworks.

To run the benchmarks:

```bash
bun run benchmark
``` 