const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

/**
 * Runs in parallel a set of provided reducers against the provided input.
 */
class ReducerParallel extends Reducer {
  constructor(spec) {
    super(undefined, spec);

    /**
     * @type {Reducer[]} list of reducers to run in parallel against a
     * given input.
     */
    this.parallelReducers = spec.map(reducerSpec => createReducer(reducerSpec));
  }

  static create(spec) {
    return new ReducerParallel(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    return Promise.all(
      this.parallelReducers.map(reducer => {
        return resolveReducer(accumulator, reducer);
      })
    );
  }
}

module.exports = {
  ReducerParallel
};
