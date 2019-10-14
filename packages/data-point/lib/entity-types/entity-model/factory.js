const BaseEntity = require("../base-entity");
const { resolve } = require("./resolve");

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {Object} Entity Object
 */
function create(id, spec) {
  const entity = {};
  entity.spec = spec;
  return entity;
}

module.exports.create = BaseEntity.create("model", create, resolve);
