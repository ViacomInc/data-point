const { ReducerEntity } = require("../../ReducerEntity");

class ReducerModel extends ReducerEntity {
  static create(spec) {
    return new ReducerModel(spec);
  }
}

module.exports = {
  ReducerModel
};
