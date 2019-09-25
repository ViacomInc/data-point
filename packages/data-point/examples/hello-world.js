/* eslint-disable no-console */
const DataPoint = require("../");

const dataPoint = DataPoint.create();

// Reducer function that appends
// 'World' to the value of the
// accumulator
const reducer = input => {
  return `${input} World`;
};

// applies reducer to input
dataPoint.resolve(reducer, "Hello").then(output => {
  // 'Hello World'
  console.log(output);
});
