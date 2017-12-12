module.exports = {
  'transform:a0': '$message',
  'transform:a1': [
    'transform:a0',
    (acc, next) => next(null, acc.value.toUpperCase())
  ],
  'transform:a2': [
    'transform:a0',
    acc => acc.resolveTransformWith('resolved value'),
    (acc, next) => next(null, 'never returned value')
  ],
  'transform:a3': [
    'transform:a0',
    acc => acc.resolveTransformWith('resolved value'),
    acc => 'some other value',
    acc => acc.resolveTransformWith('never resolved value'),
    (acc, next) => next(null, 'never returned value')
  ],
  'transform:a4': [
    'transform:a0',
    acc => acc.resolveTransformWith(false),
    acc => acc.resolveTransformWith('never resolved value'),
    (acc, next) => next(null, 'never returned value')
  ],
  'transform:a5': [
    'transform:a0',
    acc => acc.resolveTransformWith(undefined),
    acc => 'some other value',
    acc => acc.resolveTransformWith('never resolved value'),
    (acc, next) => next(null, 'never returned value')
  ],
  'transform:a6': [
    'transform:a0',
    acc => acc.resolveTransformWith(null),
    acc => 'some other value',
    acc => acc.resolveTransformWith('never resolved value'),
    (acc, next) => next(null, 'never returned value')
  ]
}
