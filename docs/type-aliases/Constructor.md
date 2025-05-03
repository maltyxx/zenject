[**Zenject - Lightweight DI Framework v0.1.0**](../README.md)

***

[Zenject - Lightweight DI Framework](../globals.md) / Constructor

# Type Alias: Constructor()\<T\>

> **Constructor**\<`T`\> = (...`args`) => `T`

Defined in: types/constructor.type.ts:19

Represents a generic constructor type.

## Type Parameters

### T

`T` = `unknown`

The type of object created by the constructor

## Parameters

### args

...`unknown`[]

## Returns

`T`

## Example

```ts
// Using Constructor as a type parameter
function createInstance<T>(ctor: Constructor<T>): T {
  return new ctor();
}

// Using Constructor as a variable type
const userClass: Constructor<User> = User;
```
