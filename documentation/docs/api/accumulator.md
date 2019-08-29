---
id: accumulator
title: Accumulator
sidebar_label: Accumulator
---

This object is passed to [reducers](reducer-types.md) and cache callbacks; it has contextual information about the current transformation being resolved.

Access to the accumulator object is made available through a [FunctionReducer](reducers/function-reducer).

The `accumulator.value` property is the current **input data** being passed to the reducer. This property should be treated as a **read-only immutable object** which will ensure that your reducers are [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976#.r4iqvt9f0) that produce no side effects.

**Properties exposed:**

| Key       | Type     | Description                                                                                                   |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| _value_   | `Object` | Value to be transformed.                                                                                      |
| _locals_  | `Object` | Value passed from the `options` _argument_ when executing [dataPoint.resolve()](data-point#datapointresolve). |
| _reducer_ | `Object` | Information relative to the current [Reducer](reducer-types.md) being executed.                               |
