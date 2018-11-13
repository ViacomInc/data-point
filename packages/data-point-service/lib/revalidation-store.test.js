/* eslint-env jest */

const mockDebug = jest.fn()
jest.mock('debug', () => {
  return () => mockDebug
})

const mockThrottle = jest.fn(fn => fn)
jest.mock('lodash/throttle', () => {
  return mockThrottle
})
jest.mock('lodash/throttle', () => {
  return mockThrottle
})

describe('add', () => {
  it('should add key if store size is less than MAX_STORE_SIZE', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    RevalidationStore.add(store, 10, 'test', 1000)
    const result = store.get('test')
    expect(typeof result.created).toEqual('number')
    expect(result.ttl).toEqual(1000)
  })
  it('should not add key if store size is more than MAX_STORE_SIZE', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('foo', 'bar')
    store.set('baz', 'bar')
    const result = RevalidationStore.add(store, 1, 'test', 1000)
    expect(store.get('test')).toBeUndefined()
    expect(result).toEqual(false)
  })
})

describe('remove', () => {
  it('should remove a key from the map', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('foo', 'bar')
    RevalidationStore.remove(store, 'foo')
    expect(store.get('foo')).toBeUndefined()
  })
})

describe('exists', () => {
  it('should check if key exists and has not expired', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('foo', { created: Date.now() + 100000, ttl: 100 })
    expect(RevalidationStore.exists(store, 'foo')).toEqual(true)
  })

  it('should check if key does not exists', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    expect(RevalidationStore.exists(store, 'foo')).toEqual(false)
  })

  it('should check if key has expired', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('foo', [Date.now() - 100000, 100])
    expect(RevalidationStore.exists(store, 'foo')).toEqual(false)
  })
})

describe('clear', () => {
  let mockDate

  const NOW = 1000

  beforeEach(() => {
    mockDate = jest.spyOn(Date, 'now').mockImplementation(() => NOW)
    mockDebug.mockReset()
  })

  afterEach(() => {
    mockDate.mockRestore()
  })

  it('should not removed keys that have not expired', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('t1', [NOW, 2]) // has not expired
    RevalidationStore.clear(store)
    expect(store.size).toEqual(1)
  })

  it('should remove expired keys', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('t2', { created: NOW - 10, ttl: 2 }) // expired
    RevalidationStore.clear(store)
    expect(store.size).toEqual(0)
    expect(mockDebug).toBeCalled()
    expect(mockDebug.mock.calls).toMatchSnapshot()
  })

  it('should remove only expired keys', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = new Map()
    store.set('t1', { created: NOW, ttl: 2 }) // has not expired
    store.set('t2', { created: NOW - 10, ttl: 2 }) // expired
    RevalidationStore.clear(store)
    expect(store.size).toEqual(1)
    expect(store.get('t1')).not.toBeUndefined()
  })
})

describe('create', () => {
  let mockDate

  const NOW = 1000

  beforeEach(() => {
    mockDate = jest.spyOn(Date, 'now').mockImplementation(() => NOW)
    mockDebug.mockReset()
  })

  afterEach(() => {
    mockDate.mockRestore()
  })

  it('should create a new store that matches snapshot api', () => {
    const RevalidationStore = require('./revalidation-store')
    const store = RevalidationStore.create()
    expect(store).toMatchSnapshot()
  })

  describe('implementation', () => {
    it('should add new entry', () => {
      const RevalidationStore = require('./revalidation-store')
      const store = RevalidationStore.create()

      store.add('t1', 100)
      expect(store.store.get('t1')).toEqual({ created: NOW, ttl: 100 })
    })

    it('should remove entry', () => {
      const RevalidationStore = require('./revalidation-store')
      const store = RevalidationStore.create()

      store.remove('t1')
      expect(store.store.get('t1')).toBeUndefined()
    })

    it('should check if entry exists', () => {
      const RevalidationStore = require('./revalidation-store')
      const store = RevalidationStore.create()

      store.add('t2', 100)
      expect(store.exists('t2')).toEqual(true)
      expect(store.exists('t1')).toEqual(false)

      // check expired
      store.add('t3', -100)
      expect(store.exists('t3')).toEqual(false)
    })

    it('should clear entries', () => {
      const RevalidationStore = require('./revalidation-store')
      const store = RevalidationStore.create()

      store.add('t1', 100)
      store.add('t2', -100)

      store.clear()
      expect(store.store).toMatchSnapshot()
    })
  })
})
