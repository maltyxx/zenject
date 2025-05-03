[**Zenject - Lightweight DI Framework v0.1.0**](../README.md)

***

[Zenject - Lightweight DI Framework](../globals.md) / loadModule

# Function: loadModule()

> **loadModule**\<`T`\>(`module`): `void`

Defined in: decorators/module.ts:98

Loads and initializes a module.
This function triggers the initialization of the specified module
and all its imported dependencies recursively.

## Type Parameters

### T

`T`

Module type

## Parameters

### module

[`Constructor`](../type-aliases/Constructor.md)\<`T`\> & `ClassMetadata`

The module class to load

## Returns

`void`

## Example

```ts
// Manually loading a module
loadModule(AppModule);
```
