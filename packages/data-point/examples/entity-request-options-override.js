/* eslint-disable no-console */
const dataPoint = require("../").create();
const mockRequest = require("./entity-request-basic.mock");

dataPoint.addEntities({
  "request:getLuke": {
    url: "https://swapi.co/api/people/1/"
  }
});

// mock the remote service
mockRequest();

// The params defined here will override the params defined in the entity definition.
const options = {
  entityOverrides: {
    request: {
      params: {
        inspect: true
      }
    }
  }
};

dataPoint.resolve("request:getLuke", {}, options).then(output => {
  console.dir(output, { colors: true });
});
