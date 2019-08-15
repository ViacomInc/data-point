# DataPoint

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![codecov](https://codecov.io/gh/ViacomInc/data-point/branch/master/graph/badge.svg)](https://codecov.io/gh/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](https://github.com/ViacomInc/data-point#contributors)

> JavaScript Utility for collecting, processing and transforming data.

DataPoint helps you reason with and streamline your data processing layer. With it you can collect, process, and transform data from multiple sources, and deliver the output in a tailored format to your end consumer.

**Prerequisites**

Node v8 LTS or higher

**Installing**

```bash
npm install --save @data-point/core
```

Please visit data-point's [home page](http://data-point.github.com) ([http://data-point.github.com](http://data-point.github.com)) for detailed documentation.

### Hello World Example

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
