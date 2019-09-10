/* eslint-disable */

const DataPoint = require("@data-point/core");
const DPModel = require("@data-point/core/model");
const DPIfThenElse = require("@data-point/core/ifThenElse");
const DPMap = require("@data-point/core/map");
const DPMermaidTracer = require("@data-point/tracers/mermaid");

const fs = require("fs");

const myModel = DPModel({
  name: "myModel",

  uid: acc => `${acc.reducer.id}${acc.value.a.b}`,

  value: [
    "$a.b",
    input => input.toUpperCase(),
    DPIfThenElse({
      if: input => input === "FOO",
      then: () => {
        return "yes foo!!";
        // throw new Error("ohh");
      },
      else: input => `foo no! got ${input}`
    })
  ],

  params: {
    ttl: "20h"
  }
});

async function main() {
  const datapoint = DataPoint();

  // making the linter happy while I test this
  let result = null;

  const store = new Map();

  datapoint.cache.get = (uid, acc) => {
    return store.get(uid);
  };

  datapoint.cache.set = (uid, acc) => {
    return store.set(uid, acc.value);
  };

  const input = [
    {
      a: {
        b: "foo"
      }
    },
    {
      a: {
        b: "bar"
      }
    },
    {
      a: {
        b: "baz"
      }
    }
  ];

  const tracer = DPMermaidTracer();

  result = await datapoint.resolve(input, DPMap(myModel), {
    tracer
  });

  console.log(await tracer.report());
}

main();
