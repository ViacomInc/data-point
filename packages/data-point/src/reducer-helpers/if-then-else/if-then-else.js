const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

/**
 * parse spec
 *
 * @param {any} spec
 * @returns
 */
function parseIfElse(spec) {
  return {
    if: createReducer(spec.if),
    then: createReducer(spec.then),
    else: createReducer(spec.else)
  };
}

class ReducerIfThenElse extends Reducer {
  constructor(spec) {
    super("ifThenElse", undefined, spec);
    this.statement = parseIfElse(spec);
  }

  static create(spec) {
    return new ReducerIfThenElse(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const statement = this.statement;

    const resultIf = await resolveReducer(accumulator, statement.if);

    return resultIf
      ? resolveReducer(accumulator, statement.then)
      : resolveReducer(accumulator, statement.else);
  }
}

module.exports = {
  parseIfElse,
  ReducerIfThenElse
};
