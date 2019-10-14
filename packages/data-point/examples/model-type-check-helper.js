/* eslint-disable no-console */
const assert = require("assert");
const DataPoint = require("../");

const dataPoint = DataPoint.create();

dataPoint.addEntities({
  "model:string": {
    value: "$name",
    outputType: "string"
  }
});

const input = {
  name: "DataPoint"
};

dataPoint.resolve("model:string", input).then(output => {
  assert.strictEqual(output, "DataPoint");
  console.log(output);
});
