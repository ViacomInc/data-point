const { ReducerNative } = require("./ReducerNative");

class ReducerFunction extends ReducerNative {
  constructor(spec) {
    super("function", spec.name, spec);

    this.functionBody = spec;
  }

  static isType(spec) {
    return typeof spec === "function";
  }

  async resolve(accumulator) {
    return this.functionBody(accumulator.value, accumulator);
  }
}

module.exports = {
  ReducerFunction
};
