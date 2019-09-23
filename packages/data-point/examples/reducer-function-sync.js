/* eslint-disable no-console */
const assert = require("assert");
const dataPoint = require("../").create();

const reducer = input => {
  return `${input} World`;
};

dataPoint.resolve(reducer, "Hello").then(output => {
  console.log(output);
  assert.strictEqual(output, "Hello World");
});
