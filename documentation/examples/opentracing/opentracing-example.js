/* eslint-disable */

const DataPoint = require("@data-point/core");
const DPModel = require("@data-point/core/model");
const DPIfThenElse = require("@data-point/core/ifThenElse");
const DPMap = require("@data-point/core/map");

const DPOpenTracing = require("@data-point/tracers/opentracing");
const initTracer = require("jaeger-client").initTracer;

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
        // return "yes foo!!";
        throw new Error("ohh");
      },
      else: input => `foo no! got ${input}`
    })
  ],

  catch(acc) {
    console.log(acc);
    return "its ok";
  },

  params: {
    ttl: "20h"
  }
});

async function main() {
  const datapoint = DataPoint();

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

  const config = {
    serviceName: "data-point-test",
    reporter: {
      logSpans: true,
      agentHost: "localhost",
      agentPort: 6832
    },
    sampler: {
      type: "probabilistic",
      param: 1.0
    }
  };

  const options = {
    tags: {
      "data-point-test.version": "1.1.2"
    }
  };

  const openTracer = initTracer(config, options);

  const tracer = DPOpenTracing(openTracer);

  result = await datapoint.resolve(input, DPMap(myModel), {
    tracer
  });

  openTracer.close();
}

main();
