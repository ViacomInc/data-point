const _ = require('lodash')

const DataPoint = require('../')

// Entity Class
function RenderTemplate () {}

/**
 * Entity Factory
 * @param {string} id - Entity id
 * @param {*} spec - Entity Specification
 * @return {RenderTemplate} RenderTemplate Instance
 */
function create (id, spec) {
  // create an entity instance
  const entity = new RenderTemplate()
  entity.spec = spec
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

  // execute lodash template against
  // accumulator value
  return spec.template(accumulator.value)
}

/**
 * RenderEntity API
 */
const RenderEntity = DataPoint.createEntity('render', create, resolve)

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

dataPoint.resolve('render:HelloWorld', data).then(output => {
  console.log(output) // '<h1>Hello World!!</h1>'
})
