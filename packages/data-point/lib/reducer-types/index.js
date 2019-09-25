/* eslint global-require: 0 */

module.exports = {
  create: require("./factory").create,
  isReducer: require("./factory").isReducer,
  resolve: require("./resolve").resolve
};
