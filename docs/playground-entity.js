/* eslint-disable */

const DataPoint = require("@data-point/core");
const DPReducerEntity = require("@data-point/core/ReducerEntity").ReducerEntity;
const createReducer = require("@data-point/core/create-reducer").createReducer;
const DPTracer = require("@data-point/tracer");

const fs = require("fs");

class Request extends DPReducerEntity {
  constructor(spec) {
    super("request", spec);
    this.url = createReducer(spec.url);
  }

  static create(spec) {
    return new Request(spec);
  }

  async resolve(acc, resolveReducer) {
    const url = await resolveReducer(acc, this.url);
    return url;
  }
}

const myRequest = Request.create({
  name: "myModel",

  uid: acc => acc.reducer.id,

  url: () => "http://hello.world.com",

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

  const input = [];

  // const tracer = new DPTracer();

  // const span = tracer.startSpan("data-point-request");

  console.time("dp1");
  result = await datapoint.resolve({}, myRequest, {
    // tracer: span
  });
  console.timeEnd("dp1");

  console.time("dp2");
  result = await datapoint.resolve({}, myRequest, {
    // tracer: span
  });
  console.timeEnd("dp2");

  // span.finish();

  // console.time("dp2");
  // result = await datapoint.resolve(input, DPMap(myModel), {
  //   // tracer: span
  // });
  // console.timeEnd("dp2");

  // span2.finish();

  // fs.writeFileSync(
  //   "/Users/pacheca/Downloads/tracing.json",
  //   JSON.stringify(tracer.report("chrome-tracing"))
  // );

  // console.log(tracer.report("chrome-tracing"));
  console.log(store);
  console.log(result);
}

main();
