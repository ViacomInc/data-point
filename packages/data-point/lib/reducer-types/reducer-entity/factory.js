const REDUCER_ENTITY = "ReducerEntity";

module.exports.type = REDUCER_ENTITY;

/**
 * Defines a entity reducer
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {string} entityType - type of entity
 */
function ReducerEntity() {
  this.type = REDUCER_ENTITY;
  this.name = "";
  this.entityType = null;
  this.asCollection = false;
  this.hasEmptyConditional = false;
}

module.exports.ReducerEntity = ReducerEntity;

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType(source) {
  return source && source.isEntityInstance === true;
}

module.exports.isType = isType;

/**
 * @param {Function} createReducer
 * @param {string} entity
 * @return {reducer}
 */
function create(createReducer, entity) {
  const reducer = new ReducerEntity();

  reducer.hasEmptyConditional = false;

  reducer.asCollection = false;

  reducer.id = entity.id;
  reducer.name = entity.name;
  reducer.entityType = entity.entityType;
  reducer.entity = entity;
  // for backwards compatibility with accumulator API
  reducer.spec = entity;

  return reducer;
}

module.exports.create = create;
