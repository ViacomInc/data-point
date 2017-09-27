# DataPoint

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=ci)](https://travis-ci.org/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=ci)](https://coveralls.io/github/ViacomInc/data-point?branch=ci)

> JavaScript Utility for collecting, processing and transforming data.

DataPoint helps you reason with and streamline your data processing layer. With it you can collect, process, and transform data from multiple sources, and deliver the output in a tailored format to your end consumer. 

**Prerequisites**

Node v4 LTS or higher

**Installing**

```bash
npm install --save data-point
```

## Table of Contents

- [Getting Started](#getting-started)
- [DataPoint.create](#api-data-point-create)
- [Transforms](#transforms)
  - [dataPoint.transform](#api-data-point-transform)
  - [TransformExpression](#transform-expression)
  - [TransformMap](#transform-map)
- [Reducers](#reducers)
  - [Accumulator](#accumulator)
  - [PathReducer](#path-reducer)
  - [FunctionReducer](#function-reducer)
  - [Higher Order Reducers](#higher-order-reducers)
  - [Chained Reducers](#chained-reducers)
  - [EntityReducer](#entity-reducer)
  - [Collection Mapping](#reducer-collection-mapping)
- [Entities](#entities)
  - [dataPoint.addEntities](#api-data-point-add-entities)
  - [Built-in entities](#built-in-entities)
    - [Transform](#transform-entity)
    - [Entry](#entry-entity)
    - [Source](#source-entity)
    - [Hash](#hash-entity)
    - [Collection](#collection-entity)
    - [Control](#control-entity)
    - [Schema](#schema-entity)
  - [Entity ComposeReducer](#entity-compose-reducer)
  - [Extending Entities](#extending-entities)
- [dataPoint.use](#api-data-point-use)
- [dataPoint.addValue](#api-data-point-add-value)
- [Custom Entity Types](#custom-entity-types)
- [Integrations](#integrations)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

This section is meant to get you started with basic concepts of DataPoint's API, for detailed API Documentation you can jump into [DataPoint.create](#api-data-point-create) section and move from there.

### Hello World Example

Trivial example of transforming an given **input** with a [FunctionReducer](#function-reducer).

```js
const DataPoint = require('data-point')
// create DataPoint instance
const dataPoint = DataPoint.create()

// reducer function that appends 'World' to the
// value of the accumulator
const reducer = (acc, next) => {
  next(null, acc.value + ' World')
}

// applies reducer to input
dataPoint.transform(reducer, 'Hello').then((acc) => {
  console.log(acc.value) // 'Hello World'
})
```

Example at: [examples/hello-world.js](examples/hello-world.js)

## Async example

Using [swapi.co](https://swapi.co) amazing api, the script below will get information about a planet and the residents of that planet.

```js
// create DataPoint Instance
const dataPoint = require('data-point').create()

// add entities to dataPoint instance
dataPoint.addEntities({
  // remote source
  'source:Planet': {
    // {value.planetId} injects the value from the accumulator
    url: 'https://swapi.co/api/planets/{value.planetId}'
  },

  // hash entity to resolve a Planet
  'hash:Planet': {
    // initial value will be the resolution of source:Planet
    value: 'source:Planet',
    // each Key of the result gets mapped
    mapKeys: {
      // simple Object notation to extract data
      name: '$name',
      // residents is an array or urls, each
      // will get mapped to a hash:Resident
      residents: '$residents | hash:Resident[]'
    }
  },

  // dynamic source entity, the full value of passed to it
  // will become its url
  'source:Resident': {
    url: '{value}'
  },

  // hash entity to resolve a Resident
  'hash:Resident': {
    // initial value will be the resolution of source:Resident
    value: 'source:Resident',
    // each key gets mapped
    mapKeys: {
      name: '$name',
      gender: '$gender',
      birthYear: '$birth_year'
    }
  }
})

const data = {
  planetId: 1
}

dataPoint.transform('hash:Planet', data).then((acc) => {
  console.log(acc.value)
  /*
  { name: 'Tatooine',
  population: 200000,
  residents:
   [ { name: 'Luke Skywalker', gender: 'male', birthYear: '19BBY' },
     { name: 'C-3PO', gender: 'n/a', birthYear: '112BBY' },
     { name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY' },
     { name: 'Owen Lars', gender: 'male', birthYear: '52BBY' },
     { name: 'Beru Whitesun lars',
       gender: 'female',
       birthYear: '47BBY' },
     { name: 'R5-D4', gender: 'n/a', birthYear: 'unknown' },
     { name: 'Biggs Darklighter', gender: 'male', birthYear: '24BBY' },
     { name: 'Anakin Skywalker',
       gender: 'male',
       birthYear: '41.9BBY' },
     { name: 'Shmi Skywalker', gender: 'female', birthYear: '72BBY' },
     { name: 'Cliegg Lars', gender: 'male', birthYear: '82BBY' } ] }
  */
})
```

Example at: [examples/async-example.js](examples/async-example.js)

## <a name="api-data-point-create">DataPoint.create()</a>

Static method that creates a DataPoint instance object.

To set up DataPoint, you must first create a DataPoint object (that is, an instance of DataPoint) and specify options (if any).

**SYNOPSIS**

```js
DataPoint.create([options])
```

**Arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *options* | `Object` (_optional_) | This parameter is optional, as are its properties (reducers, values, and entities). You may configure the instance later through the instance's API. |

The following table describes the properties of the `options` argument. 

| Property | Type | Description |
|:---|:---|:---|
| *values* | `Object` | Hash with values you want exposed to every [reducer](#reducers) |
| *entities* | `Object` | Application's defined [entities](#entities) |
| *entityTypes* | `Object` | [Custom Entity Types](#custom-entity-types) |
| *reducers* | `Object` | Reducers you want exposed to DataPoint transforms |

**RETURNS**

DataPoint instance.

<a name="setup-examples">**EXAMPLES**</a>

Create a DataPoint object without configuring options:

```js
const DataPoint = require('data-point')
const dataPoint = DataPoint.create()
```

Create the DataPoint object and set options argument:

```js
const DataPoint = require('data-point')
const dataPoint = DataPoint.create({
  values: require('./values'),
  entities: require('./entities')
})
```

## <a name="transforms">Transform</a>

### <a name="api-data-point-transform">dataPoint.transform()</a>

Execute a [TransformExpression](#transform-expression) against a given _input_ value.

**SYNOPSIS**

```js
dataPoint.transform(transformExpression, value, options) // promise
dataPoint.transform(transformExpression, value, options, done) // nodejs callback function
```

This method will return a **Promise** if `done` is omitted.

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *transformExpression* | [TransformExpression](#transform-expression) | Valid Transform Expression |
| *value* | `Object` | Value that you want to transform. If **none**, pass `null` or empty object `{}`. |
| *options* | [TransformOptions](#transform-options) | Options within the scope of the current transformation |
| *done* | `function` _(optional)_ | Error-first callback [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks) that has the arguments `(error, result)`, where `result` contains the final resolved [Accumulator](#accumulator). The actual transformation result will be inside the `result.value` property. |

**<a name="transform-options">TransformOptions</a>**

Options within the scope of the current transformation.

The following table describes the properties of the `options` argument. 

| Property | Type | Description |
|:---|:---|:---|
| *locals* | `Object` | Hash with values you want exposed to every reducer. See [example](#acc-locals-example). |
| *trace* | `boolean` | Set this to `true` to trace the entities and the time each one is taking to execute. **Use this option for debugging.** |

### <a name="transform-expression">Transform Expression</a>

**Description**

A **Transform Expression** object consists of a chain containing one or more [Reducers](#reducers), where the result (transformed data) of one reducer gets passed as input data to the next reducer in the chain. All reducers are executed serially and **asynchronously**.

Transform Expressions can be represented in different ways: 

**String transform:**

```js
const t = '$.'
const t = '$name'
const t = '$results[0].users | app.validateUsers | model:User[]'
const t = 'model:User[] | app.validateUsers | $[0]'

// which could later be used as:

dataPoint.transform(t, someInput).then((acc) => {
  console.log(acc.value) // resolved result
})
```

**Single Function Reducer:**

```js
const t = (acc, next) => { ... }
```

**Array transform with mixed reducers:**

```js
// just strings
const t = ['$image[0]', 'model:Image']
// string & Function reducers
const t = ['$image[0].url', (acc, next) => { ... }]
// piped strings & functions
const t = ['$results[0].users | model:Users', (acc, next) => { ... }]

// which could be later used as:

dataPoint.transform(t, someInput).then((acc) => {
  console.log(acc.value) // resolved result
})
```

### <a name="transform-map">TransformMap</a>

This structure allows you to map key/value pairs, where each value is of type [TransformExpression](#transform-expression).

**SYNOPSIS**

```js
{
  key1: TransformExpression,
  key2: TransformExpression,
  ...
}
```

## <a name="reducers">Reducer</a>

Reducers are used to build a [TransformExpression](#transform-expression) object.

Reducers transform values, and are executed both **serially** &amp; **asynchronously**.

DataPoint supports the following reducer types:

1. [PathReducer](#path-reducer)
2. [FunctionReducer](#function-reducer)
3. [EntityReducer](#entity-reducer)

### <a name="accumulator">Accumulator</a>

This object is passed to reducers and to middleware callbacks; it contains contextual information about the current transformation (or middleware) being executed. 

The `Accumulator.value` property is the data source from which you want to apply transformations. This property **SHOULD** be treated as read-only immutable **-never to be transformed-** object. Use it as your initial source and create a new object from it. This ensures that your reducers are [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976#.r4iqvt9f0); pure functions produce no side effects. 

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *value*  | `Object` | Value to be transformed. |
| *initialValue*  | `Object` | Initial value passed to the an entity. You can use this value as a reference to the initial value passed to your Entity before any reducer was applied. |
| *values*  | `Object` | Access to the values stored via [dataPoint.addValue](#api-data-point-add-value). |
| *params*  | `Object` | Value of the current Entity's params property. |
| *locals*  | `Object` | Value passed from the `options` _argument_ when executing [dataPoint.transform](#api-data-point-transform). |
| *reducer*  | `Object` | Information relative to the current [Reducer](#reducers) being executed. |

### <a name="path-reducer">PathReducer</a>

PathReducer is a `string` value that extracts a path from the current [Accumulator](#accumulator)`.value` . It uses lodash's [_.get](https://lodash.com/docs/4.17.4#get) behind the scenes.

**SYNOPSIS**

```js
'$[.|..|<path>]'
```

**OPTIONS**

| Option | Description |
|:---|:---|
| *.* | Reference to current `accumulator.value`. |
| *..* | Gives you full access to current `accumulator`. |
| *path* | Simple Object path notation to extract a path from current `accumulator.value`. |

#### <a name="root-path">Root path $.</a>

**Example:**

Gets the entire value

```js
const dataPoint = require('data-point').create()

const input = {
  a: {
    b: [
      'Hello World'
    ]
  }
}

dataPoint.transform('$', input).then((acc) => {
  assert.equal(acc.value, input)
})
```

#### <a name="accumulator-reference">Access accumulator reference $..</a>

**Example:**

Access the reference of the accumulator.

```js
const dataPoint = require('data-point').create()

const input = {
  a: {
    b: [
      'Hello World'
    ]
  }
}

dataPoint.transform('$..value', input).then((acc) => {
  assert.equal(acc.value, input)
})
```

#### <a name="object-path">Object Path</a>

**Example:**

Traverse an object's structure

```js
const dataPoint = require('data-point').create()

const input = {
  a: {
    b: [
      'Hello World'
    ]
  }
}

dataPoint.transform('$a.b[0]', input).then((acc) => {
  assert.equal(acc.value, 'Hello World')
})
```

Example at: [examples/reducer-path.js](examples/reducer-path.js)

### <a name="function-reducer">FunctionReducer</a>

A FunctionReducer allows you to execute an asynchronous block of code. Its first parameter is an [Accumulator](#accumulator) object. The second is an error-first callback ([Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks)) that has the arguments `(error, value)`, where value will be the _value_ passed to the _next_ transform; that value will eventually be the value of the fully resolved transformation.

**SYNOPSIS**

```js
const name = (acc:Accumulator, next:function) => {
  next(error:Error, newValue:*)
}
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *acc* | [Accumulator](#accumulator) | Holds information regarding the current reducer's execution. The main property is `acc.value`, which is the current reducer's value. |
| *next* | `Function(error,value)` | [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks), where `value` is the value to be passed to the next reducer.

**EXAMPLE:**

```js
const reducer = (acc, next) => {
  next(null, acc.value + ' World')
}

dataPoint.transform(reducer, 'Hello').then((acc) => {
  assert.equal(acc.value, 'Hello World')
  console.log(acc.value)
})
```

Example at: [examples/reducer-function.js](examples/reducer-function.js)

Throw an error from the reducer:

```js
const throwError = (acc, next) => {
  // passing first argument will be
  // handled as an error by the transform
  next(new Error('oh noes!!'))
}

dataPoint.transform(throwError, 'Hello').catch((error) => {
  console.assert(error instanceof Error)
  console.log(error.toString()) // 'Error: oh noes!!'
})
```

Example at: [examples/reducer-function-error.js](examples/reducer-function-error.js)

### <a name="higher-order-reducers">Higher Order Reducers</a>

Higher Order Reducers are expected to be [Higher-order Functions](https://en.wikipedia.org/wiki/Higher-order_function). This means that a higher order reducer **MUST** return a [FunctionReducer](#function-reducer).

```js
const name = (param1, param2, ...) => (acc:Accumulator, next:function) => {
  next(error:Error, newValue:*)
}
```

**EXAMPLE**

```js
const addStr = (value) => (acc, next) => {
  next(null, acc.value + value)
}

dataPoint.transform(addStr(' World!!'), 'Hello').then((acc) => {
  assert.equal(acc.value, 'Hello World!!')
  console.log(acc.value)
})
```

Example at: [examples/reducer-function-closure.js](examples/reducer-function-closure.js)

### <a name="chained-reducers">Chained Reducers</a>

To execute multiple reducers serially, you may pass them wrapped in an array structure.

```js
const input = {
  a: {
    b: 'Hello World'
  }
}

const toUpperCase = (acc, next) => {
  next(null, acc.value.toUpperCase())
}

dataPoint.transform(['$a.b', toUpperCase], input).then((acc) => {
  assert.equal(acc.value, 'HELLO WORLD')
})
```

Example at: [examples/reducer-array-mixed.js](examples/reducer-array-mixed.js)

The following example extracts the array from the input object, gets its max value, and multiplies that value by a given number.

```js
const multiplyBy = (factor) => (acc, next) => {
  next(null, acc.value * factor)
}

const getMax = () => (acc, next) => {
  const result = Math.max.apply(null, acc.value)
  next(null, result)
}

dataPoint.transform(['$a.b.c', getMax(), multiplyBy(10)], input).then((acc) => {
  assert.equal(acc.value, 30)
  console.log(acc.value)
})
```

Example at: [examples/reducer-array-mixed-2.js](examples/reducer-array-mixed-2.js)

Examples of reducers that were used for the unit tests:
[Unit Test Reducers](test/utils/reducers.js)

### <a name="entity-reducer">EntityReducer</a>

An EntityReducer is the actual implementation of an entity. When implementing an EntityReducer, you are actually passing the current [Accumulator](#accumulator) Object to an entity spec, to become its current Accumulator object.

For information about supported (built-in) entities, see the [Entities](#entities) Section.

**SYNOPSIS**

```js
'<EntityType>:<EntityId>[[]]'
```

**OPTIONS**

| Option | Type | Description |
|:---|:---|:---|
| *EntityType* | `String` | Valid Entity type. |
| *EntityID* | `String` | Valid Entity ID. Optionally, you may pass Closed brackets at the end `[]` to indicate collection mapping. |

**Example:**

```js
const input = {
  a: {
    b: 'Hello World'
  }
}

const toUpperCase = (acc, next) => {
  next(null, acc.value.toUpper())
}

dataPoint.addEntities({
  'transform:getGreeting': '$a.b',
  'transform:toUpperCase': toUpperCase,
})

// once resolved the EntityReducer `transform:getGreeting`,
// the value new value will be passed to `transform:toUpperCase`
dataPoint.transform(['transform:getGreeting | transform:toUpperCase'], input).then((acc) => {
  assert.equal(acc.value, 'HELLO WORLD')
})
```

### <a name="reducer-collection-mapping">Collection Mapping</a>

Adding `[]` at the end of an entity reducer will map the given entity to each result of the current `acc.value` if `value` is a collection. If the value is not a collection, the entity will ignore the `[]` directive.

**Example:**

```js
const input = {
  a: [
    'Hello World',
    'Hello Laia',
    'Hello Darek',
    'Hello Italy',
  ]
}

const toUpperCase = (acc, next) => {
  next(null, acc.value.toUpper())
}

dataPoint.addEntities({
  'transform:toUpperCase': toUpperCase
})

dataPoint.transform(['$a | transform:toUpperCase[]'], input).then((acc) => {
  assert.equal(acc.value[0], 'HELLO WORLD')
  assert.equal(acc.value[1], 'HELLO Laia')
  assert.equal(acc.value[2], 'HELLO Darek')
  assert.equal(acc.value[3], 'HELLO ITALY')
})
```

Reducer entity [Examples](test/definitions/integrations.js)

**Best Practices (Recommendations) with reducers**

```js
const badReducer = () => (acc, done) => {
  // this is BAD - dont be this person! 
  // never ever modify the value object.
  acc.value[1].username = 'foo'

  // keep in mind JS is by reference
  // so this means this is also BAD
  const image = acc.value[1]
  image.username = 'foo'

  // pass value to next reducer
  done(null, acc.value)
}

// this is better
const fp = require('lodash/fp')
const goodReducer = () => (acc, done) => {
  // https://github.com/lodash/lodash/wiki/FP-Guide
  // this will cause no side effects
  const value = fp.set('[1].username', 'foo', acc.value)

  // pass value to next reducer
  done(null, value)
}
```

## <a name="entities">Entities</a>

Entities are artifacts that transform data. An entity is represented by a data structure (spec) that defines how the entity behaves. 

Entities may be added in two ways: 

1. On the DataPoint constructor, as explained in [setup examples](#setup-examples).
2. Through the `dataPoint.addEntities()` method, explained in [addEntities](#api-data-point-add-entities).

### <a name="api-data-point-add-entities">dataPoint.addEntities</a>

In DataPoint, *entities* are used to model the data. They specify how the data should be transformed. For more information about entities, see the [Entities Section](#entities).

When adding entity objects to DataPoint, only valid (registered) entity types are allowed.

**SYNOPSIS**

```js
dataPoint.addEntities({
  '<EntityType>:<EntityId>': { ... },
  '<EntityType>:<EntityId>': { ... },
  ...
})
```

**OPTIONS**

| Part | Type | Description |
|:---|:---|:---|
| *EntityType* | `string` | valid entity type to associate with the EntityObject |
| *EntityId* | `string` | unique entity ID associated with the EntityObject |

### <a name="built-in-entities">Built-in Entities</a> 

DataPoint comes with the following built-in entities: 

- [Transform](#transform-entity)
- [Entry](#entry-entity)
- [Source](#source-entity)
- [Hash](#hash-entity)
- [Collection](#collection-entity)
- [Control](#control-entity)
- [Schema](#schema-entity)

#### <a name="entity-base-api">Entity Base API</a>

All entities share a common API (except for [Transform](#transform-entity)).

```js
{
  // executes --before-- everything else
  before: TransformExpression,
  
  // executes --after-- everything else
  after: TransformExpression,
  
  // executes in case there is an error at any
  // point of the entire transformation
  error: TransformExpression,
  
  // this object allows you to store and eventually
  // access it at any given time on any reducer
  params: Object
}
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *before*  | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *after*   | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error*   | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |
| *params*  | `Object` | User defined Hash that will be passed to every transform within the context of the transform's execution |

##### <a name="transform-entity">Transform Entity</a>

A Transform entity is meant to be used as a 'snippet' entity that you can re-use in other entities. It does not expose the common before/after/error/params API that other entities have.

The value of a Transform entity is a [TransformExpression](#transform-expression).

**SYNOPSIS**

```js
dataPoint.addEntities({
  'transform:<entityId>': TransformExpression
})
```

**EXAMPLE:**

```js
const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const getMax = (acc, next) => {
  const result = Math.max.apply(null, acc.value)
  next(null, result)
}

const multiplyBy = (number) => (acc, next) => {
  const newValue = acc.value * number
  next(null, newValue)
}

dataPoint.addEntities({
  'transform:foo': ['$a.b.c', getMax, multiplyBy(10)]
})

dataPoint.transform('transform:foo', input).then((acc) => {
  assert.equal(acc.value, 30)
  console.log('result:', acc.value)
})
```

#### <a name="entry-entity">Entry Entity</a>

An Entry entity is where your data manipulation starts. As a best practice, use it as your starting point, and use it to call more complex entities.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'entry:<entityId>': {
    before: TransformExpression,
    value: TransformExpression,
    after: TransformExpression,
    error: TransformExpression,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *before*  | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *value* | [TransformExpression](#transform-expression) | The value to which the Entity resolves |
| *after*   | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error*   | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |
| *params*    | `Object` | User defined Hash that will be passed to every transform within the context of this transform's execution |

##### <a name="entry-value">Entry.value</a>

**EXAMPLE:**

Using the `value` property to transform an input:

```js
const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const getMax = (acc, next) => {
  const result = Math.max.apply(null, acc.value)
  next(null, result)
}

const multiplyBy = (number) => (acc, next) => {
  const newValue = acc.value * number
  next(null, newValue)
}

dataPoint.addEntities({
  'entry:foo': {
    value: ['$a.b.c', getMax, multiplyBy(10)]
  }
})

dataPoint.transform('entry:foo', input).then((acc) => {
  assert.equal(acc.value, 30)
  console.log('result:', acc.value)
})
```

Example at: [examples/entity-entry-basic.js](examples/entity-entry-basic.js)

##### <a name="entry-before">Entry.before</a>

Checking whether the value passed to an entity is an array:

```js
const isArray = () => (acc, next) => {
  if (acc.value instanceof Array) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // Notice how we pass this error object as the FIRST parameter.
  // This tells DataPoint that there was an error, and to treat it as such.
  next(new Error(`${acc.value} should be an Array`))
}

dataPoint.addEntities({
  'entry:foo': {
    before: isArray(),
    value: '$.'
  }
})

dataPoint.transform('entry:foo', [3, 15, 6, 3, 8]).then((acc) => {
  console.log(acc.value)
  // [ 3, 15, 6, 3, 8 ]
})
```

Example at: [examples/entity-entry-before.js](examples/entity-entry-before.js)

##### <a name="entry-after">Entry.after</a>

You could use the same logic in the `after` transform:

```js
const isArray = () => (acc, next) => {
  if (acc.value instanceof Array) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // Notice how we pass this error object as the FIRST parameter.
  // This tells DataPoint that there was an error, and to treat it as such.
  next(new Error(`${acc.value} should be an Array`))
}

dataPoint.addEntities({
  'entry:foo': {
    value: '$a.b',
    after: isArray()
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input).then((acc) => {
  console.log(acc.value)
  // [ 3, 15, 6, 3, 8 ]
})
```

Example at: [examples/entity-entry-after.js](examples/entity-entry-after.js)

##### <a name="entry-error">Entry.error</a>

Any error that happens within the scope of the Entity can be handled by the `error` transform. To respect the API, error reducers have the same api, and the value of the error is under `acc.value`.

**Error handling**

Passing a value as the second argument will stop the propagation of the error.

Let's resolve to a NON array value and see how this would be handled. 

```js
const isArray = () => (acc, next) => {
  if (acc.value instanceof Array) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // Notice how we pass this error object as the FIRST parameter.
  // This tells DataPoint that there was an error, and to treat it as such.
  next(new Error(`${acc.value} should be an Array`))
}

dataPoint.addEntities({
  'entry:foo': {
    // points to a NON Array value
    value: '$a',
    after: isArray(),
    error: (acc, next) => {
      // prints out the error message generated by
      // isArray function
      console.log(acc.value.message) 

      console.log('Value is invalid, resolving to empty array')

      // passing a value as the second argument
      // will stop the propagation of the error
      next(null, [])
    }
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input).then((acc) => {
  console.log(acc.value)
  // Value is invalid, resolving to empty array
  // []
})
```

Example at: [examples/entity-entry-error-handled.js](examples/entity-entry-error-handled.js)

**Pass the array to be handled somewhere else**

```js
const logError = () => (acc, next) => {
  // acc.value holds the actual Error Object
  console.log(acc.value.toString())
  // outputs: Error: [object Object] should be an Array

  // if we wish to bubble it up, then pass it to
  // the next() as the first parameter
  next(acc.value)

  // if we wished not to bubble it, we could pass
  // an empty first param, and a second value to
  // be used as the final resolved value
  // next(null, false) <-- this is just an example
}

dataPoint.addEntities({
  'entry:foo': {
    value: '$a',
    after: isArray(),
    error: logError()
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input)
  .catch((error) => {
    console.log(error.toString())
    // Error: [object Object] should be an Array
  })
```

Example at: [examples/entity-entry-error-rethrow.js](examples/entity-entry-error-rethrow.js)

Let's resolve to a value, in order to prevent the transform from failing.

```js
const resolveTo = (value) => (erracc, next) => {
  // since we don't pass the error back
  // it will resolve to the new value
  next(null, value)
}

dataPoint.addEntities({
  'entry:foo': {
    value: '$a',
    after: isArray(),
    // resolving the value to empty array
    error: resolveTo([])
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input)
  .then((acc) => {
    assert.deepEqual(acc.value, [])
    console.log(acc.value)
    // []
  })
```

Example at: [examples/entity-entry-error-resolved.js](examples/entity-entry-error-resolved.js)

For examples of entry entities, see the ones used in the [Examples](examples), on the unit tests: [Source Definitions](test/definitions/entry.js) and [Integration Examples](test/definitions/integrations.js)

##### <a name="entry-params">Entry.params</a>

The params object is used to pass custom data to your entity. This Object is exposed as a property of the [Accumulator](#accumulator) Object. Which can be accessed via a [FunctionReducer](#function-reducer), as well as through a [PathReducer](#path-reducer) expression.

On a FunctionReducer:

```js
const multiplyValue = (acc, next) => {
  next(null, acc.value * acc.params.multiplier)
}

dataPoint.addEntities({
  'entry:multiply': {
    value: multiplyValue
    params: {
      multiplier: 100
    }
  }
})

dataPoint.transform('entry:multiply', 200)
  .then((acc) => {
    assert.deepEqual(acc.value, 20000)
    console.log(acc.value)
  })
```

On a PathReducer:

```js
dataPoint.addEntities({
  'entry:getParam': {
    value: '$..multiplier'
    params: {
      multiplier: 100
    }
  }
})

dataPoint.transform('entry:getParam')
  .then((acc) => {
    assert.deepEqual(acc.value, 100)
    console.log(acc.value)
  })
```

**Error handling**

Passing a a value as the second argument will stop the propagation of the error.

Let's resolve to a NON array value and see how this would be handled. 

```js
const isArray = () => (acc, next) => {
  if (acc.value instanceof Array) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // Notice how we pass this error object as the FIRST parameter.
  // This tells DataPoint that there was an error, and to treat it as such.
  next(new Error(`${acc.value} should be an Array`))
}

dataPoint.addEntities({
  'entry:foo': {
    // points to a NON Array value
    value: '$a',
    after: isArray(),
    error: (acc, next) => {
      console.log('Value is invalid, resolving to empty array')
      // passing a a value as the second argument
      // will stop the propagation of the error
      next(null, [])
    }
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input).then((acc) => {
  console.log(acc.value)
  // Value is invalid, resolving to empty array
  // []
})
```

Example at: [examples/entity-entry-error-handled.js](examples/entity-entry-error-handled.js)

#### <a name="source-entity">Source Entity</a>

Requests a remote source, using [Request](https://github.com/request/request) behind the scenes. The features supported by Request are also exposed/supported by Source.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'source:<entityId>': {
    before: TransformExpression,
    url: StringTemplate,
    options: TransformObject,
    beforeRequest: TransformExpression,
    after: TransformExpression,
    error: TransformExpression,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *before*  | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *url*   | [StringTemplate](#string-template) | String value to resolve the request's url |
| *options* | [TransformObject](#transform-object) | Request's options. These map directly to [request.js](https://github.com/request/request) options
| *beforeRequest* | [TransformExpression](#transform-expression) | `acc.value` at this point will be the request options object being passed to the final request. You may do any modifications here, and then pass to the next reducer |
| *after*   | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error*   | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |
| *params*    | `Object` | User defined Hash that will be passed to every transform within the context of the transform's execution |

##### <a name="source-url">Source.url</a>

**GitHub API - list organization info**

(For more information on this API: [https://api.github.com/orgs/nodejs](https://api.github.com/orgs/nodejs))

Fetches an organization's information.

```js
dataPoint.addEntities({
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/nodejs',
    options: {
      headers: {
        'User-Agent': 'DataPoint'
      }
    }
  }
})

dataPoint.transform('source:getOrgInfo', {}).then((acc) => {
  console.log(acc.value) // entire result from https://api.github.com/orgs/nodejs
})
```

Example at: [examples/entity-source-basic.js](examples/entity-source-basic.js)

##### <a name="string-template">StringTemplate</a>

StringTemplate is a string that supports a **minimal** templating system. You may inject any value into the string by enclosing it within `{ObjectPath}` curly braces. **The context of the string is the Source's [Accumulator](#accumulator) Object**, meaning you have access to any property within it. 

Using `acc.value` property to make the url dynamic.

```js
dataPoint.addEntities({
  // dynamic search, which uses StringTemplate's simple 
  // templating system {value} to inject the search 
  // value into the URL string
  'source:getNodeOrgInfo': {
    url: 'https://api.github.com/orgs/{value.organization}',
    // this object will be passed to request.js
    options: {
      headers: {
        'User-Agent': 'request'
      }
    }
  }
})

// second parameter to transform is the initial value
transform('entry:getNodeOrgInfo', {
  organization: 'nodejs'
}).then((acc) => {
  // outputs full result from the remote source
  console.log(acc.value) 
})
```

<a name="acc-locals-example" ></a> Using `acc.locals` property to make the url dynamic:

```js
dataPoint.addEntities({
  // dynamic search, which uses StringTemplate's simple 
  // templating system {value} to inject the search 
  // value into the URL string
  'source:getNodeOrgInfo': {
    url: 'https://api.github.com/orgs/{locals.organization}',
    // this object will be passed to request.js
    options: {
      headers: {
        'User-Agent': 'request'
      }
    }
  }
})

// The third parameter of transform is the options object 
// where we can pass the `locals` value
transform('entry:getNodeOrgInfo', null, {
  locals: {
    organization: 'nodejs'
  }
}).then((acc) => {
  // outputs full result from the remote source
  console.log(acc.value) 
})
```

Example at: [examples/entity-source-string-template.js](examples/entity-source-string-template.js)

##### <a name="transform-object">TransformObject</a>

A TransformObject is a Object where any property (at any level), that its key starts with the character `$` is treated as a  [TransformExpression](#transform-expression). Properties that do not start with a `$` character will be left untouched.

When an TransformObject is to be resolved, all TransformExpressions are resolved in parallel, and their values will be injected in place of the TransformExpression. Also the `$` character will be removed from the resolved property.

```js
dataPoint.addEntities({
  'source:searchPeople': {
    url: 'https://swapi.co/api/people/?search=r2',
    options: {
      qs: {
        // because the key starts with $
        // it will be treated as a TransformExpression
        $search: (acc, next) => {
          next(null, acc.value.search)
        }
      }
    }
  }
})

// second parameter to transform is the initial acc value
dataPoint.transform('source:searchPeople', {
  search: 'r2'
}).then((acc) => {
  // R2-D2
  console.log(acc.value.results[0].name)
})
```

Example at: [examples/entity-source-transform-object.js](examples/entity-source-transform-object.js)

##### <a name="source-before-request">Source.beforeRequest</a>

There are times where you may want to process the `source.options` object before passing it to send the request. 

This example simply provides the header object through a reducer. One possible use case for source.beforeRequest would be to set up [OAuth Signing](https://www.npmjs.com/package/request#oauth-signing).

```js
dataPoint.addEntities({
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value}',
    beforeRequest: (acc, next) => {
      // acc.value holds reference to source.options
      const options = _.assign({}, acc.value, {
        headers: {
          'User-Agent': 'DataPoint'
        }
      })

      next(null, options)
    }
  }
})

dataPoint.transform('source:getOrgInfo', 'nodejs').then((acc) => {
  console.log(acc.value)
  // entire result from https://api.github.com/orgs/nodejs
})
```

Example at: [examples/entity-source-before-request.js](examples/entity-source-before-request.js)

For more examples of source entities, see the [Examples](examples), the unit tests: [Source Definitions](test/definitions/sources.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="hash-entity">Hash Entity</a>

A Hash entity transforms a _Hash_ like data structure. It enables you to manipulate the keys within a Hash. 

To prevent unexpected results, **Hash** only can process **Plain Objects**, which are objects created by the Object constructor. 

Hash entities expose a set of reducers: [mapKeys](#hash-mapKeys), [omitKeys](#hash-omitKeys), [pickKeys](#hash-pickKeys), [addKeys](#hash-addKeys), [addValues](#hash-addValues). You may apply one or more of these available reducers to a Hash entity. Keep in mind that those reducers will always be executed in a specific order:

```js
mapKeys -> omitKeys -> pickKeys -> addKeys -> addValues
```

If you want to have more control over the order of execution, you may use the [compose](#entity-compose-reducer) reducer.

**NOTE**: The Compose reducer is meant to operate only on Hash-type objects. If its context resolves to a non-Hash type, it will **throw an error**.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'hash:<entityId>': {
    before: TransformExpression,

    value: TransformExpression,
    mapKeys: TransformMap,
    omitKeys: String[],
    pickKeys: String[],
    addKeys: TransformMap,
    addValues: Object,
    compose: ComposeModifier[],
    
    after: TransformExpression,
    error: TransformExpression,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *value* | [TransformExpression](#transform-expression) | The value to which the Entity resolves |
| *mapKeys* | [TransformMap](#transform-map) | Map to a new set of key/values. Each value accepts a transform |
| *omitKeys* | `String`[] | Omits keys from acc.value (Array of strings) |
| *pickKeys* | `String`[] | Picks keys from acc.value (Array of strings) |
| *addKeys* | [TransformMap](#transform-map) | Add/Override key/values. Each value accepts a transform |
| *addValues* | `Object` | Add/Override hard-coded key/values |
| *compose* | [ComposeReducer](#compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one operation gets passed to the next one|
| *before*  | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *after*   | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error*   | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |
| *params*    | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |

##### <a name="hash-value">Hash.value</a>

Resolve accumulator.value to a hash

```js
const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: {
      c: 'Hello',
      d: ' World!!'
    }
  }
}

dataPoint.addEntities({
  'hash:helloWorld': {
    value: '$a.b'
  }
})

dataPoint.transform('hash:helloWorld', input).then((acc) => {
  assert.deepEqual(acc.value, {
    c: 'Hello',
    d: ' World!!'
  })
  console.log('result:', acc.value)
  // result: { c: 'Hello', d: ' World!!' }
})
```

Example at: [examples/entity-hash-context.js](examples/entity-hash-context.js)

##### <a name="hash-mapKeys">Hash.mapKeys</a>

Maps to a new set of key/value pairs through a [TransformMap](#transform-map), where each value accepts a [TransformExpression](#transform-expression).

Going back to our GitHub API examples, let's map some keys from the result of a source:

```js
dataPoint.addEntities({
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/nodejs',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    mapKeys: {
      reposUrl: '$repos_url',
      eventsUrl: '$events_url',
      avatarUrl: '$avatar_url',
      orgName: '$name',
      blogUrl: '$blog'
    }
  }
})

dataPoint.transform('source:getOrgInfo | hash:OrgInfo').then((acc) => {
  console.log(acc.value)
  // {
  //  reposUrl: 'https://api.github.com/orgs/nodejs/repos',
  //  eventsUrl: 'https://api.github.com/orgs/nodejs/events',
  //  avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
  //  orgName: 'Node.js Foundation',
  //  blogUrl: 'https://nodejs.org/foundation/'
  // }
})
```

Example at: [examples/entity-hash-mapKeys.js](examples/entity-hash-mapKeys.js)

##### <a name="hash-addKeys">Hash.addKeys</a>

Adds keys to the current Hash value. If an added key already exists, it will be overridden. 

Hash.addKeys is very similar to Hash.mapKeys, but the difference is that `mapKeys` will ONLY map the keys you give it, whereas `addKeys` will ADD/APPEND new keys to your existing `acc.value`. You may think of `addKeys` as an _extend_ operation. 

```js
dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'source:getOrgInfo | hash:OrgInfo | hash:OrgInfoCustom'
  },
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/nodejs',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    mapKeys: {
      reposUrl: '$repos_url',
      eventsUrl: '$events_url',
      avatarUrl: '$avatar_url',
      orgName: '$name',
      blogUrl: '$blog'
    }
  },
  'hash:OrgInfoCustom': {
    addKeys: {
      // notice we are extracting from the new key
      // made on the hash:OrgInfo entity
      avatarUrlDuplicate: '$avatarUrl'
    }
  }
})

const expectedResult = {
  reposUrl: 'https://api.github.com/orgs/nodejs/repos',
  eventsUrl: 'https://api.github.com/orgs/nodejs/events',
  avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
  orgName: 'Node.js Foundation',
  blogUrl: 'https://nodejs.org/foundation/',
  // this key was added through hash:OrgInfoCustom
  avatarUrlDuplicate: 'https://avatars0.githubusercontent.com/u/9950313?v=3'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then((acc) => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
  /*
  {
    reposUrl: 'https://api.github.com/orgs/nodejs/repos',
    eventsUrl: 'https://api.github.com/orgs/nodejs/events',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
    orgName: 'Node.js Foundation',
    blogUrl: 'https://nodejs.org/foundation/',
    avatarUrlDuplicate: 'https://avatars0.githubusercontent.com/u/9950313?v=3'
  }
  */
})
```

Example at: [examples/entity-hash-addKeys.js](examples/entity-hash-addKeys.js)

##### <a name="hash-pickKeys">Hash.pickKeys</a>

Picks a list of keys from the current Hash value.

The next example is similar to the previous example. However, instead of mapping key/value pairs, this example just picks some of the keys:

```js
dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'source:getOrgInfo | hash:OrgInfo'
  },
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value.org}',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    // notice this is an array, not a transform or object
    pickKeys: [
      'name',
      'blog'
    ]
  }
})

// keys came out intact
const expectedResult = {
  name: 'Node.js Foundation',
  blog: 'https://nodejs.org/foundation/'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then((acc) => {
  console.log(acc.value)
  assert.deepEqual(acc.value, expectedResult)
  /*
  {
    name: 'Node.js Foundation',
    blog: 'https://nodejs.org/foundation/'
  }
  */
})
```

Example at: [examples/entity-hash-pickKeys.js](examples/entity-hash-pickKeys.js)

##### <a name="hash-omitKeys">Hash.omitKeys</a>

Omits keys from the Hash value.

This example will only **omit** some keys, and let the rest pass through:

```js
dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'source:getOrgInfo | hash:OrgInfo'
  },
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value.org}',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    // notice this is an array, not a Transform or Object
    omitKeys: [
      'repos_url',
      'events_url',
      'hooks_url',
      'issues_url',
      'members_url',
      'public_members_url',
      'avatar_url',
      'description',
      'name',
      'company',
      'blog',
      'location',
      'email',
      'has_organization_projects',
      'has_repository_projects',
      'public_repos',
      'public_gists',
      'followers',
      'following',
      'html_url',
      'created_at',
      'updated_at',
      'type'
    ]
  }
})

// keys came out intact
const expectedResult = {
  login: 'nodejs',
  id: 9950313,
  url: 'https://api.github.com/orgs/nodejs'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then((acc) => {
  console.log(acc.value)
  assert.deepEqual(acc.value, expectedResult)
  /*
  {
    login: 'nodejs',
    id: 9950313,
    url: 'https://api.github.com/orgs/nodejs'
  }
  */
})
```

Example at: [examples/entity-hash-omitKeys.js](examples/entity-hash-omitKeys.js)

##### <a name="hash-addValues">Hash.addValues</a>

Adds hard-coded values to the Hash value.

Sometimes you just want to add a hard-coded value to your current `acc.value`.

```js
dataPoint.addEntities({
  'hash:addValues': {
    addValues: {
      foo: 'value',
      bar: true, 
      obj: { 
        a: 'a'
      }
    } 
  }
})

// keys came out intact
const expectedResult = {
  foo: 'value',
  bar: true, 
  obj: { 
    a: 'a'
  }
}


dataPoint.transform('hash:addValues').then((acc) => {
  expect(acc.value).toEqual(expectedResult)
})
```

##### Hash - adding multiple reducers

You can add multiple reducers to your Hash spec.

```js
const toUpperCase = (acc, next) => {
  const result = acc.value.toUpperCase()
  next(null, result)
}

dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'source:getOrgInfo | hash:OrgInfo'
  },
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value.org}',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    mapKeys: {
      reposUrl: '$repos_url',
      eventsUrl: '$events_url',
      avatarUrl: '$avatar_url',
      orgName: '$name',
      blogUrl: '$blog',
    },
    addKeys: {
      upperCaseName: [`$name`, toUpperCase]
    },
    omitKeys: ['eventsUrl'],
    pickKeys: ['reposUrl', 'upperCaseName'],
    addValues: {
      info: 'This is a test'
    }
  }
})

const expectedResult = {
  eventsUrl: 'https://api.github.com/orgs/nodejs/events',
  orgName: 'NODE.JS FOUNDATION',
  info: 'This is a test'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then((acc) => {
  expect(acc.value).toEqual(expectedResult)
})
```

For examples of hash entities, see the [Examples](examples), on the unit tests: [Source Definitions](test/definitions/hash.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="collection-entity">Collection Entity</a>

A Collection entity enables you to operate over an array. Its API provides basic reducers to manipulate the elements in the array.

Collection entities expose a set of reducers that you may apply to them: [map](#collection-map), [find](#collection-find), [filter](#collection-filter). These reducers are executed in a [specific order](#collection-reducers-order). If you want to have more control over the order of execution, use the [compose](#compose-reducer) reducer.

**IMPORTANT:** Keep in mind that in DataPoint, **all** operations are asynchronous. If your operations do NOT need to be asynchronous, iterating over a large array might result in slower execution. In such cases, consider using a reducer function where you can implement a synchronous solution.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'collection:<entityId>': {
    before: TransformExpression,

    value: TransformExpression,
    filter: TransformExpression,
    map: TransformExpression,
    find: TransformExpression,
    compose: ComposeModifier[],
    
    after: TransformExpression,
    error: TransformExpression,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *before*  | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *value* | [TransformExpression](#transform-expression) | The value to which the Entity resolves |
| *map* | [TransformExpression](#transform-expression) | Maps the items of an array. **NOTE**: this operation happens asynchronously, so be careful to use it only when async operation is needed; otherwise, use a synchronous equivalent (native array filter or third party solution) |
| *find* | [TransformExpression](#transform-expression) | Find an item in the array. **NOTE**: this operation happens asynchronously, so be careful to use it only when async operation is needed; otherwise, use a synchronous equivalent (native array filter or third party solution) |
| *filter* | [TransformExpression](#transform-expression) | Filters the items of an array. **NOTE**: this operation happens asynchronously, so be careful to use it only when async operation is needed; otherwise, use a synchronous equivalent (native array filter or third party solution) |
| *compose* | [ComposeReducer](#compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one object gets passed to the next one |
| *after* | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error* | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |

<a name="collection-reducers-order">The order of execution of is:</a>

```js
filter -> map -> find
```

##### <a name="collection-map">Collection.map</a>

Maps a transformation to each element in a collection.

Let's fetch all the repositories that the [NodeJs](https://github.com/nodejs) Org has available at the API: [https://api.github.com/orgs/nodejs/repos](https://api.github.com/orgs/nodejs/repos).

Now that we have the result of the fetch, let's now map each item, and then extract only one of each item's properties.

```js
dataPoint.addEntities({
  'source:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'collection:getRepositoryTagsUrl': {
    map: '$tags_url'
  }
})

dataPoint.transform('source:getGist | collection:getRepositoryTagsUrl', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    https://api.github.com/repos/nodejs/http-parser/tags,
    https://api.github.com/repos/nodejs/node-v0.x-archive/tags,
    https://api.github.com/repos/nodejs/node-gyp/tags,
    https://api.github.com/repos/nodejs/readable-stream/tags,
    https://api.github.com/repos/nodejs/node-addon-examples/tags,
    https://api.github.com/repos/nodejs/nan/tags,
    ...
  ]
  */
})
```

The above example is fairly simple. The following example hits each of these urls, and gets information from them. 

**Get latest tag of each repository:**

_For the purpose of this example, let's imagine that GitHub does not provide the url api to get the list of tags._

```js
dataPoint.addEntities({
  'source:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'source:getLatestTag': {
    // here we are injecting the current acc.value 
    // that was passed to the source
    url: 'https://api.github.com/repos/nodejs/{value}/tags'
  },
  'collection:getRepositoryLatestTag': {
    // magic!! here we are telling it to map each 
    // repository.name to a source:getLatestTag, and return the entire source
    map: '$name | source:getLatestTag'
  }
})

dataPoint.transform('source:getOrgRepositories | collection:getRepositoryLatestTag', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    [  // repo
      {
        "name": "v2.7.1",
        "zipball_url": "https://api.github.com/repos/nodejs/http-parser/zipball/v2.7.1",
        "tarball_url": "https://api.github.com/repos/nodejs/http-parser/tarball/v2.7.1",
        "commit": {...}
        ...
      },
      ...
    ],
    [ // repo
      {
      "name": "works",
      "zipball_url": "https://api.github.com/repos/nodejs/node-v0.x-archive/zipball/works",
      "tarball_url": "https://api.github.com/repos/nodejs/node-v0.x-archive/tarball/works",
      "commit": {...}
      ...
      },
      ...
    ],
    ... // more repos
  ]
  */
})
```

To obtain the latest tag GitHub has on each repository:

```js
dataPoint.addEntities({
  'source:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'source:getLatestTag': {
    // here we are injecting the current acc.value 
    // that was passed to the source
    url: 'https://api.github.com/repos/nodejs/{value}/tags',
    options
  },
  'collection:getRepositoryLatestTag': {
    // notice similar to previous example, BUT
    // we add a third reducer at the end to get 
    // the first element of each tag result,
    // and the name of it
    map: '$name | source:getLatestTag | $[0].name'
  }
})

dataPoint.transform('source:getOrgRepositories | collection:getRepositoryLatestTag', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    "v2.7.1",
    "works",
    "v3.6.0",
    "v2.2.9",
    null,
    "v2.6.2",
    ...
  ]
  */
})
```

##### <a name="collection-filter">Collection.filter</a>

Creates a new array with all elements that pass the test implemented by the provided transform.

The following example filters the data to identify all the repos that have more than 100 stargazers.

```js
dataPoint.addEntities({
  'source:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'collection:getRepositoryUrl': {
    filter: (acc, next) => {
      next(null, acc.value > 100)
    }
  }
})

dataPoint.transform('source:getGist', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    https://api.github.com/repos/nodejs/http-parser,
    https://api.github.com/repos/nodejs/node-v0.x-archive,
    https://api.github.com/repos/nodejs/node-gyp,
    https://api.github.com/repos/nodejs/readable-stream,
    https://api.github.com/repos/nodejs/node-addon-examples,
    https://api.github.com/repos/nodejs/nan,
    ...
  ]
  */
})
```

Because `filter` accepts a transformExpression, you could use it to check whether a property evaluates to a [Truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value. 

The following example gets all the repos that are actually forks. In this case, because the `fork` property is a boolean, then you can do the following:

```js
dataPoint.addEntities({
  'source:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'collection:getRepositoryUrl': {
    filter: '$fork'
  }
})

dataPoint.transform('source:getGist', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    {
      "id": 28619960,
      "name": "build-container-sync",
      "full_name": "nodejs/build-container-sync",
      ...
      "fork": true
    }, 
    {
      "id": 30464379,
      "name": "nodejs-es",
      "full_name": "nodejs/nodejs-es",
      ...
      "fork": true
    }
  ]
  */
})
```

##### <a name="collection-find">Collection.find</a>

Returns the value of the first element in the array that satisfies the provided testing transform. Otherwise, `undefined` is returned.

**Find the a repository with name equals: node**

```js
dataPoint.addEntities({
  'source:repos': {
    url: 'https://api.github.com/orgs/nodejs/repos',
    options: {
      headers: {
        'User-Agent': 'request'
      }
    }
  },
  'collection:getNodeRepo': {
    before: 'source:repos',
    find: (acc, next) => {
      // notice we are checking against the property -name- 
      next(null, acc.value.name === 'node')
    }
  }
})

dataPoint.transform('source:repos | collection:getNodeRepo', {}).then((acc) => {
  console.log(acc.value)
  /*
  {
    "id": 27193779,
    "name": "node",
    "full_name": "nodejs/node",
    "owner": { ... },
    "private": false,
    "html_url": https://github.com/nodejs/node,
    "description": "Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:",
    ...
  }
  */
})
```

##### <a name="collection-compose">Collection.compose</a>

`Collection.compose` receives an array of **modifiers**  (filter, map, find). You may add as many modifiers as you need, in any order, by _composition_. 


**IMPORTANT:** The order of the modifiers is important. Keep in mind that `Collection.find` returns the **matched** element. However, the `map` and `filter` modifiers expect an array. If your matched item is **NOT** an array, the entity will **throw an error**. 

Let's refactor the previous Collection.find example:

```js
const isEqualTo = (match) => (acc, next) => {
  next(null, acc.value === match)
}

dataPoint.addEntities({
  'source:repos': {
    url: 'https://api.github.com/orgs/nodejs/repos',
    options: {
      headers: {
        'User-Agent': 'request'
      }
    }
  },
  'collection:getNodeRepo': {
    before: 'source:repos',
    compose: [{
      // passing the value of property -name- to the
      // next reducer, which will compare to a given value 
      find: ['$name', isEqualTo('node')]
    }]
  }
};

dataPoint.transform('source:repos | collection:getNodeRepo', {}).then((acc) => {
  console.log(acc.value)
  /*
  {
    "id": 27193779,
    "name": "node",
    "full_name": "nodejs/node",
    "owner": { ... },
    "private": false,
    "html_url": https://github.com/nodejs/node,
    "description": "Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:",
    ...
  }
  */
})
```

**Get all forks and map them to a Hash entity**

```js
const isEqualTo = (match) => (acc, next) => {
  next(null, acc.value === match)
}

dataPoint.addEntities({
  'source:repos': {
    url: 'https://api.github.com/orgs/nodejs/repos',
    options: {
      headers: {
        'User-Agent': 'request'
      }
    }
  },
  'hash:repositorySummary': {
    pickKeys: ['id', 'name', 'homepage', 'description']
  },
  'collection:forkedReposSummary': {
    compose: [
      { filter: '$fork'},
      { map: 'hash:repositorySummary' }
    ]
  }
};

dataPoint.transform('source:repos | collection:forkedReposSummary', {}).then((acc) => {
  console.log(acc.value)
  /*
  [
    {
      "id": 28619960,
      "name": "build-container-sync",
      "homepage": null,
      "description": null
    },
    {
      "id": 30464379,
      "name": "nodejs-es",
      "homepage": "",
      "description": "Localización y traducción de io.js a Español"
    }
  ]
  */
})
```

For more examples of collection entities, see the [Examples](examples), on the unit tests: [Source Definitions](test/definitions/collection.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="control-entity">Control Entity</a>

The Flow Control entity allows you to control the flow of your transformations.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'control:<entityId>': {
    select: [
      { case: TransformExpression, do: Transform },
      ...
      { default: Transform }
    ],
    before: TransformExpression,
    after: TransformExpression,
    error: TransformExpression,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *select* | [Case Statements](#case-statements)`[]` | Array of case statements, and a default fallback |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |
| *before* | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *after* | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error* | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |

##### <a name="case-statements">Case Statements</a>

The `select` array may contain one or more case statements, similar to a `switch` in plain JavaScript. It executes from top to bottom, until it finds a case statement that results in a `truthy` value. Once it finds a match, it will execute its `do` transform to resolve the entity.

If no case statement resolves to `truthy`, then the default statement will be used as the entity's resolution. 

**IMPORTANT:**

`default` is mandatory. If it is not provided, DataPoint will produce an error when trying to parse the entity.

```js

case isEqual = (compareTo) => (acc, next) => {
  next(null, acc.value === compareTo)
}

case resolveTo = (value) => (acc, next) => {
  next(null, value)
}

case throwError = (message) => (acc, next) => {
  // next uses Node.js callback style, where first 
  // argument is error
  next(new Error(message))
}

dataPoint.addEntities({
  'control:fruitPrices': {
    select: [
      { case: isEqual('oranges') do: resolveTo(0.59) },
      { case: isEqual('apples') do: resolveTo(0.32) },
      { case: isEqual('bananas') do: resolveTo(0.48) },
      { case: isEqual('cherries') do: resolveTo(3.00) },
      { default: throwError('Fruit was not found!! Maybe call the manager?') },
    ]
  }
})

dataPoint.transform('control:fruitPrices', 'apples').then((acc) => {
  console.log(acc.value) // 0.32
});

dataPoint.transform('control:fruitPrices', 'cherries').then((acc) => {
  console.log(acc.value) // 3.00 expensive!! 
});

dataPoint.transform('control:fruitPrices', 'plum')
.catch((error) => {
  console.log(error) // Fruit was not found!! Maybe call the manager?
});
```

**EXAMPLES**

For examples of control entities, see the ones used on the unit tests: [Control Definitions](test/definitions/control.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="schema-entity">Schema Entity</a>

 Runs a JSON Schema against a data structure [Ajv](https://github.com/epoberezkin/ajv) behind the scenes.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'schema:<entityId>': {
    value: TransformExpression,
    schema: JSONSchema,
    options: Object,

    before: TransformExpression,
    after: TransformExpression,
    error: TransformExpression,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *value* | [TransformExpression](#transform-expression) | The value that this entity will pass to the schema validation |
| *schema* | `Object` | Valid [JSON Schema](http://json-schema.org/documentation.html) object |
| *options* | `Object` | Avj's [options](https://github.com/epoberezkin/ajv#options) object
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |
| *before* | [TransformExpression](#transform-expression) | Transform to be resolved **before** the entity resolution |
| *after* | [TransformExpression](#transform-expression) | Transform to be resolved **after** the entity resolution |
| *error* | [TransformExpression](#transform-expression) | Transform to be resolved in case of an error |

**EXAMPLES**

For examples of Schema entities, see the ones used on the unit tests: [Schema Definitions](test/definitions/schema.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="entity-compose-reducer">Entity Compose Reducer</a>

This reducer is an `Array` of [ComposeReducer](#compose-reducer) objects. Each reducer gets executed asynchronously. You may add as many supported reducers as you want by the entity. The result of each reducer gets passed to the next reducer in sequence. 

<a name="compose-reducer">**ComposeReducer**</a>: is an object with a single 'key'. The key is the type of reducer you want to execute, and its value is the body of the reducer.

**SYNOPSIS**

```js
...
compose: [
  { // ComposeReducer
    <reducerType>: <reducerBody>
  },
  ...
],
...
```

**EXAMPLES**

For examples of the hash entity compose implementation, see [Hash Compose Example](examples/entity-hash-compose.js).

### <a name="extending-entities">Extending Entities</a>

You may extend entity definitions. This functionality is mainly used with the DRY principle. It is not meant to work as an inheritance pattern, but can be used in cases where you want to override entity A with entity B. 

Extending entities is **not a deep merge of properties** from one entity to the other. It only overrides the first level of enumerable properties from base entity to target.

**SYNOPSIS**

```js
...
`entity:child -> entity:base`: { // read entity:child extends entity:base
  // entity spec
},
...
```

**EXAMPLE**

To reuse the options from an extension: 

```js
dataPoint.addEntities({
  'entry:getReposWithAllTags': {
    value: 'source:repositories'
  },
  'source:githubBase': {
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'source:repositories -> source:githubBase': {
    // options object is provided by source:githubBase
    url: 'https://api.github.com/orgs/{locals.orgName}/repos'
  }
})

const options = {
  locals: {
    orgName: 'nodejs'
  }
}

dataPoint.transform('entry:getReposWithAllTags', null, options).then((acc) => {
  console.log(acc.value) // returns all the repos for nodejs org
})
```

Example at: [examples/extend-entity-keys.js](examples/extend-entity-keys.js)


```js
dataPoint.addEntities({
  'hash:multiply': {
    mapKeys: {
      multiplyByFactor: '$multiplier | model:multiplyBy',
      multiplyBy20: '$multiplier | model:multiplyBy20'
    }
  },
  'model:multiplyBy': {
    value: (acc, next) => next(null, acc.value * acc.params.multiplicand),
    params: {
      multiplicand: 1
    }
  },
  'model:multiplyBy20 -> model:multiplyBy': {
    // through the params property we can
    // parameterize the base entity
    params: {
      multiplicand: 20
    }
  }
})

dataPoint.transform('hash:multiply', {multiplier: 5}).then((acc) => {
  console.log(acc.value)
  /*
  {
    multiplyByFactor: 5,
    multiplyBy20: 100
  }
  */
})
```

Example at: [examples/extend-entity-reusability.js](examples/extend-entity-reusability.js)

### <a name="api-data-point-use">dataPoint.use</a>

Adds a middleware method. Middleware, in the DataPoint context, is a place to add logic that you want to be executed `before` and `after` the execution of all the entities DataPoint has registered.

This middleware layer allows you to control the execution of entities. 

**SYNOPSIS**

```js
dataPoint.use(id, callback)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *id* | `string` | middleware ID is a two part string in the form of `<EntityType>:<EventType>`, where `<EntityType>` may be `entry`, `model`, `source`, or any other registered entity type. `<EventType>` is either `before` or `after`. |
| *callback* | `Function` | This is the callback function that will be executed once an entity event is triggered. The callback has the form `(acc, next)`, where `acc` is the current middleware [Middleware Accumulator](#middleware-accumulator-object) object, and next is a function callback to be executed once the middleware is done executing. `next` callback uses the form of `(error)`. |

### <a name="middleware-accumulator-object">Middleware Accumulator object</a>

This object is a copy of the currently executing entity's [Accumulator](#accumulator) object with a method `resolve(value)` appended to it. The `resolve(value)` method allows you to control the execution of the middleware chain. When/if `acc.resolve(value)` is called inside a middleware callback, it will skip the execution of the entity and immediately resolve to the value that was passed. 

**SYNOPSIS**

```js
{ // extends Accumulator
  resolve: Function,
  ...
}
```

**API:**

| Key | Type | Description |
|:---|:---|:---|
| `resolve` | `Function` | Will resolve the entire entity with the value passed. This function has the form of: `(value)` |

### <a name="api-data-point-add-value">dataPoint.addValue</a>

Stores any value to be accessible via [Accumulator](#accumulator).values.

**SYNOPSIS**

```js
dataPoint.addValue(objectPath, value)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *objectPath* | `string` | object path where you want to add the new value. Uses [_.set](https://lodash.com/docs/4.17.4#set) to append to the values object |
| *value* | `*` | anything you want to store |

## <a name="custom-entity-types">Custom Entity Types</a>

DataPoint exposes a set of methods to help you build your own Custom Entity Types. With them you are enabled to build on top of the [base entity API](#entity-base-api). 

### <a name="adding-entity-types">Adding new Entity Types

You may add new Entity Types through the [DataPoint.create](#api-data-point-create) method, or through the [dataPoint.addEntityTypes](#data-point-add-entity-types)

#### <a name="data-point-add-entity-types">dataPoint.addEntityTypes</a>

Adds a new set of Entity Types to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityTypes(specs:Object)
```

This method will return a **Promise** if `done` is omitted.

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *specs* | `Object` | Key/value hash where each key is the name of the new Entity Type and value is the Entity spec API. |

Every Entity must expose two methods:

- `create`: Factory method to create a new instance of your Entity.
- `resolve`: Resolve your entity specification

Because you are extending the base entity API, you get before, value, after, params and error values. You only have to take care of resolving value and any other custom property you added to your custom entity. Everything else will be resolved by the core DataPoint resolver. 

#### <a name="entity-create">Entity.create</a>

This is a factory method, it receives a raw entity spec, and expects to return a new entity instance object.

```js
function create(spec:Object):Object
```

#### <a name="entity-resolve">Entity.resolve</a>

This is where your entity resolution logic is to be implemented. It follows the following syntax: 

```js
function resolve(acc:Accumulator, resolveTransform:function):Promise<Accumulator>
```

**EXAMPLE**

```js
const _ = require('lodash')

const DataPoint = require('../')
const Helpers = DataPoint.helpers

// Entity Class
function RenderTemplate () {
}

/**
 * Entity Factory
 * @param {*} spec - Entity Specification
 * @return {RenderTemplate} RenderTemplate Instance
 */
function create (spec) {
  // create an entity instance
  const entity = Helpers.createEntity(RenderTemplate, spec)
  // set/create template from spec.template value
  entity.template = _.template(_.defaultTo(spec.template, ''))
  return entity
}

/**
 * Resolve entity
 * @param {Accumulator} accumulator
 * @param {function} resolveTransform
 * @return {Promise}
 */
function resolve (accumulator, resolveTransform) {
  // get Entity Spec
  const spec = accumulator.reducer.spec
  // resolve 'spec.value' TransformExpression
  // against accumulator
  return resolveTransform(accumulator, spec.value)
    .then((acc) => {
      // execute lodash template against
      // accumulator value
      const output = spec.template(acc.value)
      // set new accumulator.value
      // this method creates a new acc object
      return Helpers.set(acc, 'value', output)
    })
}

/**
 * RenderEntity API
 */
const RenderEntity = {
  create,
  resolve
}

// Create DataPoint instance
const dataPoint = DataPoint.create({
  // custom entity Types
  entityTypes: {
    // adds custom entity type 'render'
    render: RenderEntity
  },

  entities: {
    // uses new custom entity type
    'render:HelloWorld': {
      value: '$user',
      template: '<h1>Hello <%= name %>!!</h1>'
    }
  }
})

const data = {
  user: {
    name: 'World'
  }
}

dataPoint.transform('render:HelloWorld', data).then((acc) => {
  console.log(acc.value) // '<h1>Hello World!!</h1>'
})
```

Example at: [examples/custom-entity-type.js](examples/custom-entity-type.js)

## <a name="integrations">Integrations</a>

### Basic Express Example

The following example creates a DataPoint API by mapping entries and exposing them to a routing system using ExpressJS. 

```js
const app = express()

const dataPoint = DataPoint.create({ 
  /* data-point options */
})

app.get('/api/:entry', (req, res, next) =>{
  const {entry} = req.params
  dataPoint.transform(`entry:${entry}`, req.query, (err, res) => {
    if (err) {
      console.error('entry: %s failed!', entry)
      console.error(error.stack)
      next(err) // pass error to middleware chain
      return
    }
    // respond with result from data-point
    res.send(result.value))
  }))
})

app.listen(3000, function () {
  console.log('listening on port 3000!')
})
```

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE.md](LICENSE.md) file for details
