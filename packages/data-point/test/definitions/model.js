module.exports = {
  'model:a.0': {},
  'model:a.1': {
    value: value => value + 5
  },
  'model:a.2': {
    value: value => value + 5
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
    outputType: value => {
      return 'cant happen'
    }
  },

  'model:c.3': {
    // custom type checking
    inputType: value => {
      if (typeof value !== 'string') {
        throw new Error('custom type error')
      }

      return value
    }
  },

  'model:c.4': {
    after: input => 1,
    outputType: 'string'
  },

  'model:c.5': {
    before: input => 1,
    outputType: 'string'
  },

  'model:c.6': {
    before: () => {
      throw new Error()
    },
    error: () => 'error string',
    outputType: 'string'
  },

  'model:c.7': {
    before: () => {
      throw new Error()
    },
    error: () => 1,
    outputType: 'string'
  },

  'model:c.8': {
    before: () => {
      throw new Error('error from before method')
    },
    error: error => {
      throw error
    },
    outputType: 'string'
  }
}
