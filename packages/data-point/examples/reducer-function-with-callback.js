/* eslint-disable no-console */
const assert = require("assert");
const dataPoint = require("../").create();

const reducer = (input, acc, next) => {
  next(null, `${input} World`);
};

dataPoint.resolve(reducer, "Hello").then(output => {
  assert.strictEqual(output, "Hello World");
  console.log(output);
});
