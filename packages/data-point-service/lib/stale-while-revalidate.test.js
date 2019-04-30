/* eslint-env jest */
const _ = require('lodash')

const mockDebug = jest.fn()
jest.mock('debug', () => {
  return () => mockDebug
})

const mockLocalAdd = jest.fn()
const mockLocalRemove = jest.fn()
require('./revalidation-store')
jest.mock('./revalidation-store', () => {
  return {
    create: () => ({
      add: mockLocalAdd,
      remove: mockLocalRemove,
      clear: () => {}
    })
  }
})

const RedisController = require('./redis-controller')

const StaleWhileRevalidate = require('./stale-while-revalidate')

beforeEach(() => {
  jest.resetModules()
  delete require.cache[require.resolve('./stale-while-revalidate')]
})

describe('revalidationExternalFactory', () => {
  describe('add - add remote revalidation flag', () => {
    it('should call setSWRControlEntry', () => {
      const mockSetSWRControlEntry = jest
        .spyOn(RedisController, 'setSWRControlEntry')
        .mockImplementation(() => true)

      const external = StaleWhileRevalidate.revalidationExternalFactory(
        'service'
      )

      expect(external.add('entryKey', 'ttl')).toEqual(true)
      expect(mockSetSWRControlEntry).toBeCalledWith(
        'service',
        'entryKey',
        'ttl',
        StaleWhileRevalidate.SWR_CONTROL_REVALIDATING
      )
    })
  })

  describe('remove - remove remote revalidation flag', () => {
    it('should call setSWRControlEntry', () => {
      const mockDeleteSWRControlEntry = jest
        .spyOn(RedisController, 'deleteSWRControlEntry')
        .mockImplementation(() => true)

      const external = StaleWhileRevalidate.revalidationExternalFactory(
        'service'
      )

      expect(external.remove('entryKey', 'ttl')).toEqual(true)
      expect(mockDeleteSWRControlEntry).toBeCalledWith('service', 'entryKey')
    })
  })

  describe('exists - check if remote revalidation flag exists', () => {
    it('should return true if value is not undefined', () => {
      const mockGetSWRControlEntry = jest
        .spyOn(RedisController, 'getSWRControlEntry')
        .mockImplementation(() => Promise.resolve('foo'))

      const external = StaleWhileRevalidate.revalidationExternalFactory(
        'service'
      )

      return external.exists('entryKey').then(result => {
        expect(result).toEqual(true)
        expect(mockGetSWRControlEntry).toBeCalledWith('service', 'entryKey')
      })
    })

    it('should return false if value is undefined', () => {
      jest
        .spyOn(RedisController, 'getSWRControlEntry')
        .mockImplementation(() => Promise.resolve(undefined))

      const external = StaleWhileRevalidate.revalidationExternalFactory(
        'service'
      )

      return external.exists('entryKey').then(result => {
        expect(result).toEqual(false)
      })
    })
  })
})

describe('addEntry', () => {
  it('should add an entry to redis', () => {
    const mockSetSWRStaleEntry = jest
      .spyOn(RedisController, 'setSWRStaleEntry')
      .mockImplementation(() => Promise.resolve(true))

    const mockSetSWRControlEntry = jest
      .spyOn(RedisController, 'setSWRControlEntry')
      .mockImplementation(() => Promise.resolve(true))

    const cache = {
      ttl: '10s',
      staleWhileRevalidateTtl: '20s'
    }

    return StaleWhileRevalidate.addEntry(
      'service',
      'entryKey',
      'value',
      cache
    ).then(result => {
      expect(mockSetSWRStaleEntry).toBeCalledWith(
        'service',
        'entryKey',
        'value',
        cache.staleWhileRevalidateTtl
      )
      expect(mockSetSWRControlEntry).toBeCalledWith(
        'service',
        'entryKey',
        cache.ttl,
        StaleWhileRevalidate.SWR_CONTROL_STALE
      )
    })
  })
})

describe('getEntry', () => {
  it('should add an entry to redis', () => {
    const getSWRStaleEntry = jest
      .spyOn(RedisController, 'getSWRStaleEntry')
      .mockImplementation(() => Promise.resolve(true))

    return StaleWhileRevalidate.getEntry('service', 'entryKey', 'value').then(
      result => {
        expect(getSWRStaleEntry).toBeCalledWith('service', 'entryKey')
      }
    )
  })
})

describe('addRevalidationFlags', () => {
  it('should add local and external flags', () => {
    const revalidation = {}
    _.set(revalidation, 'local.add', jest.fn())
    _.set(revalidation, 'external.add', jest.fn(() => Promise.resolve(true)))

    return StaleWhileRevalidate.addRevalidationFlags(
      revalidation,
      'entryKey',
      '10s'
    ).then(() => {
      expect(revalidation.local.add).toBeCalledWith('entryKey', '10s')
      expect(revalidation.external.add).toBeCalledWith('entryKey', '10s')
    })
  })
})

describe('clearAllRevalidationFlags', () => {
  it('should clear local and external flags', () => {
    const revalidation = {}
    _.set(revalidation, 'local.remove', jest.fn())
    _.set(revalidation, 'external.remove', jest.fn(() => Promise.resolve(true)))

    return StaleWhileRevalidate.clearAllRevalidationFlags(
      revalidation,
      'entryKey'
    ).then(() => {
      expect(revalidation.local.remove).toBeCalledWith('entryKey')
      expect(revalidation.external.remove).toBeCalledWith('entryKey')
    })
  })
})

describe('getRevalidationState', () => {
  it('should get local and external flag states', () => {
    const revalidation = {}
    _.set(revalidation, 'local.exists', jest.fn(() => 'localState'))
    _.set(
      revalidation,
      'external.exists',
      jest.fn(() => Promise.resolve(false))
    )

    return StaleWhileRevalidate.getRevalidationState(
      revalidation,
      'entryKey'
    ).then(result => {
      expect(result.hasExternalEntryExpired).toEqual(true)
      expect(result.isRevalidatingLocally).toBeInstanceOf(Function)
      expect(result.isRevalidatingLocally()).toEqual('localState')
    })
  })

  it('should return hasExternalEntryExpired === true if exists == false', () => {
    const revalidation = {}
    _.set(revalidation, 'local.exists', jest.fn(() => 'localState'))
    _.set(revalidation, 'external.exists', jest.fn(() => Promise.resolve(true)))

    return StaleWhileRevalidate.getRevalidationState(
      revalidation,
      'entryKey'
    ).then(result => {
      expect(result.hasExternalEntryExpired).toEqual(false)
      expect(result.isRevalidatingLocally).toBeInstanceOf(Function)
      expect(result.isRevalidatingLocally()).toEqual('localState')
    })
  })
})

describe('createRevalidationManager', () => {
  it('should create revalidation controller', () => {
    const revalidation = StaleWhileRevalidate.createRevalidationManager()

    expect(revalidation).toHaveProperty('local.add')
    expect(revalidation).toHaveProperty('external.add')
  })
})

describe('create', () => {
  it('should create stale while revalidate controller', () => {
    const swr = StaleWhileRevalidate.create()
    expect(swr).toMatchSnapshot()
  })
})
