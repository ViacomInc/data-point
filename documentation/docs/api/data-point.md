---
id: data-point
title: DataPoint
sidebar_label: DataPoint
---

```js
const { DataPoint } = require("data-point");
```

Creates a new DataPoint instance.

**Syntax:**

```js
DataPoint();
```

**Returns:**

DataPoint instance.

**Example:**

```js
const dataPoint = DataPoint();
```

## dataPoint.resolve()

Execute a [Reducer](#reducers) against an input value.

**Syntax:**

```js
dataPoint.resolve(input:*, reducer:Reducer, [options:Object]):Promise(output:*)
```

This method returns a **Promise** with the final output value.

### Arguments

| Argument  | Type                 | Description                                                                                                               |
| :-------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| _input_   | `*`                  | Input value that you want to transform. If **none**, pass `null` or empty object `{}`.                                    |
| _reducer_ | [Reducer](#reducers) | Reducer that manipulates the input.                                                                                       |
| _options_ | `Object`             | \***optional** Options within the scope of the current transformation. More details available [here](#transform-options). |

**Example:**
