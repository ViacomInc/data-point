---
id: map-reducer
title: MapReducer
sidebar_label: MapReducer
---

```js
const { map } = require("data-point");
```

The **map** reducer creates a new array with the results of applying the provided [Reducer](../reducer-types) to every element in the input array.

## Syntax

```js
map(reducer:Reducer):Array
```

## Arguments

| Argument  | Type                        | Description                                                |
| :-------- | :-------------------------- | :--------------------------------------------------------- |
| _reducer_ | [Reducer](../reducer-types) | The reducer will get applied to each element in the array. |

## Example: apply reducer to array entries

Get path `a` then multiply by 2.

```js
const input = {
  a: "foo"
};

const input = [
  {
    a: 1
  },
  {
    a: 2
  }
];

const output = await dataPoint.resolve(input, map(["$a", input => input * 2]));

assert.deepStrictEqual(output, [2, 4]);
```
