/* eslint-disable import/no-extraneous-dependencies */
/**
 *  This example is to show how you can force revalidation via schema validation.
 *  the idea is to rely on two parts:
 *  1. adding an outputType reducer using json schema validation.
 *  2. cache key is created with a unique string hash based on the schema used.
 *
 *  This will cause the following behaviors:
 *  - Every time the schema changes the cache's key also changes, this will force a cache revalidation.
 *  - After the revalidation, if the output type does not pass, the entry will not be added.
 *  - **IMPORTANT**: if you are using stale-while-revalidate, and the cache validation fails,
 *    it will continue to serve the stale value until its TTL dies.
 */

const express = require("express");
const DataPoint = require("data-point");
const hash = require("object-hash");
const Ajv = require("ajv");

const DataPointService = require("../lib");

const ajv = new Ajv({
  allErrors: true
});

const Schema = {
  validate(jsonSchema) {
    const schemaValidate = ajv.compile(jsonSchema);
    return (value, ctx) => {
      const isValid = schemaValidate(value);

      if (!isValid) {
        throw new TypeError(
          `Failed schema validation for "${
            ctx.reducer.spec.id
          }", errors:\n ${ajv.errorsText(schemaValidate.errors)}\n`
        );
      }
    };
  },
  hash(jsonSchema) {
    return hash(jsonSchema);
  }
};

const jsonSchema = {
  type: "object",
  title: "The Root Schema",
  description: "The root schema comprises the entire JSON document.",
  required: ["id", "phone"],
  properties: {
    id: {
      $id: "#/properties/id",
      type: "string",
      pattern: "a$"
    },
    phone: {
      $id: "#/properties/phone",
      type: "string"
    }
  }
};

const HelloWorld = DataPoint.Model("HelloWorld", {
  value: (input, acc) => {
    const id = acc.locals.query.id;
    const phone = acc.locals.query.phone;
    return {
      id,
      phone
    };
  },
  outputType: Schema.validate(jsonSchema),
  params: {
    cache: {
      ttl: "2m",
      staleWhileRevalidate: "4m",
      cacheKey: () => {
        return `SH-${Schema.hash(jsonSchema)}`;
      }
    }
  }
});

function server(dataPoint) {
  const app = express();

  app.get("/api/hello-world", (req, res) => {
    const options = {
      // exposing query to locals will make this object available to all
      // reducers
      locals: {
        query: req.query
      }
    };
    dataPoint
      .resolve(HelloWorld, {}, options)
      .then(value => {
        res.send(value);
      })
      .catch(error => {
        res.status(500).send(error.toString());
      });
  });

  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("listening on port 3000!");
  });
}

function createService() {
  return DataPointService.create({
    DataPoint
  }).then(service => {
    return service.dataPoint;
  });
}

createService().then(server);
