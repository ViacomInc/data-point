const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

class ReducerParallel extends Reducer {
  constructor(spec) {
    super("parallel", undefined, spec);
    this.reducers = spec.map(reducerSpec => createReducer(reducerSpec));
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
      this.reducers.map(reducer => {
        return resolveReducer(accumulator, reducer);
      })
    );
  }
}

module.exports = {
  ReducerParallel
};
