const { Reducer } = require("../../Reducer");
const { createReducer } = require("../../create-reducer");

class ReducerMap extends Reducer {
  constructor(spec) {
    super("map", undefined, spec);
    this.mapReducer = createReducer(spec);
  }

  static create(spec) {
    return new ReducerMap(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const mapReducer = this.mapReducer;
    return Promise.all(
      accumulator.value.map(entry => {
        return resolveReducer(accumulator.set("value", entry), mapReducer);
      })
    );
  }
}

module.exports = {
  ReducerMap
};
