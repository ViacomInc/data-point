/* eslint-disable no-console */
const assert = require("assert");

const dataPoint = require("../").create();

const logError = error => {
  console.log(error.toString());
  throw error;
};

dataPoint.addEntities({
  "model:getArray": {
    value: "$a",
    outputType: "array",
    error: logError
  }
});

const input = {
  a: {
    b: "foo"
  }
};

dataPoint
  .resolve("model:getArray", input)
  .then(() => {
    // should not execute
    assert.ok(false);
  })
  .catch(error => {
    console.log(error.toString());
    // should execute
    assert.ok(true);
  });
