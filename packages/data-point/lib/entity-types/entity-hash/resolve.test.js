/* eslint-env jest */

const resolveHashEntity = require('./resolve').resolve

const FixtureStore = require('../../../test/utils/fixture-store')
const testData = require('../../../test/data.json')

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
  return resolveHashEntity(accumulator, resolveReducerBound)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('Hash entity type checking', () => {
  function resolveInvalid (entity, data) {
    return dataPoint
      .resolve(entity, data)
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).toMatchSnapshot()
      })
  }
  test('should throw error from default outputType reducer when output is not valid', () => {
    return resolveInvalid('hash:asIs', [testData])
  })
  test('should throw error from a custom outputType reducer', () => {
    return resolveInvalid('hash:CustomOutputType', {})
  })
  test('should execute the default outputType reducer before a custom outputType reducer ', () => {
    return resolveInvalid('hash:CustomOutputType', [])
  })
})

describe('entity.hash.mapKeys', () => {
  test('should map hash to new keys', () => {
    return transform('hash:b.1', testData.a.h).then(result => {
      expect(result).toEqual({ h: 2 })
    })
  })
  test('returns empty object if mapKeys is empty', () => {
    return transform('hash:b.2', testData.a.g).then(result => {
      expect(result).toEqual({})
    })
  })
})

describe('entity.hash.addKeys', () => {
  test('should add new keys to hash', () => {
    return transform('hash:c.1', testData.a.h).then(result => {
      expect(result).toEqual({
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4
      })
    })
  })
  test('it should do nothing if addKeys is empty', () => {
    return transform('hash:c.2', testData.a.g).then(result => {
      expect(result).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.omitKeys', () => {
  test('should omit keys from hash', () => {
    return transform('hash:d.1', testData.a.h).then(result => {
      expect(result).toEqual({
        h3: 3
      })
    })
  })
  test('it should do nothing if omitKeys is empty', () => {
    return transform('hash:d.2', testData.a.g).then(result => {
      expect(result).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.pickKeys', () => {
  test('should only pick keys from hash', () => {
    return transform('hash:e.1', testData.a.h).then(result => {
      expect(result).toEqual({
        h1: 1,
        h2: 2
      })
    })
  })
  test('returns empty object if pickKeys is empty', () => {
    return transform('hash:e.2', testData.a.g).then(result => {
      expect(result).toEqual({})
    })
  })
})

describe('entity.hash.addValues', () => {
  test('should add values to hash', () => {
    return transform('hash:f.1', testData.a.h).then(result => {
      expect(result).toEqual({
        h0: 0,
        h1: 1,
        h2: 2,
        h3: 3
      })
    })
  })
  test('it should do nothing if addValues is empty', () => {
    return transform('hash:f.2', testData.a.g).then(result => {
      expect(result).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.compose', () => {
  test('should resolved composed modifiers', () => {
    return transform('hash:h.1', testData.a.e.e1).then(result => {
      expect(result).toEqual({
        e3: 'eThree'
      })
    })
  })
})
