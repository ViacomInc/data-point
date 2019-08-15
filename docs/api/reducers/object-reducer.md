---
id: object-reducer
title: ObjectReducer
sidebar_label: ObjectReducer
---

This reducer is represented by a plain object where the value of each key is a [Reducer](../reducer-types).

Each of the reducers might contain more ObjectReducers (which might contain other reducers, and so on).

The input for every reducer on the Object is the same.

## Syntax

```js
{
  [key1]: Reducer,
  [key2]: Reducer,
  ...
  [keyN]: Reducer
}
```

## Example: create new object

Create new object based on an input:

```js
const input = {
  x: {
    y: {
      z: 2
    }
  }
};

const output = await dataPoint.resolve(input, {
  a: "$x.y",
  b: ["$x.y.z", value => value + 1]
});

assert.deepStrictEqual(output, {
  a: {
    z: 2
  },
  b: 3
});
```

## Example: nested ObjectReducers

Example using nested Object reducers:

```js
const input = {
  x: {
    y: {
      z: 2
    }
  }
};

const output = await dataPoint.resolve(input, {
  a: {
    c: "$x.y",
    b: ["$x.y.z", value => value + 1]
  }
});

assert.deepStrictEqual(output, {
  a: {
    c: 2,
    b: 3
  }
});
```
