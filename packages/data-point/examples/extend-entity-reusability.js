const dataPoint = require("../").create();

dataPoint.addEntities({
  "hash:multiply": {
    mapKeys: {
      multiplyByFactor: "$multiplier | model:multiplyBy",
      multiplyBy20: "$multiplier | model:multiplyBy20"
    }
  },
  "model:multiplyBy": {
    value: (input, acc) => input * acc.params.multiplicand,
    params: {
      multiplicand: 1
    }
  },
  "model:multiplyBy20 -> model:multiplyBy": {
    // through the params property we can
    // parametrize the base entity
    params: {
      multiplicand: 20
    }
  }
});

dataPoint.resolve("hash:multiply", { multiplier: 5 }).then(output => {
  console.log(output);
  /*
  {
    multiplyByFactor: 5,
    multiplyBy20: 100
  }
  */
});
