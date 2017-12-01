/* eslint-env jest */
'use strict'

const _ = require('lodash')

const coreFactory = require('./factory')

const reducers = require('../../test/utils/reducers')
const entities = require('../../test/definitions/entities')

let instance

beforeAll(() => {
  instance = coreFactory.create({
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
  expect(instance.filters.add).toBeTruthy()
  expect(instance.entities.add).toBeTruthy()

  expect(instance.values.store.v1).toEqual('v1')
  expect(_.isFunction(instance.filters.store.test.passThrough)).toBeTruthy()
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
