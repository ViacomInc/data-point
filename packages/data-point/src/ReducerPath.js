const { Reducer } = require("./Reducer");

// Credit:
// path parsing based off of the work on:
// https://gomakethings.com/how-to-get-the-value-of-an-object-from-a-specific-path-with-vanilla-js/
// chris@gomakethings.com

/**
 * @type {RegExp} matches simple accessor separators `[`, `]` and `.`
 */
const splitToArrayRegEx = /[[,.,\]]/g;

/**
 * @param {string} pathProperty
 * @returns {number|string} parsed value
 */
function parsePathProperty(pathProperty) {
  const numberValue = Number(pathProperty);
  return Number.isNaN(numberValue) ? pathProperty : numberValue;
}

/**
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
 * @param {string} pathSource
 * @returns {Object} compiled source
 */
function parsePath(pathSource) {
  const compliedSource = {
    /**
     * @type {Array<string|number>} parsed object path
     */
    path: [],
    /**
     * @type {Boolean} true if crawling should look one level up
     */
    moveUp: false
  };

  let sourceToCompile = pathSource.substr(1);

  if (pathSource.startsWith("$..")) {
    compliedSource.moveUp = true;
    sourceToCompile = sourceToCompile.substr(2);
  }

  if (pathSource === "$.") {
    compliedSource.path = [];
  } else {
    compliedSource.path = stringToPath(sourceToCompile);
  }

  return compliedSource;
  // return pathSource === "$." ? [] : stringToPath(pathSource.substr(1));
}

/**
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
    // If the item isn't found, return undefined
    if (current[path[i]] === undefined) return undefined;

    // Otherwise, update the current  value
    current = current[path[i]];
  }

  return current;
}

/**
 * @param {Accumulator} accumulator
 * @param {Object} compiledPath
 * @returns {any} resolved value
 */
function resolvePath(accumulator, compiledPath) {
  const valueToCrawl =
    compiledPath.moveUp === true ? accumulator : accumulator.value;

  return crawlPath(valueToCrawl, compiledPath.path);
}

/**
 * Reducer that crawls a data path (using dot notation) from the accumulator
 */
class ReducerPath extends Reducer {
  /**
   * @param {string} spec dot notation object path, expects path to start with $
   */
  constructor(spec) {
    super("path", spec, spec);
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
