const { Reducer } = require("./Reducer");

function isReducerConstant(value) {
  return Reducer.isReducer(value) && value.type === "constant";
}

module.exports = isReducerConstant;
