/* eslint-env jest */
'use strict'

const resolveTransformEntity = require('./resolve').resolve

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')

let dataPoint
let resolveTransform

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
  return resolveTransformEntity(accumulator, resolveTransform)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveTransform = helpers.createResolveTransform(dataPoint)
})

describe('entity.transform.value', () => {
  test('should resolve value Transform', () => {
    return transform('transform:a0', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.value).toEqual('hello world')
    })
  })

  test('should resolve context Transform', () => {
    return transform('transform:a1', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.value).toEqual('HELLO WORLD')
    })
  })
})
