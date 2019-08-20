const { Reducer } = require("./Reducer");

class ReducerFunction extends Reducer {
  constructor(spec) {
    super("function", spec.name || "anonymous", spec);

    this.functionBody = spec;
  }

  static isType(spec) {
    return typeof spec === "function";
  }

  async resolve(accumulator) {
    return this.functionBody.call(undefined, accumulator.value, accumulator);
  }
}

module.exports = {
  ReducerFunction
};
