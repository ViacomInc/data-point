/* eslint-disable */
/* eslint-disable prettier */

// prettier-ignore
const entities = {
  'reducer:a': `$.`,
  'reducer:b': `$. | foo | $.`,
  'reducer:c': `foo | bar | baz`,
  'reducer:d': '$.',
  'reducer:e': '$. | foo',
  'reducer:f': '$. | $. | $.',
  'reducer:g': 'foo | bar | baz',
  nested: {
    object: {
      a: '$. | $.'
    },
    array: ['$.', '$.', '$.']
  }
}

dataPoint.transform("foo | $. | baz | $.");
