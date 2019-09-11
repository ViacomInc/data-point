/* eslint-disable */

const path = require("path");

const DataPoint = require("@data-point/core");
const DPModel = require("@data-point/core/model");
const DPIfThenElse = require("@data-point/core/ifThenElse");
const DPMap = require("@data-point/core/map");

const DPMermaidTracer = require("@data-point/tracers/mermaid");

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
    return "its all ok";
  }
});

async function main() {
  const datapoint = DataPoint();

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

  // save to disk
  tracer.report(path.join(__dirname, "datapoint-trace-example.mermaid"));
}

main();
