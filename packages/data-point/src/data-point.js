const { createReducer } = require("./create-reducer");
const Accumulator = require("./Accumulator");
const Resolve = require("./resolve-reducer");

async function resolveFromAccumulator(acc, reducers) {
  const parsedReducers = createReducer(reducers);
  return Resolve.resolve(acc, parsedReducers);
}

async function resolver(input, reducers, options = {}) {
  const acc = Accumulator.create({
    value: input,
    locals: options.locals,
    resolve: resolveFromAccumulator,
    cache: options.cache,
    tracer: options.tracer
  });

  const output = await resolveFromAccumulator(acc, reducers);

  return output;
}

class DataPoint {
  constructor() {
    this.cache = {
      get: undefined,
      set: undefined
    };
  }

  static create() {
    return new DataPoint();
  }

  async resolve(input, reducer, options = {}) {
    return resolver(input, reducer, {
      cache: this.cache,
      ...options
    });
  }
}

module.exports = {
  DataPoint,
  resolveFromAccumulator,
  resolver
};
