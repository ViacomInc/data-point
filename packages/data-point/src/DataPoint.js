const { createReducer } = require("./create-reducer");
const { Accumulator } = require("./Accumulator");
const { resolve } = require("./resolve");
const { Cache } = require("./Cache");
const isPlainObject = require("./is-plain-object");

/**
 * Applies a reducer from an accumulator object.
 *
 * @param {Accumulator} acc accumulator object to be used.
 * @param {Reducer} reducer
 * @returns {Promise<any>} resolved value
 */
async function resolveFromAccumulator(acc, reducer) {
  const parsedReducers = createReducer(reducer);
  return resolve(acc, parsedReducers);
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
 * @param {OpenTrace.Span|undefined} options.tracer when provided it should
 * comply with the **opentracing** Span API.
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
 * @throws Error if the value is not a simple object. To kow which values are
 * considered as simple objects please read the unit test for `isPlainObject`.
 */
function validateLocals(locals) {
  if (locals === undefined || isPlainObject(locals)) {
    return;
  }

  throw new Error("'options.locals' must be undefined or an object");
}

/**
 * @param {OpenTrace.Span} tracer when provided it should
 * comply with the **opentracing** Span API.
 * @throws Error if the object does not expose the methods `startSpan`,
 * `setTag`, `log`.
 */
function validateTracer(tracer) {
  if (tracer) {
    if (typeof tracer.startSpan !== "function") {
      throw new Error(
        "tracer.startSpan must be a function, tracer expects opentracing API (see https://opentracing.io)"
      );
    }

    if (typeof tracer.setTag !== "function") {
      throw new Error(
        "tracer.setTag must be a function, tracer expects opentracing API (see https://opentracing.io)"
      );
    }

    if (typeof tracer.log !== "function") {
      throw new Error(
        "tracer.log must be a function, tracer expects opentracing API (see https://opentracing.io)"
      );
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
   * @param {OpenTrace.Span|undefined} options.tracer when provided it should
   * comply with the **opentracing** Span API.
   * @returns {Promise<any>} result from running the input thru the
   * provided reducer.
   */
  async resolve(input, reducer, options = {}) {
    validateLocals(options.locals);
    validateTracer(options.tracer);

    return resolveFromInput(input, reducer, {
      ...options,
      cache: this.cache
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
