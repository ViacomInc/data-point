---
id: version-6.x-canary-getting-started
title: Getting Started
sidebar_label: Getting Started
original_id: getting-started
---

**DataPoint is a JavaScript Utility for collecting, processing and transforming data.**

DataPoint helps you reason with and streamline your data processing layer. With it you can collect, process, and transform data from multiple sources, and deliver the output in a tailored format to your end consumer.

## Prerequisites

[Node](https://nodejs.org/) v8 LTS or higher

## Installing

> Using yarn >= 1.5

```bash
$ yarn add data-point
```

## Hello World Example

```js
const DataPoint = require("data-point/core");

// create DataPoint instance
const dataPoint = DataPoint();

// function reducer that concatenates
// accumulator.value with 'World'
const reducer = input => {
  return input + " World";
};

// applies reducer to input
const output = await dataPoint.resolve("Hello", reducer).then(output => {

// 'Hello World'
console.log(output);
```
