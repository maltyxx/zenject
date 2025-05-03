[**Zenject - Lightweight DI Framework v0.1.0**](../README.md)

***

[Zenject - Lightweight DI Framework](../globals.md) / AppContainer

# Variable: AppContainer

> `const` **AppContainer**: `DependencyContainer` = `container`

Defined in: container.ts:19

Centralized DI container used across all Zenject modules and apps.

## Exports

AppContainer

## Example

```ts
// Register a service
AppContainer.register(MyService, { useClass: MyServiceImpl });

// Resolve a service
const service = AppContainer.resolve(MyService);
```
