---
id: path-reducer
title: PathReducer
sidebar_label: PathReducer
---

A path reducer is a `string` that extracts a path from the current [accumulator.value](api/accumulator.md).

## Syntax

```js
"$[<path>]":String;
```

## Options

| Option   | Description                                                    |
| :------- | :------------------------------------------------------------- |
| _\$_     | Reference to current `accumulator.value`.                      |
| _\$path_ | Object path notation to extract data from `accumulator.value`. |

## Example

Access the reference of the `accumulator.value`.

```js
const input = {
  a: {
    b: ["Hello World"]
  }
};

const output = await dataPoint.resolve(input, "$a.b[0]");
assert.strictEqual(output, "Hello World");
```
