/* eslint-env jest */
'use strict'

const normalizeEntities = require('./normalize-entities')
const _ = require('lodash')

let entities
let validEnties

beforeAll(() => {
  entities = {
    'hash:base': {
      before: '$before',
      value: '$a',
      params: {
        t: 'base'
      }
    },
    'hash:extendA -> hash:base': {
      params: {
        t: 'extendA'
      }
    },
    'hash:extendB -> hash:base': {
      value: '$c',
      after: '$a'
    },
    'hash:extendC -> hash:extendB': {
      value: '$a',
      params: {
        t: 1
      }
    },
    'hash:extendD -> hash:extendX': {
      value: '$a',
      params: {
        t: 1
      }
    },
    'hash:extendE -> hash:extendE': {
      value: '$a',
      params: {
        t: 1
      }
    },
    'hash:extendF -> hash:extendF1': {
      value: '$a',
      params: {
        t: 1
      }
    },
    'hash:extendF1 -> hash:extendF': {
      value: '$a',
      params: {
        t: 1
      }
    }
  }

  validEnties = _.omit(entities, [
    'hash:extendD -> hash:extendX',
    'hash:extendE -> hash:extendE',
    'hash:extendF -> hash:extendF1',
    'hash:extendF1 -> hash:extendF'
  ])
})

describe('normalizeSpec', () => {
  test('expand entity spec with no parents', () => {
    const result = normalizeEntities.normalizeSpec('hash:base', entities)
    expect(result).toHaveProperty('id', 'hash:base')
    expect(result).toHaveProperty('parentId', undefined)
    expect(result).toHaveProperty('spec', entities['hash:base'])
    expect(result).toHaveProperty('ancestors', [])
  })
  test('extracts spec that extends parent', () => {
    const result = normalizeEntities.normalizeSpec(
      'hash:extendA -> hash:base',
      entities
    )
    expect(result).toHaveProperty('id', 'hash:extendA')
    expect(result).toHaveProperty('parentId', 'hash:base')
    expect(result).toHaveProperty('spec', entities['hash:extendA -> hash:base'])
    expect(result).toHaveProperty('ancestors', [])
  })
})

describe('normalizeEntitySpecs', () => {
  test('normalize with no parent', () => {
    const result = normalizeEntities.normalizeEntitySpecs(entities)
    expect(result['hash:base']).toHaveProperty('id', 'hash:base')
  })
  test('normalize with parent', () => {
    const result = normalizeEntities.normalizeEntitySpecs(entities)
    expect(result['hash:extendA']).toHaveProperty('id', 'hash:extendA')
  })
})

describe('getParentSpec', () => {
  let specs
  beforeAll(() => {
    specs = normalizeEntities.normalizeEntitySpecs(entities)
  })
  test('false if no parent', () => {
    const result = normalizeEntities.getParentSpec(specs['hash:base'], specs)
    expect(result).toBe(false)
  })
  test('throw error if parent does not exists', () => {
    expect(() => {
      normalizeEntities.getParentSpec(specs['hash:extendD'], specs)
    }).toThrow(/\bhash:extendD\b.*?\bhash:extendX\b/)
  })
  test('parent if found', () => {
    const result = normalizeEntities.getParentSpec(specs['hash:extendA'], specs)
    expect(result).toHaveProperty('id', 'hash:base')
  })
})

describe('getAncestors', () => {
  let specs
  beforeAll(() => {
    specs = normalizeEntities.normalizeEntitySpecs(entities)
  })
  test('throw if extends itself', () => {
    expect(() => {
      normalizeEntities.getAncestors(specs['hash:extendE'], specs)
    }).toThrow(/\bhash:extendE\b.*?\bcircle\b/)
  })
  test('throw if extension creates circle dependency', () => {
    expect(() => {
      normalizeEntities.getAncestors(specs['hash:extendE'], specs)
    }).toThrow(/\bhash:extendE\b.*?\bcircle\b/)
  })
  test('ancestor list is empty if none', () => {
    const result = normalizeEntities.getAncestors(specs['hash:base'], specs)
    expect(result).toEqual([])
  })
  test('ancestor list is contains parents', () => {
    const result = normalizeEntities.getAncestors(specs['hash:extendC'], specs)
    expect(result).toEqual(['hash:extendB', 'hash:base'])
  })
})

describe('extendSpec', () => {
  let specs
  beforeAll(() => {
    specs = normalizeEntities.normalizeEntitySpecs(entities)
  })
  test('parent if found', () => {
    const ancestors = ['hash:extendB', 'hash:base']
    const result = normalizeEntities.extendSpec(
      specs['hash:extendC'].spec,
      ancestors,
      specs
    )
    expect(result).toEqual({
      before: '$before',
      after: '$a',
      value: '$a',
      params: {
        t: 1
      }
    })
  })
})

describe('extendSpecItem', () => {
  test('extend spec', () => {
    const specs = normalizeEntities.normalizeEntitySpecs(validEnties)
    const result = normalizeEntities.extendSpecItem(
      specs['hash:extendC'],
      specs
    )
    expect(result.spec).toEqual({
      before: '$before',
      after: '$a',
      value: '$a',
      params: {
        t: 1
      }
    })
  })
})

describe('extendSpecs', () => {
  test('extends all entity specs', () => {
    const specs = normalizeEntities.normalizeEntitySpecs(validEnties)
    const result = normalizeEntities.extendSpecs(specs)
    expect(result['hash:extendC'].spec).toEqual({
      before: '$before',
      after: '$a',
      value: '$a',
      params: {
        t: 1
      }
    })
  })
})

describe('normalize', () => {
  test('normalizes entity specs', () => {
    const result = normalizeEntities.normalize(validEnties)
    expect(result['hash:extendC'].spec).toEqual({
      before: '$before',
      after: '$a',
      value: '$a',
      params: {
        t: 1
      }
    })
  })
})
