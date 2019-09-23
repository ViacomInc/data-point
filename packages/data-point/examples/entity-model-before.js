const assert = require("assert");
const dataPoint = require("../").create();

const toArray = input => {
  return Array.isArray(input) ? input : [input];
};

dataPoint.addEntities({
  "model:foo": {
    before: toArray,
    value: "$"
  }
});

dataPoint.resolve("model:foo", 100).then(output => {
  assert.deepStrictEqual(output, [100]);
});
