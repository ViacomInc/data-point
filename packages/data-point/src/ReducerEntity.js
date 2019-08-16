const { createReducer } = require("./create-reducer");
const { Reducer } = require("./Reducer");

class ReducerEntity extends Reducer {
  constructor(type, spec) {
    super(type, spec.name, spec);

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

    acc.uid = this.uid ? this.uid(acc) : undefined;

    if (this.inputType) {
      await resolveReducer(acc, this.inputType);
    }

    const cache = accumulator.cache;

    if (typeof cache.get === "function") {
      const cacheResult = await cache.get(acc);
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
      await cache.set(acc);
    }

    return acc.value;
  }

  async resolveReducer(accumulator, resolveReducer) {
    let acc = accumulator;
    try {
      acc.value = await this.resolveEntityValue(acc, resolveReducer);
    } catch (error) {
      error.reducer = this;

      acc = acc.set("value", error);

      if (this.catch) {
        acc = acc.set("value", await resolveReducer(acc, this.catch));
      }

      if (this.outputType) {
        await resolveReducer(acc, this.outputType);
      }
    }

    return acc.value;
  }
}

module.exports = {
  ReducerEntity
};
