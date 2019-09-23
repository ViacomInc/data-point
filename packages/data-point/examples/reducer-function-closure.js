/* eslint-disable no-console */
const assert = require("assert");

const dataPoint = require("../").create();

const addStr = value => input => {
  return input + value;
};

dataPoint.resolve(addStr(" World!!"), "Hello").then(output => {
  assert.strictEqual(output, "Hello World!!");
  console.log(output);
});
