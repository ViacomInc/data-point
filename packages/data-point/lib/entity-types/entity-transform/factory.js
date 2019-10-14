const BaseEntity = require("../base-entity");
const { resolve } = require("./resolve");

/**
 * Creates new Entity Object
 * @param  {*} spec - spec
 * @param {string} id - Entity id
 * @return {Object} Entity Object
 */
function create(id, spec) {
  const entity = {};
  entity.value = spec;
  return entity;
}

module.exports.create = BaseEntity.create("reducer", create, resolve);
