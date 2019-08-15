/* eslint-disable */

const DataPoint = require("@data-point/core");
const DPModel = require("@data-point/core/model");
const DPIfThenElse = require("@data-point/core/ifThenElse");
const DPMap = require("@data-point/core/map");
const DPTracer = require("@data-point/tracer");

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
        // throw new Error("ohh");
        return "foo yes!";
      },
      else: input => `foo no! got ${input}`
    })
  ],

  catch: error => {
    console.log(error); // eslint-disable-line
    return "failed";
  },

  params: {
    ttl: "20h"
  }
});

async function main() {
  const datapoint = DataPoint();

  // making the linter happy while I test this
  let result = null;

  const store = new Map();

  datapoint.cache.get = acc => {
    return store.get(acc.uid);
  };

  datapoint.cache.set = acc => {
    return store.set(acc.uid, acc.value);
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

  const tracer = new DPTracer();

  const span = tracer.startSpan("data-point-request");

  console.time("dp1");
  result = await datapoint.resolve(input, DPMap(myModel), {
    // tracer: span
  });
  console.timeEnd("dp1");

  span.finish();

  console.time("dp2");
  result = await datapoint.resolve(input, DPMap(myModel), {
    // tracer: span
  });
  console.timeEnd("dp2");

  // span2.finish();

  // fs.writeFileSync(
  //   "/Users/pacheca/Downloads/tracing.json",
  //   JSON.stringify(tracer.report("chrome-tracing"))
  // );

  console.log(tracer.report("chrome-tracing"));
  console.log(store);
  console.log(result);
}

main();
