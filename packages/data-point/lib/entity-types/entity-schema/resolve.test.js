/* eslint-env jest */

const resolveSchemaEntity = require('./resolve').resolve

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')

let dataPoint
let resolveReducerBound

function transform (entityId, value, options) {
  const reducer = dataPoint.entities.get(entityId)
  const accumulator = helpers.createAccumulator(
    value,
    Object.assign(
      {
        context: reducer
      },
      options
    )
  )
  return resolveSchemaEntity(accumulator, resolveReducerBound)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('schema.resolve', function () {
  test('handle failure errors', () => {
    const promise = transform('schema:a.1.0', { foo: 1 })
    return promise.catch(err => {
      expect(err.name).toBe('InvalidSchema')
      expect(err.errors).toHaveLength(1)
    })
  })

  test('pass context back if no errors', () => {
    const promise = transform('schema:a.1.0', { foo: 1, bar: '1' })
    return promise.then(result => {
      expect(result).toEqual({ foo: 1, bar: '1' })
    })
  })
})
