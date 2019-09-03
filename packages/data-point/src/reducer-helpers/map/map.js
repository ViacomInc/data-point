const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

/**
 * Creates an array of values by running each element in collection thru
 * iterateeReducer.
 *
 * @extends Reducer
 */
class ReducerMap extends Reducer {
  constructor(spec) {
    super(undefined, spec);

    /**
     * @protected
     * @type {Reducer} Iteratee used to run thru each value in the
     * `accumulator.value`'s elements.
     */
    this.iterateeReducer = createReducer(spec);
  }

  /**
   * @static
   * @param {Reducer} spec
   * @returns {ReducerMap}
   */
  static create(spec) {
    return new ReducerMap(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {resolve} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const iterateeReducer = this.iterateeReducer;
    return Promise.all(
      accumulator.value.map(entry => {
        return resolveReducer(accumulator.set("value", entry), iterateeReducer);
      })
    );
  }
}

module.exports = {
  ReducerMap
};
