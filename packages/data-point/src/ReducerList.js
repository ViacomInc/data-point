const { ReducerNative } = require("./ReducerNative");

class ReducerList extends ReducerNative {
  constructor(spec, createReducer) {
    super("list", undefined, spec);

    this.reducerList = spec.map(token => createReducer(token));
  }

  static isType(spec) {
    return Array.isArray(spec);
  }

  async resolve(accumulator, resolveReducer) {
    const reducers = this.reducerList;

    if (reducers.length === 0) {
      return undefined;
    }

    const initialValue =
      accumulator.value === undefined ? null : accumulator.value;

    let index = 0;

    let value = initialValue;

    while (index < reducers.length) {
      const reducer = reducers[index];

      const acc = Object.create(accumulator);
      acc.value = value;

      // we do purposely want to wait for each reducer to execute
      // eslint-disable-next-line no-await-in-loop
      value = await resolveReducer(acc, reducer);

      index += 1;
    }

    return value;
  }
}

module.exports = {
  ReducerList
};
