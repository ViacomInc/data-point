const _ = require('lodash')

const DataPoint = require('../')

// Entity Class
function RenderTemplate () {}

/**
 * Entity Factory
 * @param {*} spec - Entity Specification
 * @param {string} id - Entity id
 * @return {RenderTemplate} RenderTemplate Instance
 */
function create (spec, id) {
  // create an entity instance
  const entity = DataPoint.createEntity(RenderTemplate, spec, id)
  // set/create template from spec.template value
  entity.template = _.template(_.defaultTo(spec.template, ''))
  return entity
}

/**
 * Resolve entity
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  // get Entity Spec
  const spec = accumulator.reducer.spec
  // resolve 'spec.value' reducer
  // against accumulator
  return resolveReducer(accumulator, spec.value).then(acc => {
    // execute lodash template against
    // accumulator value
    const output = spec.template(acc.value)
    // set new accumulator.value
    // this method creates a new acc object
    return DataPoint.set(acc, 'value', output)
  })
}

/**
 * RenderEntity API
 */
const RenderEntity = {
  create,
  resolve
}

// Create DataPoint instance
const dataPoint = DataPoint.create({
  // custom entity Types
  entityTypes: {
    // adds custom entity type 'render'
    render: RenderEntity
  },

  entities: {
    // uses new custom entity type
    'render:HelloWorld': {
      value: '$user',
      template: '<h1>Hello <%= name %>!!</h1>'
    }
  }
})

const data = {
  user: {
    name: 'World'
  }
}

dataPoint.transform('render:HelloWorld', data).then(acc => {
  console.log(acc.value) // '<h1>Hello World!!</h1>'
})
