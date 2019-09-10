const { createReducer } = require("./create-reducer");
const { Accumulator } = require("./Accumulator");
const { resolve } = require("./resolve");
const { Cache } = require("./Cache");
const isPlainObject = require("./is-plain-object");

const Tracer = require("./tracing/Tracer");

/**
 * Applies a reducer from an accumulator object.
 *
 * @param {Accumulator} acc accumulator object to be used.
 * @param {Reducer} reducer
 * @returns {Promise<any>} resolved value
 */
async function resolveFromAccumulator(acc, reducer) {
  const parsedReducers = createReducer(reducer);
  return resolve(acc, parsedReducers, true);
}

/**
 * Applies a reducer to the provided input value.
 *
 * @param {any} input value to process.
 * @param {Reducer} reducer valid reducer to process the value.
 * @param {Object} options
 * @param {Cache|undefined} options.cache cache manager, see Cache for options.
 * @param {Object|undefined} options.locals persistent object that is
 * accessible via the Accumulator object on every reducer.
 * @param {Tracer} options.tracer when provided it should
 * comply with the DataPoint Tracing API.
 * @returns {Promise<any>} resolved value
 */
async function resolveFromInput(input, reducer, options = {}) {
  const acc = new Accumulator({
    value: input,
    locals: options.locals,
    resolve: resolveFromAccumulator,
    cache: options.cache,
    tracer: options.tracer
  });

  return resolveFromAccumulator(acc, reducer);
}

/**
 * @param {Object} locals
 * @throws Error if the value is not a simple object. To know which values are
 * considered as simple objects please read the unit test for `isPlainObject`.
 */
function validateLocals(locals) {
  if (locals === undefined || isPlainObject(locals)) {
    return;
  }

  throw new Error("'options.locals' must be undefined or a plain object");
}

/**
 * @param {Tracer} options.tracer when provided it should
 * comply with the DataPoint Tracing API.
 * @throws Error if the object does not expose the methods `start`.
 */
function validateTracer(tracer) {
  if (tracer) {
    if (typeof tracer.start !== "function") {
      throw new Error("tracer.start must be a function");
    }

    if (tracer.error && typeof tracer.error !== "function") {
      throw new Error("tracer.error must be a function");
    }

    if (tracer.finish && typeof tracer.finish !== "function") {
      throw new Error("tracer.finish must be a function");
    }
  }
}

class DataPoint {
  constructor() {
    Object.defineProperty(this, "cache", {
      enumerable: false,
      value: new Cache()
    });
  }

  static create() {
    return new DataPoint();
  }

  /**
   * @param {any} input value to run the provided reducer thru.
   * @param {Reducer} reducer reducer to process the input.
   * @param {Object} options
   * @param {Object|undefined} options.locals persistent object that is
   * accessible via the Accumulator object on every reducer.
   * @param {Tracer} options.tracer when provided it should
   * comply with the DataPoint Tracing API.
   * @returns {Promise<any>} result from running the input thru the
   * provided reducer.
   */
  async resolve(input, reducer, options = {}) {
    validateLocals(options.locals);
    validateTracer(options.tracer);

    let tracer;
    if (options.tracer) {
      tracer = new Tracer(options.tracer);
    }

    return resolveFromInput(input, reducer, {
      ...options,
      cache: this.cache,
      tracer
    });
  }
}

module.exports = {
  resolveFromAccumulator,
  resolveFromInput,
  DataPoint,
  validateLocals,
  validateTracer
};
