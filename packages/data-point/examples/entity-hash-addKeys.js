const assert = require("assert");

const dataPoint = require("../").create();

dataPoint.addEntities({
  "hash:addKeys": {
    addKeys: {
      nameLowerCase: ["$name", input => input.toLowerCase()],
      url: () => "https://github.com/ViacomInc/data-point"
    }
  }
});

const expectedResult = {
  name: "DataPoint",
  nameLowerCase: "datapoint",
  url: "https://github.com/ViacomInc/data-point"
};

const input = {
  name: "DataPoint"
};

dataPoint.resolve("hash:addKeys", input).then(output => {
  assert.deepStrictEqual(output, expectedResult);
  // eslint-disable-next-line no-console
  console.log(output);
});
