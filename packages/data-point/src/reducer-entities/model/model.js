const { ReducerEntity } = require("../../ReducerEntity");

class ReducerModel extends ReducerEntity {
  constructor(spec) {
    super("model", spec);
  }

  static create(spec) {
    return new ReducerModel(spec);
  }
}

module.exports = {
  ReducerModel
};
