const { IS_REDUCER } = require("./reducer-symbols");

let uid = 0;
function uniqueId() {
  uid += 1;
  return uid;
}

class Reducer {
  constructor(type, name, spec) {
    const normalizedName = name ? `${name}:${uniqueId()}` : uniqueId();

    this.id = `${type}:${normalizedName}`;
    this.name = name;
    this.reducerType = type;

    Object.defineProperty(this, "spec", {
      value: spec,
      enumerable: false
    });

    Object.defineProperty(this, IS_REDUCER, {
      value: true,
      enumerable: false
    });
  }

  setAccumulatorContext(accumulator) {
    return accumulator.set("reducer", this);
  }

  async resolveReducer(accumulator, resolveReducer) {
    const acc = this.setAccumulatorContext(accumulator);
    return this.resolve(acc, resolveReducer);
  }
}

module.exports = {
  Reducer
};
