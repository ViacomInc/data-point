/**
 * This method is used to check if the argument passed is a simple object.
 *
 * Please take a look at the unit tests of this module to understand which
 * values are considered an object.
 *
 * If there are more cases that need to be considered please create an issue.
 *
 * @private
 * @param {any} obj
 * @returns {Boolean} true if object created via `{}`
 */
function isPlainObject(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}
module.exports = isPlainObject;
