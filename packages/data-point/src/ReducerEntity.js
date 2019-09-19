const { createReducer } = require("./create-reducer");
const { Reducer } = require("./Reducer");

/**
 * @class
 * @extends Reducer
 */
class ReducerEntity extends Reducer {
  constructor(spec) {
    super(spec.name, spec);

    this.uid = spec.uid;
    this.params = spec.params || {};

    this.value = this.createReducer("value", spec);
    this.inputType = this.createReducer("inputType", spec);
    this.outputType = this.createReducer("outputType", spec);
    this.before = this.createReducer("before", spec);
    this.after = this.createReducer("after", spec);
    this.catch = this.createReducer("catch", spec);
  }

  /**
   * TODO: should we move this method up to a common class for entities and
   * helper Reducers?
   * NOTE: this method mutates the class
   * @param {String} name reducer name
   * @param {Object} target entity target
   * @param {Object} spec entity source spec
   */
  // eslint-disable-next-line class-methods-use-this
  createReducer(name, spec) {
    return spec[name] ? createReducer(spec[name]) : undefined;
  }

  async resolveEntityValue(accumulator, resolveReducer) {
    let acc = accumulator;

    const generatedUId = this.uid ? this.uid(acc) : undefined;

    if (this.inputType) {
      await resolveReducer(acc, this.inputType);
    }

    const cache = accumulator.cache;

    if (typeof cache.get === "function") {
      const cacheResult = await cache.get(generatedUId, acc);
      if (cacheResult !== undefined) {
        return cacheResult;
      }
    }

    if (this.before) {
      acc = acc.set("value", await resolveReducer(acc, this.before));
    }

    if (this.value) {
      acc = acc.set("value", await resolveReducer(acc, this.value));
    }

    if (this.resolve) {
      acc = acc.set("value", await this.resolve(acc, resolveReducer));
    }

    if (this.after) {
      acc = acc.set("value", await resolveReducer(acc, this.after));
    }

    if (this.outputType) {
      await resolveReducer(acc, this.outputType);
    }

    if (typeof cache.set === "function") {
      await cache.set(generatedUId, acc);
    }

    return acc.value;
  }

  async resolveReducer(accumulator, resolveReducer) {
    let value;

    try {
      value = await this.resolveEntityValue(accumulator, resolveReducer);
    } catch (error) {
      if (!this.catch) {
        throw error;
      }

      const catchValue = await resolveReducer(
        accumulator.set("value", error),
        this.catch
      );

      if (this.outputType) {
        await resolveReducer(
          accumulator.set("value", catchValue),
          this.outputType
        );
      }

      return catchValue;
    }

    return value;
  }
}

module.exports = {
  ReducerEntity
};
