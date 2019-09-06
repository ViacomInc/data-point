const { Reducer } = require("./Reducer");

// Credit:
// path parsing based off of the work on:
// https://gomakethings.com/how-to-get-the-value-of-an-object-from-a-specific-path-with-vanilla-js/
// chris@gomakethings.com

/**
 * @private
 * @type {RegExp} matches simple accessor separators `[`, `]` and `.`
 */
const splitToArrayRegEx = /[[,.,\]]/g;

/**
 * @private
 * @param {string} pathProperty
 * @returns {number|string} parsed value
 */
function parsePathProperty(pathProperty) {
  const numberValue = Number(pathProperty);
  return Number.isNaN(numberValue) ? pathProperty : numberValue;
}

/**
 * @private
 * @param {string} pathSource
 * @returns {Array<string|number>}
 */
function stringToPath(pathSource) {
  const output = [];

  const accessors = pathSource.split(splitToArrayRegEx);

  const accessorsLength = accessors.length;

  // using for loop for faster iteration
  for (let index = 0; index < accessorsLength; index += 1) {
    const accessor = accessors[index];
    if (accessor !== "") {
      output.push(parsePathProperty(accessor));
    }
  }

  return output;
}

/**
 * @private
 * @param {string} pathSource
 * @returns {Object} compiled source
 */
function parsePath(pathSource) {
  const compiledSource = {
    /**
     * @type {Array<string|number>} parsed object path
     */
    path: [],
    /**
     * @type {Boolean} true if true then use the entire accumulator as the source
     */
    useAccumulatorAsSource: false
  };

  if (pathSource === "$.") {
    return compiledSource;
  }

  let sourceToCompile;

  if (pathSource.startsWith("$..")) {
    compiledSource.useAccumulatorAsSource = true;
    // removes characters "$.."
    sourceToCompile = pathSource.substr(3);
  } else {
    // removes character "$"
    sourceToCompile = pathSource.substr(1);
  }

  compiledSource.path = stringToPath(sourceToCompile);

  return compiledSource;
}

/**
 * @private
 * @param {any} value value to crawl
 * @param {Array<string|number>} path object path to crawl
 * @returns {any} resolved path
 */
function crawlPath(value, path) {
  let current = value;

  // For each item in the path, dig into the object
  const length = path.length;

  // using for loop for faster iteration
  for (let i = 0; i < length; i += 1) {
    const currentPathValue = current[path[i]];

    if (currentPathValue === undefined || currentPathValue === null) {
      return currentPathValue;
    }

    // Otherwise, update the current  value
    current = currentPathValue;
  }

  return current;
}

/**
 * @private
 * @param {Accumulator} accumulator
 * @param {Object} compiledPath
 * @returns {any} resolved value
 */
function resolvePath(accumulator, compiledPath) {
  const valueToCrawl =
    compiledPath.useAccumulatorAsSource === true
      ? accumulator
      : accumulator.value;

  return crawlPath(valueToCrawl, compiledPath.path);
}

/**
 * Reducer that crawls a data path (using dot notation) from the accumulator
 * @extends {Reducer}
 */
class ReducerPath extends Reducer {
  /**
   * @param {string} spec dot notation object path, expects path to start with $
   */
  constructor(spec) {
    super(spec, spec);
    this.compiledPath = parsePath(spec);
  }

  /**
   * @param {string} spec
   */
  static isType(spec) {
    return (
      typeof spec === "string" && spec.charAt(0) === "$" && spec.length > 1
    );
  }

  /**
   *
   * @param {Accumulator} accumulator
   */
  resolve(accumulator) {
    return resolvePath(accumulator, this.compiledPath);
  }
}

module.exports = {
  splitToArrayRegEx,
  parsePathProperty,
  stringToPath,
  parsePath,
  crawlPath,
  resolvePath,
  ReducerPath
};
