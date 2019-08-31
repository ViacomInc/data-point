---
id: list-reducer
title: ListReducer
sidebar_label: ListReducer
---

A list reducer is an array of reducers where the result of each reducer becomes the input to the next reducer. The reducers are executed serially and **asynchronously**. It's possible for a list reducer to contain other list reducers.

## Syntax

```js
[Reducer1, Reducer2, ..., ReducerN]:Array
```

## Example: Various cases

| List Reducer Example                     | Description                                                                      |
| :--------------------------------------- | :------------------------------------------------------------------------------- |
| `['$a.b', (input) => { ... }]`           | Get path `a.b`, pipe value to function reducer                                   |
| `['$a.b', (input) => { ... }, FooModel]` | Get path `a.b`, pipe value to function reducer, pipe result to `FooModel` entity |

**IMPORTANT**: an empty list reducer will resolve to `undefined`. This mirrors the behavior of empty functions.

## Example: Empty list reducer

Demonstrate the result of an empty list

```js
const reducer = [];

const input = "INPUT";

const output = await dataPoint.resolve(input, []);

assert.strictEqual(undefined, output);
```
