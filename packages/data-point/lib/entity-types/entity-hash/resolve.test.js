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

describe('entity.hash.resolve', () => {
  test('entity.hash - only process Plain Objects', () => {
    return transform('hash:asIs', [testData])
      .catch(result => {
        return result
      })
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result.message).toMatchSnapshot()
      })
  })

  test('entity.hash - throw error if value is not object', () => {
    return transform('hash:noValue', null)
      .catch(e => e)
      .then(result => {
        expect(result).toMatchSnapshot()
      })
  })
})

describe('entity.hash.value', () => {
  test('should resolve contxt Transform', () => {
    return transform('hash:a.1', testData).then(acc => {
      expect(acc.value).toEqual({
        h1: 1,
        h2: 2,
        h3: 3
      })
    })
  })
})

describe('entity.hash.mapKeys', () => {
  test('should map hash to new keys', () => {
    return transform('hash:b.1', testData).then(acc => {
      expect(acc.value).toEqual({ h: 2 })
    })
  })
  test('returns empty object if mapKeys is empty', () => {
    return transform('hash:b.2', testData).then(acc => {
      expect(acc.value).toEqual({})
    })
  })
})

describe('entity.hash.addKeys', () => {
  test('should add new keys to hash', () => {
    return transform('hash:c.1', testData).then(acc => {
      expect(acc.value).toEqual({
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4
      })
    })
  })
  test('it should do nothing if addKeys is empty', () => {
    return transform('hash:c.2', testData).then(acc => {
      expect(acc.value).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.omitKeys', () => {
  test('should omit keys from hash', () => {
    return transform('hash:d.1', testData).then(acc => {
      expect(acc.value).toEqual({
        h3: 3
      })
    })
  })
  test('it should do nothing if omitKeys is empty', () => {
    return transform('hash:d.2', testData).then(acc => {
      expect(acc.value).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.pickKeys', () => {
  test('should only pick keys from hash', () => {
    return transform('hash:e.1', testData).then(acc => {
      expect(acc.value).toEqual({
        h1: 1,
        h2: 2
      })
    })
  })
  test('returns empty object if pickKeys is empty', () => {
    return transform('hash:e.2', testData).then(acc => {
      expect(acc.value).toEqual({})
    })
  })
})

describe('entity.hash.addValues', () => {
  test('should add values to hash', () => {
    return transform('hash:f.1', testData).then(acc => {
      expect(acc.value).toEqual({
        h0: 0,
        h1: 1,
        h2: 2,
        h3: 3
      })
    })
  })
  test('it should do nothing if addValues is empty', () => {
    return transform('hash:f.2', testData).then(acc => {
      expect(acc.value).toEqual({ g1: 1 })
    })
  })
})

describe('entity.hash.compose', () => {
  test('should resolved composed modifiers', () => {
    return transform('hash:h.1', testData).then(acc => {
      expect(acc.value).toEqual({
        e3: 'eThree'
      })
    })
  })
})
