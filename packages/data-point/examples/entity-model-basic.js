const assert = require("assert");
const DataPoint = require("../");

const { Model } = DataPoint;

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
};

const getMax = value => {
  return Math.max.apply(null, value);
};

const multiplyBy = number => value => {
  return value * number;
};

const myModel = Model("myModel", {
  value: ["$a.b.c", getMax, multiplyBy(10)]
});

const dataPoint = DataPoint.create();
dataPoint.resolve(myModel, input).then(output => {
  assert.strictEqual(output, 30);
});
