/* eslint-env jest */

const InMemory = require('./in-memory')

describe('set', () => {
  let cache
  beforeEach(() => (cache = { entries: {} }))
  test('It should set an entry', () => {
    InMemory.set(cache, 'test', 'test', '10m')
    expect(cache.entries['test']).toHaveProperty('value', 'test')
    expect(cache.entries['test']).toHaveProperty('ttl', '10m')
  })
})

describe('get', () => {
  let cache
  beforeEach(() => (cache = { entries: {} }))
  test('It should return undefined if no entry', () => {
    const result = InMemory.get(cache, 'test')
    expect(result).toBeUndefined()
  })
  test('It should get an entry', () => {
    cache.entries['test'] = { value: 'test' }
    const result = InMemory.get(cache, 'test')
    expect(result).toEqual('test')
  })
})

describe('del', () => {
  let cache
  beforeEach(() => (cache = { entries: {} }))
  test('It should remove entry', () => {
    cache.entries['test'] = { value: 'test' }
    InMemory.del(cache, 'test')
    expect(cache.entries['test']).toBeUndefined()
  })
})

describe('swipeTick', () => {
  let cache
  const warn = console.warn
  beforeEach(() => (cache = { entries: {} }))
  afterAll(() => {
    console.warn = warn
  })
  test('it should remove all keys if length is more than permited', () => {
    const entry = { value: 'test1', ttl: 1000, created: Date.now() }
    for (var index = 0; index < 10001; index++) {
      cache.entries[`${index}key`] = entry
    }
    console.warn = jest.fn()
    InMemory.swipeTick(cache)
    const keys = Object.keys(cache.entries)
    expect(keys).toHaveLength(0)
    expect(console.warn).toBeCalled()
  })

  test('it should remove keys - on each tick', () => {
    const now = 0

    cache.entries['test1'] = { value: 'test1', ttl: 10, created: now }
    cache.entries['test2'] = { value: 'test2', ttl: 20, created: now }

    const originalDateNow = Date.now

    const swipes = []

    Date.now = () => 5
    InMemory.swipeTick(cache)
    swipes.push(Object.keys(cache.entries))

    Date.now = () => 11
    InMemory.swipeTick(cache)
    swipes.push(Object.keys(cache.entries))

    Date.now = () => 21
    InMemory.swipeTick(cache)
    swipes.push(Object.keys(cache.entries))

    expect(swipes[0]).toHaveLength(2)
    expect(swipes[1]).toHaveLength(1)
    expect(swipes[2]).toHaveLength(0)

    Date.now = originalDateNow
  })
})

describe('bootstrap', () => {
  let cache
  beforeEach(() => (cache = { entries: {} }))
  test('It should bootstrap', () => {
    const newCache = InMemory.bootstrap(cache)
    clearInterval(newCache.swipeTimerId)
    expect(typeof newCache.set === 'function').toBeTruthy()
    expect(typeof newCache.get === 'function').toBeTruthy()
    expect(typeof newCache.del === 'function').toBeTruthy()
    expect(typeof newCache.swipe === 'function').toBeTruthy()
    expect(newCache.swipeTimerId).not.toBeNaN()
  })
})

describe('create', () => {
  test('It should create new Cache', () => {
    const newCache = InMemory.create()
    clearInterval(newCache.swipeTimerId)
    expect(newCache.swipeTimerId).not.toBeNaN()
  })
})
