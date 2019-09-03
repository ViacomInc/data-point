const { IS_REDUCER } = require("./reducer-symbols");

function normalizeName(name) {
  return name ? `${name}:` : "";
}

/**
 * @alias Reducer
 * @protected
 * This class is never instantiated directly, it is used to create reducers
 *  DataPoint can use to process a given input.
 */
class Reducer {
  /**
   * @param {string} name Name of the reducer
   * @param {any} spec This is the spec the reducer will be generated from.
   */
  constructor(name, spec) {
    /**
     * @type {string} Normalized reducer's id
     * @name Reducer#id
     * @property
     * @readonly
     */
    Object.defineProperty(this, "id", {
      value: `${normalizeName(name)}${this.constructor.name}`,
      enumerable: true
    });

    /**
     * @type {string} Name of the reducer
     * @name Reducer#name
     * @readonly
     */
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true
    });

    /**
     * @type {any} Spec of the reducer
     * @name Reducer#spec
     * @readonly
     */
    Object.defineProperty(this, "spec", {
      value: spec,
      enumerable: false
    });

    /**
     * @type {Symbol}
     * @private
     * @readonly
     */
    Object.defineProperty(this, IS_REDUCER, {
      value: true,
      enumerable: false
    });
  }

  static isReducer(value) {
    return !!value && value[IS_REDUCER] === true;
  }

  /**
   * @protected
   * @param {Accumulator} accumulator
   * @param {resolve} resolveReducer
   * @returns {Promise<any>}
   */
  async resolveReducer(accumulator, resolveReducer) {
    return this.resolve(accumulator, resolveReducer);
  }
}

module.exports = {
  normalizeName,
  Reducer
};
