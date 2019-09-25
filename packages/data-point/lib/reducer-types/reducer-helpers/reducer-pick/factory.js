const REDUCER_PICK = "ReducerPick";

module.exports.type = REDUCER_PICK;

const HELPER_NAME = "pick";

module.exports.name = HELPER_NAME;

/**
 * @class
 * @property {string} type
 * @property {Array<string>} keys
 */
function ReducerPick() {
  this.type = REDUCER_PICK;
  this.keys = undefined;
}

module.exports.ReducerPick = ReducerPick;

/**
 * @param {Function} createReducer
 * @param {Array<string>} keys
 * @return {ReducerPick}
 */
function create(createReducer, keys) {
  const reducer = new ReducerPick();
  reducer.keys = Object.freeze(keys.slice(0));
  return reducer;
}

module.exports.create = create;
