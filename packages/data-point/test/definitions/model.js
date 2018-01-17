module.exports = {
  'model:a.0': {},
  'model:a.1': {
    value: acc => acc.value + 5
  },
  'model:a.2': {
    value: acc => acc.value + 5
  },

  // entities c.* are for testing
  // inputType and outputType.
  'model:c.0': {
    inputType: 'number'
  },

  'model:c.1': {
    outputType: 'string'
  },

  'model:c.2': {
    // test that its immutable
    outputType: acc => {
      return 'cant happen'
    }
  },

  'model:c.3': {
    // custom type checking
    inputType: acc => {
      if (typeof acc.value !== 'string') {
        throw new Error('custom type error')
      }

      return acc.value
    }
  }
}
