/* eslint-env jest */

const _ = require('lodash')

const core = require('./core')

const reducers = require('../../test/utils/reducers')
const entities = require('../../test/definitions/entities')

let instance

beforeAll(() => {
  instance = core.create({
    values: {
      v1: 'v1'
    },
    reducers: {
      test: reducers
    },
    entities
  })
})

test('setup', () => {
  expect(instance.middleware.use).toBeTruthy()
  expect(_.isFunction(instance.use)).toBeTruthy()
  expect(instance.values.add).toBeTruthy()
  expect(instance.entities.add).toBeTruthy()

  expect(instance.values.store.v1).toEqual('v1')
  expect(instance.entities.store.has('request:a0.1')).toBeTruthy()
  expect(instance.entities.store.has('entry:a0')).toBeTruthy()
})

test('entry#transform - fail if id not found', done => {
  instance.transform('entry:INVALID', {}, {}, (err, result) => {
    /* eslint handle-callback-err: 0 */
    expect(_.isError(err)).toBeTruthy()
    expect(err.name).toBe('InvalidId')
    done()
  })
})

describe('addEntityType', () => {
  function createEntityFactory () {
    return {
      create (spec) {},
      resolve (accumulator, resolveReducer) {}
    }
  }

  test('It should add single new entity type', () => {
    const dataPoint = core.create()

    dataPoint.addEntityType('foo', createEntityFactory())

    const entityType = dataPoint.entityTypes.store.get('foo')
    expect(entityType).toHaveProperty('id', 'foo')
  })

  test('It should add multiple entity types', () => {
    const dataPoint = core.create()

    dataPoint.addEntityTypes({
      foo: createEntityFactory(),
      bar: createEntityFactory()
    })

    const store = dataPoint.entityTypes.store
    expect(store.get('foo')).toHaveProperty('id', 'foo')
    expect(store.get('bar')).toHaveProperty('id', 'bar')
  })
})
