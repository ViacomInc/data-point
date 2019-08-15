---
id: assign-reducer
title: AssignReducer
sidebar_label: AssignReducer
---

```js
const { assign } = require("data-point");
```

The **assign** reducer creates a new Object by resolving the provided [Reducer](../reducer-types) and merging the result with the current accumulator value. It uses [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) internally.

## Syntax

```js
assign(reducer:Reducer):Object
```

## Arguments

| Argument  | Type                        | Description                                                                                                                        |
| :-------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| _reducer_ | [Reducer](../reducer-types) | Result from this reducer will be merged into the current `accumulator.value`. By convention, this reducer should return an Object. |

## Example: Add keys using an ObjectReducer

Add a key that references a nested value from the accumulator.

```js
const input = {
  a: "foo"
};

const output = await DataPoint().resolve(
  input,
  assign({
    b: ["$a", value => `${value}-1`],
    c: ["$a", value => `${value}-2`]
  })
);

assert.deepStrictEqual(output, {
  a: "foo",
  b: "foo1",
  c: "foo2"
});
```

## Example: Add keys using a FunctionReducer

```js
const { DataPoint, assign } = require("data-point");

const input = {
  a: "foo"
};

const output = await DataPoint().resolve(
  input,
  assign(input => {
    return {
      b: `${input.a}1`,
      c: `${input.a}2`
    };
  })
);

assert.deepStrictEqual(output, {
  a: "foo",
  b: "foo1",
  c: "foo2"
});
```
