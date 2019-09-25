const REDUCER_OMIT = "ReducerOmit";

module.exports.type = REDUCER_OMIT;

const HELPER_NAME = "omit";

module.exports.name = HELPER_NAME;

/**
 * @class
 * @property {string} type
 * @property {Array<string>} keys
 */
function ReducerOmit() {
  this.type = REDUCER_OMIT;
  this.keys = undefined;
}

module.exports.Constructor = ReducerOmit;

/**
 * @param {Function} createReducer
 * @param {Array<string>} keys
 * @return {ReducerOmit}
 */
function create(createReducer, keys) {
  const reducer = new ReducerOmit();
  reducer.keys = Object.freeze(keys.slice(0));
  return reducer;
}

module.exports.create = create;
