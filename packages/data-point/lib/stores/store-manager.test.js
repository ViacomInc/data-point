/* eslint-env jest */

const _ = require('lodash')
const ObjectStoreManager = require('./store-manager')

function createManager () {
  return {
    store: new Map()
  }
}

describe('add', () => {
  test('It should throw error with information if item already exist', () => {
    const mgr = createManager()
    const errorInfoCb = () => ({
      name: 'Foo',
      message: 'Bar'
    })
    const Factory = () => 1
    ObjectStoreManager.add(mgr, errorInfoCb, Factory, 'id1')

    const error = _.attempt(
      ObjectStoreManager.add,
      mgr,
      errorInfoCb,
      Factory,
      'id1'
    )

    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('name', 'Foo')
    expect(error).toMatchSnapshot()
  })

  test('It should throw error with information if item already exist', () => {
    const mgr = createManager()
    const errorInfoCb = () => ({
      name: 'Foo',
      message: 'Bar'
    })
    const Factory = () => {
      throw new Error('factory error')
    }

    const error = _.attempt(
      ObjectStoreManager.add,
      mgr,
      errorInfoCb,
      Factory,
      'id1',
      { spec: 'mySpec' }
    )

    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('entityId', 'id1')
    expect(error).toMatchSnapshot()
  })

  test('It should throw error with information if item already exist', () => {
    const mgr = createManager()
    const errorInfoCb = () => ({
      name: 'Foo',
      message: 'Bar'
    })
    const Factory = (spec, id) => `${id}:${spec.type}`

    ObjectStoreManager.add(mgr, errorInfoCb, Factory, 'id1', { type: 'myType' })
    expect(mgr.store.get('id1')).toEqual('id1:myType')
  })
})
