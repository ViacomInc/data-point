const assert = require("assert");

const dataPoint = require("../").create();

const input = {
  a: {
    b: {
      c: "Hello",
      d: " World!!"
    }
  }
};

dataPoint.addEntities({
  "hash:helloWorld": {
    value: "$a.b"
  }
});

dataPoint.resolve("hash:helloWorld", input).then(output => {
  assert.deepStrictEqual(output, {
    c: "Hello",
    d: " World!!"
  });
  // eslint-disable-next-line no-console
  console.log("result:", output);
  // result: { c: 'Hello', d: ' World!!' }
});
