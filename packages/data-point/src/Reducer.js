const { IS_REDUCER } = require("./reducer-symbols");

function normalizeName(name) {
  return name ? `${name}:` : "";
}

class Reducer {
  constructor(name, spec) {
    this.id = `${normalizeName(name)}${this.constructor.name}`;
    this.name = name;

    Object.defineProperty(this, "spec", {
      value: spec,
      enumerable: false
    });

    Object.defineProperty(this, IS_REDUCER, {
      value: true,
      enumerable: false
    });
  }

  static isReducer(value) {
    return !!value && value[IS_REDUCER] === true;
  }

  async resolveReducer(accumulator, resolveReducer) {
    return this.resolve(accumulator, resolveReducer);
  }
}

module.exports = {
  normalizeName,
  Reducer
};
