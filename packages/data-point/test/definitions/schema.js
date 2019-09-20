module.exports = {
  "schema:a.1.0": {
    schema: {
      type: "object",
      properties: {
        foo: {
          type: "integer"
        },
        bar: {
          type: "string"
        }
      },
      required: ["foo", "bar"]
    },
    options: {
      v5: false
    }
  }
};
