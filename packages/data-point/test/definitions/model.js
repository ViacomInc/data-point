module.exports = {
  "model:asIs": {
    value: "$"
  },
  "model:traced": {
    value: "$",
    params: {
      trace: true
    }
  },
  "model:lifecycles": {
    inputType: "array",
    before: (input, context) => context.locals.before(input),
    value: (input, context) => context.locals.value(input),
    after: (input, context) => context.locals.after(input),
    error: (input, context) => context.locals.error(input),
    outputType: "array"
  },

  "model:a.0": {},
  "model:a.1": {
    value: value => value + 5
  },
  "model:a.2": {
    value: value => value + 5
  },

  // entities c.* are for testing
  // inputType and outputType.
  "model:c.0": {
    inputType: "number"
  },

  "model:c.1": {
    outputType: "string"
  },

  "model:c.2": {
    // test that its immutable
    outputType: value => {
      return "cant happen";
    }
  },

  "model:c.3": {
    // custom type checking
    inputType: value => {
      if (typeof value !== "string") {
        throw new Error("custom type error");
      }

      return value;
    }
  },

  "model:c.4": {
    after: input => 1,
    outputType: "string"
  },

  "model:c.5": {
    before: input => 1,
    outputType: "string"
  },

  "model:c.6": {
    before: () => {
      throw new Error();
    },
    error: () => "error string",
    outputType: "string"
  },

  "model:c.7": {
    before: () => {
      throw new Error();
    },
    error: () => 1,
    outputType: "string"
  },

  "model:c.8": {
    before: () => {
      throw new Error("error from before method");
    },
    error: error => {
      throw error;
    },
    outputType: "string"
  },

  "model:c.9": {
    before: () => 1,
    error: () => "string from error",
    outputType: "string"
  },

  "model:c.10": {
    before: () => 1,
    error: () => 2,
    outputType: "string"
  }
};
