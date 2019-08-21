const { IS_REDUCER } = require("./reducer-symbols");
const uniqueIdScope = require("./unique-id-scope");

const uniqueId = uniqueIdScope();

function normalizeName(name) {
  const reducerUId = uniqueId();
  return name ? `${name}:${reducerUId}` : reducerUId;
}

class Reducer {
  constructor(type, name, spec) {
    this.id = `${type}:${normalizeName(name)}`;
    this.name = name;
    this.type = type;

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
    return value && value[IS_REDUCER] === true;
  }

  async resolveReducer(accumulator, resolveReducer) {
    return this.resolve(accumulator, resolveReducer);
  }
}

module.exports = {
  normalizeName,
  Reducer
};
