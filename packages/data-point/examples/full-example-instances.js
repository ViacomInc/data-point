/* eslint-disable no-console */
const mocks = require("./async-example.mocks");
const DataPoint = require("../");

// create DataPoint instance
const dataPoint = DataPoint.create();

const { Request, Model, Schema, map } = DataPoint;

// schema to verify data input
const PlanetSchema = Schema("PlanetSchema", {
  schema: {
    type: "object",
    properties: {
      planetId: {
        $id: "/properties/planet",
        type: "integer"
      }
    }
  }
});

// remote service request
const PlanetRequest = Request("Planet", {
  // {value.planetId} injects the
  // value from the accumulator
  // creates: https://swapi.co/api/planets/1/
  url: "https://swapi.co/api/planets/{value.planetId}"
});

const ResidentRequest = Request("Resident", {
  // check input is string
  inputType: "string",
  url: "{value}"
});

// model entity to resolve a Planet
const ResidentModel = Model("Resident", {
  inputType: "string",
  value: [
    // hit request:Resident
    ResidentRequest,
    // extract data
    {
      name: "$name",
      gender: "$gender",
      birthYear: "$birth_year"
    }
  ]
});

// model entity to resolve a Planet
const PlanetModel = Model("Planet", {
  inputType: PlanetSchema,
  value: [
    // hit request:Planet data source
    PlanetRequest,
    // map result to an object reducer
    {
      // map name key
      name: "$name",
      population: "$population",
      // residents is an array of urls
      // eg. https://swapi.co/api/people/1/
      // where each url gets mapped
      // to a model:Resident
      residents: ["$residents", map(ResidentModel)]
    }
  ]
});

const input = {
  planetId: 1
};

// mock request calls
mocks();

dataPoint.resolve(PlanetModel, input).then(output => {
  console.log(output);
  /*
    output ->
    {
      name: 'Tatooine',
      population: 200000,
      residents:
      [
        { name: 'Luke Skywalker', gender: 'male', birthYear: '19BBY' },
        { name: 'C-3PO', gender: 'n/a', birthYear: '112BBY' },
        { name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY' },
        ...
      ]
    }
    */
});
