const { Reducer } = require("./Reducer");

class ReducerList extends Reducer {
  constructor(spec, createReducer) {
    super("list", undefined, spec);

    this.reducerList = spec.map(reducerSource => createReducer(reducerSource));
  }

  static isType(spec) {
    return Array.isArray(spec);
  }

  async resolve(accumulator, resolveReducer) {
    const reducerList = this.reducerList;

    if (reducerList.length === 0) {
      return undefined;
    }

    let value = accumulator.value;
    let acc = accumulator;

    let index = 0;
    let hasReachedEnd;
    const reducerListLength = reducerList.length;

    do {
      const reducer = reducerList[index];

      // we do purposely want to wait for each reducer to execute
      // eslint-disable-next-line no-await-in-loop
      value = await resolveReducer(acc, reducer);

      index += 1;

      hasReachedEnd = index === reducerListLength;

      if (!hasReachedEnd) {
        // only create new accumulator if there are more reducers to process
        acc = acc.set("value", value);
      }
    } while (!hasReachedEnd);

    return value;
  }
}

module.exports = {
  ReducerList
};
