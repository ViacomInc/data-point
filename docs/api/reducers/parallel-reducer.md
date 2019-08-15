---
id: parallel-reducer
title: ParallelReducer
sidebar_label: ParallelReducer
---

```js
const { parallel } = require("data-point");
```

This resolves an array of reducers. The output is a new array where each element is the output of a reducer;
this contrasts with list reducers, which return the output from the last reducer in the array.

## Syntax

```js
parallel(reducers:Array<Reducer>):Array
```

## Arguments

| Argument   | Type                                   | Description                                                    |
| :--------- | :------------------------------------- | :------------------------------------------------------------- |
| _reducers_ | `Array<`[Reducer](../reducer-types)`>` | Source data to create an array of [reducers](../reducer-types) |

## Example: resolve in parallel

Resolving an array of reducers in parallel.

```js
const reducer = parallel([
  "$a",
  ["$b", input => input + 2] // list reducer
]);

const input = {
  a: 1,
  b: 2
};

const output = await dataPoint.resolve(input, reducer);

assert.deepStrictEqual(output, [1, 4]);
```
