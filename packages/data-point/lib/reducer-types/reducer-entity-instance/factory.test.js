/* eslint-env jest */

const factory = require('./factory')
const createReducer = require('../index').create
const EntityReducer = require('../../entity-types/entity-transform')

test('isType', () => {
  expect(factory.isType('a')).toBe(false)
  expect(factory.isType({})).toBe(false)
  expect(
    factory.isType({
      isEntityInstance: true
    })
  ).toBe(true)
})

describe('create', function () {
  test('default create', () => {
    const reducer = factory.create(createReducer, EntityReducer('foo', '$'))
    expect(reducer).toMatchSnapshot()
  })
})
