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

    const reducerMaxIndex = reducerList.length - 1;

    for (let index = 0; index <= reducerMaxIndex; index += 1) {
      const reducer = reducerList[index];

      // we do purposely want to wait for each reducer to execute
      // eslint-disable-next-line no-await-in-loop
      value = await resolveReducer(acc, reducer);

      // only create new accumulator if there are more reducers to process
      if (index < reducerMaxIndex) {
        acc = acc.set("value", value);
      }
    }

    return value;
  }
}

module.exports = {
  ReducerList
};
