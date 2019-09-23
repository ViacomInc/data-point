// eslint-disable-next-line import/no-extraneous-dependencies
const DataPoint = require("data-point");

const mocks = require("./async-example.mocks");

// mock request calls
mocks();

const { Model, Request } = DataPoint;

const PersonRequest = Request("PersonRequest", {
  url: "https://swapi.co/api/people/{value}/"
});

const PersonModel = Model("PersonModel", {
  value: {
    name: "$name",
    birthYear: "$birth_year"
  }
});

const options = {
  trace: false // <-- set to true to enable tracing, a file will be created
};

const dataPoint = DataPoint.create();

dataPoint.transform([PersonRequest, PersonModel], 1, options).then(() => {
  /*
    a file with the name data-point-trace-<timestamp>.json will
    be created.

    File follows the structure of:

    {
      "id": "1",
      "reducer": {
        "type": "ReducerList",
        "reducers": [...]
      },
      "hrtime": [
        405103,
        401185279
      ],
      "timeStartNs": 405103401185279,
      "durationNs": 1270129916,
      "durationMs": 1.270129916,
      "timelineStartNs": 0,
      "timelineStartMs": 0,
      "nestingLevel": 0,
      "label": "ReducerList:1",
      "children": [
        {
          "id": "2",
          "reducer": { }
          "hrtime": [
            405155,
            401185299
          ],
          "timeStartNs": 405103401185279,
          "durationNs": 1270129916,
          "durationMs": 1.270129916,
          "timelineStartNs": 0,
          "timelineStartMs": 0,
          "nestingLevel": 0,
          "label": "ReducerList:1",
          "children": [
              .....
  */
});
