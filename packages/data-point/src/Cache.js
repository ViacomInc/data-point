function isValidCacheMethod(callback) {
  return typeof callback === "function" || callback === undefined;
}

/**
 * @class
 */
class Cache {
  constructor() {
    /**
     * @type {Function} holds get method with signature `(uid, acc:Accumulator):Promise`.
     */
    this.__get = undefined;

    /**
     * @type {Function} holds get method with signature `(uid, acc:Accumulator):Promise`.
     */
    this.__set = undefined;
  }

  set get(callback) {
    if (!isValidCacheMethod(callback)) {
      throw new Error("cache.get may only be a 'function' or 'undefined'");
    }

    Object.defineProperty(this, "__get", {
      value: callback,
      enumerable: false
    });
  }

  set set(callback) {
    if (!isValidCacheMethod(callback)) {
      throw new Error("cache.set may only be a 'function' or 'undefined'");
    }

    Object.defineProperty(this, "__set", {
      value: callback,
      enumerable: false
    });
  }

  get get() {
    return this.__get;
  }

  get set() {
    return this.__set;
  }
}

module.exports = {
  Cache,
  isValidCacheMethod
};
