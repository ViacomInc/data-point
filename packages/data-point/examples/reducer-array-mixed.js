/* eslint-disable no-console */
const assert = require("assert");

const dataPoint = require("../").create();

const input = {
  a: {
    b: "Hello World"
  }
};

const toUpperCase = value => {
  return value.toUpperCase();
};

dataPoint.resolve(["$a.b", toUpperCase], input).then(output => {
  assert.strictEqual(output, "HELLO WORLD");
  console.log(output);
});
