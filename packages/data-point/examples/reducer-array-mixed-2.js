/* eslint-disable no-console */
const assert = require("assert");

const dataPoint = require("../").create();

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
};

const multiplyBy = factor => value => {
  return value * factor;
};

const getMax = () => value => {
  const result = Math.max.apply(null, value);
  return result;
};

dataPoint.resolve(["$a.b.c", getMax(), multiplyBy(10)], input).then(output => {
  assert.strictEqual(output, 30);
  console.log(output);
});
