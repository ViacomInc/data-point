---
id: function-reducer
title: FunctionReducer
sidebar_label: FunctionReducer
---

A function reducer allows you to use a function to apply a transformation. The returned value is used as the new value of the transformation.

## Syntax

```js
function reducerName(input: *, acc: Accumulator): Promise {
  return newValue;
}
```

## Arguments

| Argument | Type                              | Description                                                                                               |
| :------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| _input_  | `*`                               | Reference to `accumulator.value`.                                                                         |
| _acc_    | [Accumulator](api/accumulator.md) | Current reducer's accumulator Object. The main property is `value`, which is the current reducer's value. |

## Example

Function Reducer Example

```js
const reducer = (input, acc) => {
  // accepts a promise as a result for async operations
  return Promise.resolve(`${input} World`);
};

const result = await dataPoint.resolve("Hello", reducer);
assert.strictEqual(output, "Hello World");
```
