/* eslint-disable */
/* eslint-disable prettier */

// prettier-ignore
const entities = {
  'transform:a': `$.`,
  'transform:b': `$. | foo | $.`,
  'transform:c': `foo | bar | baz`,
  'transform:d': '$.',
  'transform:e': '$. | foo',
  'transform:f': '$. | $. | $.',
  'transform:g': 'foo | bar | baz',
  nested: {
    object: {
      a: '$. | $.'
    },
    array: ['$.', '$.', '$.']
  }
}

dataPoint.transform('foo | $. | baz | $.')
