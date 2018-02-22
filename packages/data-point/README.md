# DataPoint

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master)

> JavaScript Utility for collecting, processing and transforming data.

DataPoint helps you reason with and streamline your data processing layer. With it you can collect, process, and transform data from multiple sources, and deliver the output in a tailored format to your end consumer. 

**Prerequisites**

Node v6 LTS or higher

**Installing**

```bash
npm install --save data-point
```

## Table of Contents

- [Getting Started](#getting-started)
- [DataPoint.create](#api-data-point-create)
- [Transforms](#transforms)
  - [dataPoint.resolve](#api-data-point-resolve)
  - [dataPoint.transform](#api-data-point-transform)
- [Reducers](#reducers)
  - [Accumulator](#accumulator)
  - [PathReducer](#path-reducer)
  - [FunctionReducer](#function-reducer)
  - [ObjectReducer](#object-reducer)
  - [EntityReducer](#entity-reducer)
  - [ListReducer](#list-reducer)
  - [Collection Mapping](#reducer-collection-mapping)
- [Reducer Helpers](#reducer-helpers)
  - [assign](#reducer-assign)
  - [map](#reducer-map)
  - [filter](#reducer-filter)
  - [find](#reducer-find)
  - [constant](#reducer-constant)
  - [parallel](#reducer-parallel)
  - [withDefault](#reducer-default)
- [Entities](#entities)
  - [dataPoint.addEntities](#api-data-point-add-entities)
  - [Built-in entities](#built-in-entities)
    - [Reducer / Transform](#reducer-entity)
    - [Model](#model-entity)
    - [Entry](#entry-entity)
    - [Request](#request-entity)
    - [Hash](#hash-entity)
    - [Collection](#collection-entity)
    - [Control](#control-entity)
    - [Schema](#schema-entity)
  - [Entity ComposeReducer](#entity-compose-reducer)
  - [Inspecting Entities](#inspecting-entities)
  - [Extending Entities](#extending-entities)
- [dataPoint.use](#api-data-point-use)
- [dataPoint.addValue](#api-data-point-add-value)
- [Custom Entity Types](#custom-entity-types)
- [Integrations](#integrations)
- [Patterns and Best Practices](#patterns-best-practices)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

This section is meant to get you started with basic concepts of DataPoint's API, for detailed API Documentation you can jump into [DataPoint.create](#api-data-point-create) section and move from there.

Additionally there is a [Hello World](https://www.youtube.com/watch?v=3VxP-FIWgF0) youtube tutorial that explains the data-point basics.

### <a name="hello-world">Hello World Example</a>

Trivial example of transforming a given **input** with a [FunctionReducer](#function-reducer).

```js
const DataPoint = require('data-point')
// create DataPoint instance
const dataPoint = DataPoint.create()

// reducer function that concatenates 
// accumulator.value with 'World'
const reducer = (input) => {
  return input + ' World'
}

// applies reducer to input
dataPoint
  .resolve(reducer, 'Hello')
  .then((output) => {
    // 'Hello World'
    console.log(output) 
  })
```

Example at: [examples/hello-world.js](examples/hello-world.js)

### Fetching remote services

Based on an initial feed, fetch and aggregate results from multiple remote services.

<details>
  <summary>Example</summary>

  Using the amazing [swapi.co](https://swapi.co) service, the example below gets information about a planet and the residents of that planet.

  ```js
  const DataPoint = require('data-point')
  // create DataPoint instance
  const dataPoint = DataPoint.create()
  const { map } = DataPoint.helpers

  // add entities to dataPoint instance
  dataPoint.addEntities({
    // remote service request
    'request:Planet': {
      // {value.planetId} injects the
      // value from the accumulator
      // creates: https://swapi.co/api/planets/1/
      url: 'https://swapi.co/api/planets/{value.planetId}'
    },

    // model entity to resolve a Planet
    'model:Planet': {
      inputType: 'schema:DataInput',
      value: [
        // hit request:Planet data source
        'request:Planet',
        // map result to ObjectReducer
        {
          // map name key
          name: '$name',
          population: '$population',
          // residents is an array of urls
          // eg. https://swapi.co/api/people/1/
          // where each url gets mapped
          // to a model:Resident
          residents: ['$residents', map('model:Resident')]
        }
      ]
    },

    // model entity to resolve a Planet
    'model:Resident': {
      inputType: 'string',
      value: [
        // hit request:Resident
        'request:Resident',
        // extract data
        {
          name: '$name',
          gender: '$gender',
          birthYear: '$birth_year'
        }
      ]
    },

    'request:Resident': {
      // check input is string
      inputType: 'string',
      url: '{value}'
    },

    // schema to verify data input
    'schema:DataInput': {
      schema: {
        type: 'object',
        properties: {
          planetId: {
            $id: '/properties/planet',
            type: 'integer'
          }
        }
      }
    }
  })

  const input = {
    planetId: 1
  }

  dataPoint.resolve('model:Planet', input)
    .then((output) => {
      /*
      output -> 
      { 
        name: 'Tatooine',
        population: 200000,
        residents:
        [ 
          { name: 'Luke Skywalker', gender: 'male', birthYear: '19BBY' },
          { name: 'C-3PO', gender: 'n/a', birthYear: '112BBY' },
          { name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY' },
          ...
        ] 
      }
      */
    })
  ```
</details>


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

<a name="setup-examples">**SETUP EXAMPLES**</a>

<details>
  <summary>Create a DataPoint object without configuring options</summary>
  
  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint.create()
  ```
  
  Create the DataPoint object and set options argument:
  
  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint
    .create({
      values: {
        foo: 'bar'
      },
      entities: {
        'transform:HelloWorld': (input) => {
          return `hello ${input}!!`
        }
      }
    })
  ```
</details>


## <a name="transforms">Transform</a>

### <a name="api-data-point-resolve">dataPoint.resolve()</a>

Execute a [Reducer](#reducers) against an input value. This function supports currying and will get executed when at least the first *2* parameters are provided.

**SYNOPSIS**

```js
dataPoint.resolve(reducer:Reducer, input:*, options:Object):Promise(output:*)
```

This method returns a **Promise** with the final output value.

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Reducer that manipulates the input. |
| *input* | `*` | Input value that you want to transform. If **none**, pass `null` or empty object `{}`. |
| *options* | [Object](#transform-options) | Options within the scope of the current transformation |

**EXAMPLES:**

- [Hello World](#hello-world) example.
- [With options](#acc-locals-example) example.
- [With constants in options](#options-with-constants) example.

### <a name="api-data-point-transform">dataPoint.transform()</a>


This method is similar to [dataPoint.resolve()](#api-data-point-resolve). The differences between this method and dataPoint.resolve are:

- `.transform()` accepts an optional third parameter for node style callback.
- `.transform()` returns a Promise that when resolved it will return the **full** [Accumulator](#accumulator) object instead of the `accumulator.value`. This may come in handy if you want to inspect other values from the transformation.  

**SYNOPSIS**

```js
// as promise
dataPoint.transform(reducer:Reducer, input:*, options:Object):Promise(acc:*)
// as nodejs callback function
dataPoint.transform(reducer:Reducer, input:*, options:Object, done:Function)
```

This method will return a **Promise** if `done` is omitted.

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Reducer that manipulates the input. |
| *input* | `*` | Input value that you want to transform. If **none**, pass `null` or empty object `{}`. |
| *options* | [Reducer](#reducers) | Request options. See this [example](#options-with-constants) for using constants in the reducer |
| *done* | `function` _(optional)_ | Error-first callback [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks) that has the arguments `(error, result)`, where `result` contains the final resolved [Accumulator](#accumulator). The actual transformation result will be inside the `result.value` property. |

**<a name="transform-options">Options</a>**

Options within the scope of the current transformation.

The following table describes the properties of the `options` argument. 

| Property | Type | Description |
|:---|:---|:---|
| *locals* | `Object` | Hash with values you want exposed to every reducer. See [example](#acc-locals-example). |
| *trace* | `boolean` | Set this to `true` to trace the entities and the time each one is taking to execute. **Use this option for debugging.** |

## <a name="reducers">Reducer</a>

Reducers are used to transform values **asynchronously**. DataPoint supports the following reducer types:

1. [PathReducer](#path-reducer)
2. [FunctionReducer](#function-reducer)
3. [ObjectReducer](#object-reducer)
4. [EntityReducer](#entity-reducer)
5. [ListReducer](#list-reducer)

### <a name="accumulator">Accumulator</a>

This object is passed to reducers and to middleware callbacks; it contains contextual information about the current transformation (or middleware) being executed. 

The `Accumulator.value` property is the data source from which you want to apply transformations. This property **SHOULD** be treated as **read-only immutable object**. Use it as your initial source and create a new object from it. This ensures that your reducers are [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976#.r4iqvt9f0); pure functions produce no side effects. 

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *value*  | `Object` | Value to be transformed. |
| *initialValue*  | `Object` | Initial value passed to the an entity. You can use this value as a reference to the initial value passed to your Entity before any reducer was applied. |
| *values*  | `Object` | Access to the values stored via [dataPoint.addValue](#api-data-point-add-value). |
| *params*  | `Object` | Value of the current Entity's params property. (for all entities except [Reducer](#reducer-entity)) |
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
| *$* | Reference to current `accumulator.value`. |
| *$..* | Gives you full access to current `accumulator`. |
| *$path* | Simple Object path notation to extract a path from current `accumulator.value`. |
| *$path[]* | Object path notation with trailing `[]` to extract a value from an array of objects at the `accumulator.value` for each. |

#### <a name="root-path">Root path $</a>

**EXAMPLES:**

<details>
  <summary>Gets the entire value</summary>

  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint.create()

  const input = {
    a: {
      b: [
        'Hello World'
      ]
    }
  }

  dataPoint
    .resolve('$', input)
    .then((output) => {
      assert.equal(output, input)
    })
  ```
</details>


#### <a name="accumulator-reference">Access accumulator reference $..</a>

<details>
  <summary>Access the reference of the accumulator.</summary>

  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint.create()

  const input = {
    a: {
      b: [
        'Hello World'
      ]
    }
  }

  dataPoint
    .resolve('$..value', input)
    .then(output => {
      assert.equal(output input)
    })
  ```
</details>


#### <a name="object-path">Object Path</a>

<details>
  <summary>Traverse an object's structure</summary>
  
  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint.create()
  
  const input = {
    a: {
      b: [
        'Hello World'
      ]
    }
  }
  
  dataPoint
    .resolve('$a.b[0]', input)
    .then(output => {
      assert.equal(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-path.js](examples/reducer-path.js)

#### <a name="object-map">Object Map</a>

<details>
  <summary>Map an array by traversing object structures</summary>
  
  ```js
  const DataPoint = require('data-point')
  const dataPoint = DataPoint.create()
  
  const input = [
    {
      a: {
        b: 'Hello World'
      }
    },
    {
      a: {
        b: 'Hello Solar System'
      }
    },
    {
      a: {
        b: 'Hello Universe'
      }
    }
  ]
  
  dataPoint
    .resolve('$a.b[]', input)
    .then(output => {
      assert.deepEqual(output, ['Hello World', 'Hello Solar System', 'Hello Universe'])
    })
  ```
</details>


### <a name="function-reducer">FunctionReducer</a>

A FunctionReducer allows you to use a function to apply a transformation. There are a couple of ways you may write your FunctionReducer:

- Synchronous `function` that returns new value
- Asynchronous `function` that returns a `Promise`
- Asynchronous `function` with callback parameter
- Asynchronous through [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) `function` **only if your environment supports it**

**IMPORTANT:** Be careful with the parameters passed to your reducer function, DataPoint relies on the number of arguments to detect the type of ReducerFunction it should expect. 

#### <a name="function-reducer">Returning a value</a>

The returned value is used as the new value of the transformation.

**SYNOPSIS**

```js
const name = (input:*, acc:Accumulator) => {
  return newValue
}
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *input* | `*` |  Reference to acc.value |
| *acc* | [Accumulator](#accumulator) | Current reducer's accumulator Object. The main property is `value`, which is the current reducer's value. |

<details>
  <summary>Reducer Function Example</summary>
  
  ```js
   const reducer = (input, acc) => {
    return input + ' World'
  }
  
  dataPoint
    .resolve(reducer, 'Hello')
    .then((output) => {
      assert.equal(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-function-sync.js](examples/reducer-function-sync.js)

#### <a name="function-reducer-returns-a-promise">Returning a Promise</a>

If you return a Promise its resolution will be used as the new value of the transformation. Use this pattern to resolve asynchronous logic inside your reducer.

**SYNOPSIS**

```js
const name = (input:*, acc:Accumulator) => {
  return Promise.resolve(newValue)
}
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *input* | `*` |  Reference to acc.value |
| *acc* | [Accumulator](#accumulator) |  Current reducer's accumulator Object. The main property is `acc.value`, which is the current reducer's value. |

<details>
  <summary>Example</summary>
  
  ```js
  const reducer = (input, acc) => {
    // input is a reference to acc.value
    return Promise.resolve(acc.value + ' World')
  }
  
  dataPoint
    .resolve(reducer, 'Hello')
    .then((output) => {
      assert.equal(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-function-promise.js](examples/reducer-function-promise.js)

#### <a name="function-reducer-with-callback">With a callback parameter</a>

Accepting a third parameter as a **callback** allows you to execute an asynchronous block of code. This callback is an error-first callback ([Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks)) that has the arguments `(error, value)`, where value will be the _value_ passed to the _next_ transform; this value becomes the new value of the transformation.

**SYNOPSIS**

```js
const name = (input:*, acc:Accumulator, next:function) => {
  next(error:Error, newValue:*)
}
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *input* | `*` |  Reference to acc.value |
| *acc* | [Accumulator](#accumulator) |  Current reducer's accumulator Object. The main property is `acc.value`, which is the current reducer's value. |
| *next* | `Function(error,value)` | [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks), where `value` is the value to be passed to the next reducer.

<details>
  <summary>Example</summary>
  
  ```js
  const reducer = (input, acc, next) => {
    next(null, input + ' World')
  }
  
  dataPoint
    .resolve(reducer, 'Hello')
    .then((output) => {
      assert.equal(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-function-with-callback.js](examples/reducer-function-with-callback.js)

<details>
  <summary>Throw an error from the reducer</summary>
  
  ```js
  const throwError = (error, acc, next) => {
    // passing first argument will be
    // handled as an error by the transform
    next(new Error('oh noes!!'))
  }
  
  dataPoint
    .transform(throwError, 'Hello')
    .catch((error) => {
      console.assert(error instanceof Error)
      console.log(error.toString()) // 'Error: oh noes!!'
    })
  ```
</details>


Example at: [examples/reducer-function-error.js](examples/reducer-function-error.js)

### <a name="object-reducer">ObjectReducer</a>

These are plain objects where the value of each key is a [reducer](#reducers). They're used to aggregate data or transform objects. For values that should be constants instead of reducers, you can use the [constant](#reducer-constant) reducer helper.

<details>
  <summary>Transforming an object</summary>
  
  ```js
  const inputData = {
    x: {
      y: {
        z: 2
      }
    }
  }
  
  const objectReducer = {
    y: '$x.y',
    zPlusOne: ['$x.y.z', (input) => input + 1]
  }
  
  // output from dataPoint.transform(objectReducer, inputData):
  
  {
    y: {
      z: 2
    },
    zPlusOne: 3 
  }
  ```
</details>


<details>
  <summary>Combining multiple requests</summary>
  
  ```js
  const dataPoint = require('data-point').create()
  
  dataPoint.addEntities({
    'request:Planet': {
      url: 'https://swapi.co/api/planets/{value}'
    }
  })
  
  const objectReducer = {
    tatooine: ['$tatooine', 'request:Planet'],
    alderaan: ['$alderaan', 'request:Planet']
  }
  
  const planetIds = {
    tatooine: 1,
    alderaan: 2
  }
  
  dataPoint.resolve(objectReducer, planetIds)
    .then(output => {
      // do something with the aggregated planet data!
    })
  
  ```
</details>


Each of the reducers, including the nested ones, are resolved against the same accumulator value. This means that input objects can be rearranged at any level:

<details>
  <summary>Rearranging input data</summary>
  
  ```js
  const inputData = {
    a: 'A',
    b: 'B',
    c: {
      x: 'X',
      y: 'Y'
    }
  })
  
  // some data will move to a higher level of nesting,
  // but other data will move deeper into the object
  const objectReducer = {
    x: '$c.x',
    y: '$c.y',
    z: {
      a: '$a',
      b: '$b'
    }
  }
  
  // output from dataPoint.resolve(objectReducer, inputData):
  
  {
    x: 'X',
    y: 'Y',
    z: {
      a: 'A',
      b: 'B'
    }
  }
  ```
</details>


Each of the reducers might contain more ObjectReducers (which might contain reducers, and so on). Notice how the output changes based on the position of the ObjectReducers in the two expressions:

<details>
  <summary>Nested Transform Expressions</summary>
  
  ```js
  const inputData = {
    a: {
      a: 1,
      b: 2
    }
  }
  
  const objectReducer = {
    x: [
      '$a',
      // this comes second, so it's resolved
      // against the output from the '$a' transform
      {
        a: '$a'
      }
    ],
    y: [
      // this comes first, so it's resolved
      // against the main input to objectReducer
      {
        a: '$a'
      },
      '$a'
    ]
  }
  
  // output from dataPoint.resolve(objectReducer, inputData):
  
  {
    x: {
      a: 1
    },
    y: {
      a: 1,
      b: 2
    }
  }
  ```
</details>

An empty `ObjectReducer` will resolve to an empty object:

```js
const reducer = {}

const input = { a: 1 }

dataPoint.resolve(reducer, input) // => {}
```

### <a name="entity-reducer">EntityReducer</a>

An EntityReducer is the actual implementation of an entity. When implementing an EntityReducer, you are actually passing the current [Accumulator](#accumulator) Object to an entity spec, to become its current Accumulator object.

For information about supported (built-in) entities, see the [Entities](#entities) Section.

**SYNOPSIS**

```js
'[?]<EntityType>:<EntityId>[[]]'
```

**OPTIONS**

| Option | Type | Description |
|:---|:---|:---|
| *?* | `String` | Only execute entity if `acc.value` is not equal to `false`, `null` or `undefined`. |
| *EntityType* | `String` | Valid Entity type. |
| *EntityID* | `String` | Valid Entity ID. Optionally, you may pass Closed brackets at the end `[]` to indicate collection mapping. |

<details>
  <summary>Entity Reducer Example</summary>
  
  ```js
  const input = {
    a: {
      b: 'Hello World'
    }
  }
  
  const toUpperCase = (input) => {
    return input.toUpperCase()
  }
  
  dataPoint.addEntities({
    'transform:getGreeting': '$a.b',
    'transform:toUpperCase': toUpperCase,
  })
  
  // resolve `transform:getGreeting`,
  // pipe value to `transform:toUpperCase`
  dataPoint
    .resolve(['transform:getGreeting | transform:toUpperCase'], input)
    .then((output) => {
      assert.equal(output, 'HELLO WORLD')
    })
  ```
</details>

### <a name="list-reducer">ListReducer</a>

A ListReducer is an array of reducers where the result of each reducer becomes the input to the next reducer. The reducers are executed serially and **asynchronously**. It's possible for a ListReducer to contain other ListReducers.

| ListReducer | Description |
|:---|:---|
| `['$a.b', (input) => { ... }]` | Get path `a.b`, pipe value to function reducer |
| `['$a.b', (input) => { ... }, 'hash:Foo']` | Get path `a.b`, pipe value to function reducer, pipe result to `hash:Foo` |

**IMPORTANT**: an empty `ListReducer` will resolve to `undefined`. This mirrors the behavior of empty functions.

```js
const reducer = []

const input = 'INPUT'

dataPoint.resolve(reducer, input) // => undefined
```

### <a name="reducer-conditional-operator">Conditionally execute an entity</a>

Only execute an entity if the accumulator value is **not** equal to `false`, `null` or `undefined`. If the conditional is not met, the entity will not be executed and the value will remain the same.

<details>
  <summary>Conditionally execute an entity</summary>

```js
const people = [
  {
    name: 'Luke Skywalker',
    swapiId: '1'
  },
  {
    name: 'Yoda',
    swapiId: null
  }
]

dataPoint.addEntities({
  'request:getPerson': {
    url: 'https://swapi.co/api/people/{value}'
  },
  'transform:getPerson': {
    name: '$name',
    // request:getPerson will only
    // be executed if swapiId is
    // not false, null or undefined
    birthYear: '$swapiId | ?request:getPerson | $birth_year'
  }
})

dataPoint
  .resolve('transform:getPerson[]', people)
  .then((output) => {
    assert.deepEqual(output, [
      {
        name: 'Luke Skywalker',
        birthYear: '19BBY'
      },
      {
        name: 'Yoda',
        birthYear: undefined
      }
    ])
  })
```

</details>

Example at: [examples/reducer-conditional-operator.js](examples/reducer-conditional-operator.js)

### <a name="reducer-collection-mapping">Collection Mapping</a>

Adding `[]` at the end of an entity reducer will map the given entity to each result of the current `value` if `value` is a collection. If the value is not a collection, the entity will ignore the `[]` directive.

<details>
  <summary>Reducer Collection Mapping Example</summary>
  
  ```js
  const input = {
    a: [
      'Hello World',
      'Hello Laia',
      'Hello Darek',
      'Hello Italy',
    ]
  }
  
  const toUpperCase = (input) => {
    return input.toUpperCase()
  }
  
  dataPoint.addEntities({
    'transform:toUpperCase': toUpperCase
  })
  
  dataPoint
    .resolve(['$a | transform:toUpperCase[]'], input)
    .then((output) => {
      assert.equal(output[0], 'HELLO WORLD')
      assert.equal(output[1], 'HELLO LAIA')
      assert.equal(output[2], 'HELLO DAREK')
      assert.equal(output[3], 'HELLO ITALY')
    })
  ```
</details>

## <a name="reducer-helpers">Reducer Helpers</a>

Reducer helpers are factory functions for creating reducers. They're exposed through `DataPoint.helpers`:

```js
const {
  assign,
  map,
  filter,
  find
} = require('data-point').helpers
```

### <a name="reducer-assign">assign</a>

The **assign** reducer creates a new Object by copying the values of all enumerable own properties resulting from the provided [Reducer](#reducers) with the current accumulator value. It uses [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) internally.

**SYNOPSIS**

```js
assign(reducer:Reducer):Object
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Result from the provided reducer will be merged into the current accumulator.value |

**EXAMPLE:**

<details>
  <summary>Add a key that references a nested value from the accumulator.</summary>

  ```js
  const {
    assign
  } = DataPoint.helpers

  const input = {
    a: 1
  }

  // merges the ReducerObject with
  // accumulator.value
  const reducer = assign({
    c: '$b.c'
  })

  dataPoint
    .resolve(reducer, input)
    .then(output => {
      /*
       output --> {
        a: 1,
        b: {
          c: 2
        },
        c: 2
      }
      */
    })

  ```
</details>

Example at: [examples/reducer-assign.js](examples/reducer-assign.js)

### <a name="reducer-map">map</a>

The **map** reducer creates a new array with the results of applying the provided [Reducer](#reducers) to every element in the input array.

**SYNOPSIS**

```js
map(reducer:Reducer):Array
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | The reducer will get applied to each element in the array. |

**EXAMPLE:**

<details>
  <summary>Apply a set of reducers to each item in an array</summary>

  ```js
  const {
    map
  } = DataPoint.helpers

  const input = [{
    a: 1
  }, {
    a: 2
  }]

  // get path `a` then multiply by 2
  const reducer = map(
    ['$a', (input) => input * 2]
  )

  dataPoint
    .resolve(reducer, input)
    .then(output => {
      // output -> [2, 4]
    })
  ```

</details>

Example at: [examples/reducer-helper-map.js](examples/reducer-helper-map.js)

### <a name="reducer-filter">filter</a>

The **filter** reducer creates a new array with elements that resolve as *truthy* when passed to the given [Reducer](#reducers).

**SYNOPSIS**

```js
filter(reducer:Reducer):Array
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Reducer result is used to test for _truthy_ on each element of the array. |

**EXAMPLE:**

<details>
  <summary>Find objects where path `a` is greater than 1</summary>

  ```js
  const {
    map
  } = DataPoint.helpers

  const input = [{ a: 1 }, { a: 2 }]

  // filters array elements that are not
  // truthy for the given reducer list
  const reducer = filter(
    ['$a', (input) => input > 1]
  )

  dataPoint
    .resolve(reducer, input) 
    .then(output => {
      // output ->  [{ a: 2 }]
    })  
  ```
</details>

Example at: [examples/reducer-helper-filter.js](examples/reducer-helper-filter.js)

### <a name="reducer-find">find</a>

The **find** reducer returns the first element of an array that resolves to _truthy_ when passed through the provided [Reducer](#reducers). It returns `undefined` if no match is found.

**SYNOPSIS**

```js
find(reducer:Reducer):*
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Reducer result is used to test for _truthy_ on each element of the array. |

**EXAMPLE:**

<details>
  <summary>Find elements where path `b` resolves to _truthy_ value</summary>

  ```js
  const {
    map
  } = DataPoint.helpers

  const input = [{ a: 1 }, { b: 2 }]

  // the $b reducer is truthy for the
  // second element in the array
  const reducer = find('$b')

  dataPoint
    .resolve(reducer, input) 
    .then(output => {
      // output -> { b: 2 }
    })
  ```
</details>

Example at: [examples/reducer-helper-find.js](examples/reducer-helper-find.js)

### <a name="reducer-constant">constant</a>

The **constant** reducer always returns the given value.

**SYNOPSIS**

```js
constant(value:*):*
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *value* | * | The value the reducer should return |

**EXAMPLE:**

<details>
  <summary>returning an object constant</summary>

  ```js
  const { constant } = DataPoint.helpers

  const input = {
    a: 1,
    b: 2
  }

  const reducer = {
    a: '$a',
    b: constant({
      a: '$a',
      b: 3
    })
  }

  dataPoint
    .resolve(reducer, input) 
    .then(output => {
      // {
      //   a: 1,
      //   b: {
      //     a: '$a',
      //     b: 3
      //   }
      // }
      }
    })
  ```
</details>


<details>
  <summary>constants that contain other reducers will not be evaluated</summary>

  ```js
  const { constant } = DataPoint.helpers

  const input = {
    b: 1
  }

  // ReducerObject that contains a ReducerPath ('$a')
  let reducer = {
    a: '$b'
  }

  dataPoint.resolve(reducer, input) // => { a: 1 }

  // both the object and the path will be treated as
  // constants instead of being used to create reducers
  reducer = constant({
    a: '$b'
  })

  dataPoint.resolve(reducer, input) // => { a: '$b' }
  ```
</details>

### <a name="reducer-parallel">parallel</a>

This resolves an array of reducers. The output is a new array where each element is the output of a reducer;
this contrasts with `ListReducer`, which returns the output from the last reducer in the array.

**SYNOPSIS**

```js
parallel(reducers:Array<Reducer>):Array
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducers* | Array<Reducer> | Source data to create an array of [reducers](#reducers) |

**EXAMPLE:**

<details>
  <summary>resolving an array of reducers with parallel</summary>

  ```js
  const { parallel } = DataPoint.helpers

  const reducer = parallel([
    '$a',
    ['$b', (input) => input + 2] // ReducerList
  ])

  const input = {
    a: 1,
    b: 2
  }

  dataPoint.resolve(reducer, input) // => [1, 4]
  ```
</details>

### <a name="reducer-default">withDefault</a>

The **withDefault** reducer adds a default value to any reducer type. If the reducer resolves to `null`, `undefined`, `NaN`, or `''`,
the default is returned instead.

**SYNOPSIS**

```js
withDefault(source:*, value:*):*
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *source* | * | Source data for creating a [reducer](#reducers)  |
| *value* | * | The default value to use (or a function that returns the default value) |

The default value is not cloned before it's returned, so it's good practice to wrap any Objects in a function.

**EXAMPLE:**

```js
const { withDefault } = DataPoint.helpers

const input = {
  a: undefined
}

// adds a default to a PathReducer
const r1 = withDefault('$a', 50)

dataPoint.resolve(r1, input) // => 50

// passing a function is useful when the default value is
// an object, because it returns a new object every time
const r2 = withDefault('$a', () => {
  return { b: 1 }
})

dataPoint.resolve(r2, input) // => { b: 1 }

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

- [Reducer / Transform](#reducer-entity)
- [Model](#model-entity)
- [Entry](#entry-entity)
- [Request](#request-entity)
- [Hash](#hash-entity)
- [Collection](#collection-entity)
- [Control](#control-entity)
- [Schema](#schema-entity)

#### <a name="entity-base-api">Entity Base API</a>

All entities share a common API (except for [Reducer](#reducer-entity)).

```js
{
  // type checks the entity's input
  inputType: String | Reducer,

  // executes --before-- any modifier
  before: Reducer,
  
  // executes --after-- any modifier
  after: Reducer,
  
  // type checks the entity's output
  outputType: String | Reducer,

  // executes in case there is an error at any
  // point of the entire transformation
  error: Reducer,
  
  // this object allows you to store and eventually
  // access it at any given time on any reducer
  params: Object
}
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*  | `Object` | User defined Hash that will be passed to every transform within the context of the transform's execution |


##### <a name="entity-type-check">Entity Type checking</a>

You may use **inputType** and **outputType** to type check against the values being passed and resolved from an entity. Type checking does not mutate the result. 

**Built in type checks:**

To use built-in type checks you may set the value of **inputType**/**outputType** to: `'string'`, `'number'`, `'boolean'`, `'function'`, `'error'`, `'array'`, or `'object'`. 

<details>
  <summary>Check if a model outputs an string</summary>

  This example uses a Model Entity, for information on what a model is please go to the [Model Entity](#model-entity) section.

  ```js
  const dataPoint = DataPoint.create()
  const helpers = DataPoint.helpers

  dataPoint.addEntities({
    'model:getName': {
      value: '$name',
      outputType: 'string'
    }
  })

  const input = {
    name: 'DataPoint'
  }

  dataPoint.resolve('model:getName', input)
    .then(output => {
      // output -> 'DataPoint'
    })
  ```

</details>

**Type Check using Reducer**

To customize type checking you may use a [Reducer](#reducers). If the reducer throws an error, the type check fails. In the case of `inputType` and `outputType` the return value is ignored.


<details>
  <summary>Custom type check with <a href="#function-reducer">FunctionReducer</a></summary>

  ```js
  const dataPoint = DataPoint.create()

  dataPoint.addEntities({
    'model:getName': {
      value: '$name',

      outputType: value => {
        if(typeof value === 'string' && value.length > 5) {
          return trues
        }

        throw new Error('should be string and length > 5')
      }
    }
  })

  const input = {
    name: 'DataPoint'
  }

  dataPoint.resolve('model:getName', input)
    .then(output => {
      // output -> 'DataPoint'
    })
  ```

</details>

<details>
  <summary>Custom type check with <a href="#entity-reducer">EntityReducer</a></summary>

  In this example we are using a [Schema Entity](#schema-entity) to check the inputType.

  ```js
  const dataPoint = DataPoint.create()

  dataPoint.addEntities({
    'model:getName': {
      // assume schema:RepoSchema 
      // exists and checks of the
      // existence of name
      inputType: 'schema:RepoSchema',
      value: '$name'
    }
  })

  const input = {
    name: 'DataPoint'
  }

  dataPoint.resolve('model:getName', input)
    .then(output => {
      // output -> DataPoint
    })
  ```

</details>


#### <a name="reducer-entity">Reducer Entity</a>

A Reducer entity is a 'snippet' that you can re-use in other entities. It does not expose the before/after/error/params API that other entities have.

IMPORTANT: Reducer Entities **do not support** [extension](#extending-entities).

**SYNOPSIS**

```js
dataPoint.addEntities({
  'reducer:<entityId>': Reducer
})
```

For backwards compatibility, the keyword **transform** can be used in place of **reducer**:

```js
dataPoint.addEntities({
  'transform:<entityId>': Reducer
})
```

<details>
  <summary>Reducer Entity Example</summary>
  
  ```js
  const input = {
    a: {
      b: {
        c: [1, 2, 3]
      }
    }
  }
  
  const getMax = (input) => {
    return Math.max.apply(null, input)
  }
  
  const multiplyBy = (number) => (input) => {
    return input * number
  }
  
  dataPoint.addEntities({
    'reducer:foo': ['$a.b.c', getMax, multiplyBy(10)]
  })
  
  dataPoint
    .resolve('reducer:foo', input)
    .then((output) => {
      assert.equal(output, 30)
    })
  ```
</details>


#### <a name="model-entity">Model Entity</a>

A Model entity is a generic entity that provides the [base modifiers](#entity-base-api).

**SYNOPSIS**

```js
dataPoint.addEntities({
  'model:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    value: Reducer,
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*  | `Object` | User defined Hash that will be passed to every transform within the context of the transform's execution |

##### <a name="model-value">Model.value</a>

<details>
  <summary>Using the `value` property to transform an input</summary>
  
  ```js
  const input = {
    a: {
      b: {1
        c: [1, 2, 3]
      }
    }
  }
  
  const getMax = (input) => {
    return Math.max.apply(null, input)
  }
  
  const multiplyBy = (number) => (input) => {
    return input * number
  }
  
  dataPoint.addEntities({
    'model:foo': {
      value: ['$a.b.c', getMax, multiplyBy(10)]
    }
  })
  
  dataPoint
    .resolve('model:foo', input)
    .then((output) => {
      assert.equal(output, 30)
    })
  ```
</details>


Example at: [examples/entity-model-basic.js](examples/entity-model-basic.js)

##### <a name="model-before">Model.before</a>

<details>
  <summary>Checking whether the value passed to an entity is an array</summary>
  
  ```js
  const toArray = (input) => {
    return Array.isArray(input)
      ? input
      : [input]
  }
  
  dataPoint.addEntities({
    'model:foo': {
      before: toArray,
      value: '$'
    }
  })
  
  dataPoint
    .resolve('model:foo', 100)
    .then((output) => {
      assert.deepEqual(output, [100])
    })
  ```
</details>


Example at: [examples/entity-model-before.js](examples/entity-model-before.js)

##### <a name="model-after">Model.after</a>

<details>
  <summary>Using `after` transform</summary>
  
  ```js
  const toArray = (input) => {
    return Array.isArray(input)
      ? input
      : [input]
  }
  
  dataPoint.addEntities({
    'model:foo': {
      value: '$a.b',
      after: isArray()
    }
  })
  
  const input = {
    a: {
      b: [3, 15]
    }
  }
  
  dataPoint
    .resolve('model:foo', input)
    .then((output) => {
      assert.deepEqual(output, [3, 15])
    })
  ```
</details>

##### <a name="model-error">Model.error</a>

Any error that happens within the scope of the Entity can be handled by the `error` transform. To respect the API, error reducers have the same API.

**Error handling**

Passing a value as the second argument will stop the propagation of the error.

**EXAMPLES:**

<details>
  <summary>Handling Entry Errors</summary>
  
  Let's resolve to a non-array value and see how it would be handled, this example will use [outputType](#entity-type-check) for type checking.

  ```js
  
  dataPoint.addEntities({
    'model:getArray': {
      // points to a NON Array value
      value: '$a.b',
      outputType: 'isArray',
      error: (error) => {
        // prints out the error
        // message generated by
        // isArray type check
        console.log(error.message)

        console.log('Value is invalid, resolving to empty array')

        // passing a value will stop
        // the propagation of the error
        return []
      }
    }
  })

  const input = {
    a: {
      b: 'foo'
    }
  }

  dataPoint
    .resolve('model:getArray', input)
    .then((output) => {
      assert.deepEqual(output, [])
    })
  ```
</details>


Example at: [examples/entity-model-error-handled.js](examples/entity-model-error-handled.js)

<details>
  <summary>Pass the array to be handled somewhere else</summary>
  
  ```js
  const logError = (error) => {
    console.log(error.toString())
    throw error
  }

  dataPoint.addEntities({
    'model:getArray': {
      value: '$a',
      outputType: 'isArray',
      error: logError
    }
  })
  
  const input = {
    a: {
      b: 'foo'
    }
  }
  
  dataPoint
    .resolve('model:getArray', input)
    .catch((error) => {
      console.log(error.toString())
    })
  ```
</details>


Example at: [examples/entity-model-error-rethrow.js](examples/entity-model-error-rethrow.js)

##### <a name="model-params">Entry.params</a>

The params object is used to pass custom data to your entity. This Object is exposed as a property of the [Accumulator](#accumulator) Object. Which can be accessed via a [FunctionReducer](#function-reducer), as well as through a [PathReducer](#path-reducer) expression.

<details>
  <summary>On a FunctionReducer</summary>
  
  ```js
  const multiplyValue = (input, acc) => {
    return input * acc.params.multiplier
  }
  
  dataPoint.addEntities({
    'model:multiply': {
      value: multiplyValue,
      params: {
        multiplier: 100
      }
    }
  })
  
  dataPoint
    .resolve('model:multiply', 200)
    .then((output) => {
      assert.deepEqual(output, 20000)
    })
  ```
</details>


<details>
  <summary>On a PathReducer</summary>
  
  ```js
  dataPoint.addEntities({
    'model:getParam': {
      value: '$..params.multiplier',
      params: {
        multiplier: 100
      }
    }
  })
  
  dataPoint.resolve('model:getParam')
    .then((output) => {
      assert.deepEqual(output, 100)
    })
  ```
</details>

#### <a name="entry-entity">Entry Entity</a>

This entity is very similar to the [Model entity](#model-entity). Its main difference is that this entity will default to an empty object `{ }` as its initial value if none was passed. As a best practice, use it as your starting point, and use it to call more complex entities.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'entry:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    value: Reducer,
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*  | `Object` | User defined Hash that will be passed to every transform within the context of the transform's execution |


#### <a name="request-entity">Request Entity</a>

Requests a remote source, using [request](https://github.com/request/request) behind the scenes. The features supported by `request` are exposed/supported by Request entity.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'request:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    url: StringTemplate,
    options: Reducer,
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check) |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *url*   | [StringTemplate](#string-template) | String value to resolve the request's url |
| *options* | [Reducer](#reducers) | reducer that returns an object to use as [request.js](https://github.com/request/request) options
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check) |
| *params*    | `Object` | User defined Hash that will be passed to every reducer within the context of the transform function's execution |

##### <a name="request-url">Request.url</a>

Sets the url to be requested.

<details>
  <summary>`Request.url` Example</summary>
  
  ```js
  dataPoint.addEntities({
    'request:getLuke': {
      url: 'https://swapi.co/api/people/1/'
    }
  })

  dataPoint.resolve('request:getLuke', {})
    .then(output => {
      /*
      output -> 
      {
        name: 'Luke Skywalker',
        height: '172',
        ...
      }
      */
    })
  ```
</details>


Example at: [examples/entity-request-basic.js](examples/entity-request-basic.js)

##### <a name="string-template">StringTemplate</a>

StringTemplate is a string that supports a **minimal** templating system. You may inject any value into the string by enclosing it within `{ObjectPath}` curly braces. **The context of the string is the Request's [Accumulator](#accumulator) Object**, meaning you have access to any property within it. 

Using `acc.value` property to make the url dynamic:

<details>
  <summary>`acc.value` Example</summary>
  
  ```js
  dataPoint.addEntities({
    'request:getLuke': {
      // inject the acc.value.personId
      url: 'https://swapi.co/api/people/{value.personId}/'
    }
  })

  const input = {
    personId: 1
  }

  dataPoint.resolve('request:getLuke', input)
    .then(output => {
      /*
      output -> 
      {
        name: 'Luke Skywalker',
        height: '172',
        ...
      }
      */
    })
  ```
</details>

Example at: [examples/entity-request-string-template.js](examples/entity-request-string-template.js)

<a name="acc-locals-example" >Using `acc.locals` property to make the url dynamic:</a>

<details>
  <summary>`acc.locals` example</summary>
  
  ```js
  dataPoint.addEntities({
    'request:getLuke': {
      url: 'https://swapi.co/api/people/{locals.personId}/'
    }
  })

  const options = {
    locals: {
      personId: 1
    }
  }

  dataPoint.resolve('request:getLuke', {}, options)
    .then(output => {
    /*
    output -> 
    {
      name: 'Luke Skywalker',
      height: '172',
      ...
    }
    */
    })

  ```
</details>

Example at: [examples/entity-request-options-locals.js](examples/entity-request-options-locals.js)

For more information on acc.locals: [Transform Options](#transform-options) and [Accumulator](#accumulator) Objects.

<a name="options-with-constants" >Using constants in the options reducer:</a>

<details>
  <summary>constants example</summary>

  ```js
  const DataPoint = require('data-point')
  const c = DataPoint.helpers.constant
  const dataPoint = DataPoint.create()

  dataPoint.addEntities({
    'request:searchPeople': {
      url: 'https://swapi.co/api/people',
      // options is a Reducer, but values
      // at any level can be wrapped as
      // constants (or just wrap the whole
      // object if all the values are static)
      options: {
        'content-type': c('application/json'), // constant
        qs: {
          // get path `searchTerm` from input
          // to dataPoint.resolve
          search: '$searchTerm'
        }
      }
    }
  })

  const input = {
    searchTerm: 'r2'
  }

  // the second parameter to transform is the input value
  dataPoint
    .resolve('request:searchPeople', input)
    .then(output => {
      assert.equal(output.results[0].name, 'R2-D2')
    })
  ```
</details>

Example at: [examples/entity-request-options.js](examples/entity-request-options.js)

For more examples of request entities, see the [Examples](examples), the [Integration Examples](test/definitions/integrations.js), and the unit tests: [Request Definitions](test/definitions/sources.js).

### <a name="request-inspect">Inspecting Request</a>

You may inspect a Request entity through the `params.inspect` property.

**note:** At the moment this feature is only available on Request entity, PRs are welcome.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'request:<entityId>': {
    params: {
      inspect: Boolean|Function
    }
  }
})
```

If `params.inspect` is `true` it will output the entity's information to the console.

If `params.inspect` is a `function`, you may execute custom debugging code to be executed before the actual request gets made. The function receives the current accumulator value as its only parameter.


#### <a name="hash-entity">Hash Entity</a>

A Hash entity transforms a _Hash_ like data structure. It enables you to manipulate the keys within a Hash. 

To prevent unexpected results, **Hash** can only process **Plain Objects**, which are objects created by the Object constructor. If [Hash.value](#hash-value) does not resolve to a Plain Object it will **throw** an error. 

Hash entities expose a set of reducers: [mapKeys](#hash-mapKeys), [omitKeys](#hash-omitKeys), [pickKeys](#hash-pickKeys), [addKeys](#hash-addKeys), [addValues](#hash-addValues). You may apply one or more of these reducers to a Hash entity. Keep in mind that those reducers will always be executed in a specific order:

```js
omitKeys -> pickKeys -> mapKeys -> addValues -> addKeys
```

If you want to have more control over the order of execution, you may use the [compose](#entity-compose-reducer) reducer.

**NOTE**: The Compose reducer is meant to operate only on Hash-type objects. If its context resolves to a non-Hash type, it will **throw an error**.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'hash:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    value: Reducer,
    mapKeys: TransformMap,
    omitKeys: String[],
    pickKeys: String[],
    addKeys: TransformMap,
    addValues: Object,
    compose: ComposeReducer[],
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value to which the Entity resolves |
| *mapKeys* | [ObjectReducer](#object-reducer) | Map to a new set of key/values. Each value accepts a reducer |
| *omitKeys* | `String[]` | Omits keys from acc.value. Internally, this uses the [omit](#reducer-omit) reducer helper |
| *pickKeys* | `String[]` | Picks keys from acc.value. Internally, this uses the [pick](#reducer-pick) reducer helper |
| *addKeys* | [ObjectReducer](#object-reducer) | Add/Override key/values. Each value accepts a reducer. Internally, this uses the [assign](#reducer-assign) reducer helper |
| *addValues* | `Object` | Add/Override hard-coded key/values. Internally, this uses the [assign](#reducer-assign) reducer helper |
| *compose* | [ComposeReducer](#compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one operation gets passed to the next one|
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*    | `Object` | User-defined Hash that will be passed to every reducer within the context of the transform function's execution |

##### <a name="hash-value">Hash.value</a>

<details>
  <summary>Resolve accumulator.value to a hash</summary>
  
  ```js
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
  
  dataPoint
    .resolve('hash:helloWorld', input)
    .then((output) => {
      assert.deepEqual(output, {
        c: 'Hello',
        d: ' World!!'
      })
    })
  ```
</details>


Example at: [examples/entity-hash-context.js](examples/entity-hash-context.js)

##### <a name="hash-mapKeys">Hash.mapKeys</a>

Maps to a new set of key/value pairs through a [ObjectReducer](#object-reducer), where each value is a [Reducer](#reducers).

Going back to our GitHub API examples, let's map some keys from the result of a request:

<details>
  <summary>Hash.mapKeys Example</summary>

  ```js
  const _ = require('lodash')
  
  dataPoint.addEntities({
    'hash:mapKeys': {
      mapKeys: {
        // map to acc.value.name
        name: '$name',
        // uses a ReducerList to 
        // map to acc.value.name
        // and generate a string with
        // a ReducerFunction
        url: [
          '$name',
          input => {
            return `https://github.com/ViacomInc/${_.kebabCase(input)}`
          }
        ]
      }
    }
  })

  const input = {
    name: 'DataPoint'
  }

  dataPoint.resolve('hash:mapKeys', input).then(output => {
    assert.deepEqual(output, {
      name: 'DataPoint',
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-mapKeys.js](examples/entity-hash-mapKeys.js)

##### <a name="hash-addKeys">Hash.addKeys</a>

Adds keys to the current Hash value. If an added key already exists, it will be overridden. 

Hash.addKeys is very similar to Hash.mapKeys, but the difference is that `mapKeys` will ONLY map the keys you give it, whereas `addKeys` will ADD/APPEND new keys to your existing `acc.value`. You may think of `addKeys` as an _extend_ operation. 

<details>
  <summary>Hash.addKeys Example</summary>
  
  ```js
  dataPoint.addEntities({
    'hash:addKeys': {
      addKeys: {
        nameLowerCase: ['$name', input => input.toLowerCase()],
        url: () => 'https://github.com/ViacomInc/data-point'
      }
    }
  })

  const input = {
    name: 'DataPoint'
  }

  dataPoint.resolve('hash:addKeys', input).then(output => {
    assert.deepEqual(output, {
      name: 'DataPoint',
      nameLowerCase: 'datapoint',
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-addKeys.js](examples/entity-hash-addKeys.js)

##### <a name="hash-pickKeys">Hash.pickKeys</a>

Picks a list of keys from the current Hash value.

The next example is similar to the previous example. However, instead of mapping key/value pairs, this example just picks some of the keys.

<details>
  <summary>Hash.pickKeys Example</summary>
  
  ```js
  dataPoint.addEntities({
    'hash:pickKeys': {
      pickKeys: ['url']
    }
  })

  const input = {
    name: 'DataPoint',
    url: 'https://github.com/ViacomInc/data-point'
  }

  dataPoint.resolve('hash:pickKeys', input).then(output => {
    // notice how name is no longer 
    // in the object
    assert.deepEqual(output, {
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-pickKeys.js](examples/entity-hash-pickKeys.js)

##### <a name="hash-omitKeys">Hash.omitKeys</a>

Omits keys from the Hash value.

This example will only **omit** some keys, and let the rest pass through:

<details>
  <summary>Hash.omitKeys Example</summary>
  
  ```js
  dataPoint.addEntities({
    'hash:omitKeys': {
      omitKeys: ['name']
    }
  })

  // notice how name is no longer in the object
  const expectedResult = {
    url: 'https://github.com/ViacomInc/data-point'
  }

  const input = {
    name: 'DataPoint',
    url: 'https://github.com/ViacomInc/data-point'
  }

  dataPoint.resolve('hash:omitKeys', input).then(output => {
    assert.deepEqual(output, expectedResult)
  })
  ```
</details>


Example at: [examples/entity-hash-omitKeys.js](examples/entity-hash-omitKeys.js)

##### <a name="hash-addValues">Hash.addValues</a>

Adds hard-coded values to the Hash value.

Sometimes you just want to add a hard-coded value to your current `acc.value`.

<details>
  <summary>Hash.addValues Example</summary>
  
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
  
  
  dataPoint
    .resolve('hash:addValues')
    .then((output) => {
      assert.deepEqual(output, expectedResult)
    })
  ```
</details>


##### Hash - adding multiple reducers

You can add multiple reducers to your Hash spec.

<details>
  <summary>Hash Multiple Reducers Example</summary>

  ```js
  const toUpperCase = (input) => {
    return input.toUpperCase()
  }
  
  dataPoint.addEntities({
    'entry:orgInfo': {
      value: 'request:getOrgInfo | hash:OrgInfo'
    },
    'request:getOrgInfo': {
      url: 'https://api.github.com/orgs/{value.org}',
      options: () => ({ headers: { 'User-Agent': 'DataPoint' } })
    },
    'hash:OrgInfo': {
      pickKeys: ['repos_url', 'name'],
      mapKeys: {
        reposUrl: '$repos_url',
        orgName: '$name',
      },
      addValues: {
        info: 'This is a test'
      },
      addKeys: {
        orgName: [`$orgName`, toUpperCase]
      }
    }
  })
  
  const expectedResult = {
    reposUrl: 'https://api.github.com/orgs/nodejs/repos',
    orgName: 'NODE.JS FOUNDATION',
    info: 'This is a test'
  }
  
  dataPoint
    .resolve('entry:orgInfo', { org: 'nodejs' })
    .then((output) => {
      assert.deepEqual(output, expectedResult)
    })
  ```
</details>


For examples of hash entities, see the [Examples](examples), on the unit tests: [Request Definitions](test/definitions/hash.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="collection-entity">Collection Entity</a>

A Collection entity enables you to operate over an array. Its API provides basic reducers to manipulate the elements in the array.

Collection entities expose a set of reducers that you may apply to them: [map](#collection-map), [find](#collection-find), [filter](#collection-filter). These reducers are executed in a [specific order](#collection-reducers-order). If you want to have more control over the order of execution, use the [compose](#compose-reducer) reducer.

To prevent unexpected results, a **Collection Entity** can only process **Arrays**, if Collection.value does not resolve to an Array it will **throw** an error. 

**IMPORTANT:** Keep in mind that in DataPoint, **all** operations are asynchronous. If your operations do NOT need to be asynchronous, iterating over a large array might result in slower execution. In such cases, consider using a reducer function where you can implement a synchronous solution.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'collection:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    value: Reducer,
    filter: Reducer,
    map: Reducer,
    find: Reducer,
    compose: ComposeReducer[],
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value to which the Entity resolves |
| *map* | [Reducer](#reducers) | Maps the items of an array. Internally, this uses the [map](#reducer-map) reducer helper |
| *find* | [Reducer](#reducers) | Find an item in the array. Internally, this uses the [find](#reducer-find) reducer helper |
| *filter* | [Reducer](#reducers) | Filters the items of an array. Internally, this uses the [filter](#reducer-filter) reducer helper |
| *compose* | [ComposeReducer](#compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one object gets passed to the next one |
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params* | `Object` | User-defined Hash that will be passed to every reducer within the context of the transform function's execution |

<a name="collection-reducers-order">The order of execution of is:</a>

```js
filter -> map -> find
```

##### <a name="collection-map">Collection.map</a>

Maps a transformation to each element in a collection.

Let's fetch all the repositories that the [NodeJs](https://github.com/nodejs) Org has available at the API: [https://api.github.com/orgs/nodejs/repos](https://api.github.com/orgs/nodejs/repos).

Now that we have the result of the fetch, let's now map each item, and then extract only one of each item's properties.

<details>
  <summary>Mapping a Collection</summary>
  
  ```js
  dataPoint.addEntities({
    'request:getOrgRepositories': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
    },
    'collection:getRepositoryTagsUrl': {
      map: '$tags_url'
    }
  })
  
  dataPoint
    .resolve('request:getOrgRepositories | collection:getRepositoryTagsUrl', {})
    .then((output) => {
      console.log(output)
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
</details>


The above example is fairly simple. The following example hits each of these urls, and gets information from them.

**Get latest tag of each repository:**

_For the purpose of this example, let's imagine that GitHub does not provide the url api to get the list of tags._

<details>
  <summary>Using a reducer in a Collection.map</summary>

  ```js
  dataPoint.addEntities({
    'request:getOrgRepositories': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({ headers: { 'User-Agent': 'request' } })
    },
    'request:getLatestTag': {
      // here we are injecting the current acc.value 
      // that was passed to the request
      url: 'https://api.github.com/repos/nodejs/{value}/tags',
      options: () => ({ headers: { 'User-Agent': 'request' } })
    },
    'collection:getRepositoryLatestTag': {
      // magic!! here we are telling it to map each 
      // repository.name to a request:getLatestTag, and return the entire source
      map: '$name | request:getLatestTag'
    }
  })
  
  dataPoint.resolve('request:getOrgRepositories | collection:getRepositoryLatestTag', {}).then((output) => {
    console.log(output)
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
</details>


To obtain the latest tag GitHub has on each repository:

```js
dataPoint.addEntities({
  'request:getOrgRepositories': {
    url: 'https://api.github.com/orgs/nodejs/repos'
  },
  'request:getLatestTag': {
    // here we are injecting the current acc.value 
    // that was passed to the request
    url: 'https://api.github.com/repos/nodejs/{value}/tags'
  },
  'collection:getRepositoryLatestTag': {
    // notice similar to previous example, BUT
    // we add a third reducer at the end to get 
    // the first element of each tag result,
    // and the name of it
    map: '$name | request:getLatestTag | $[0].name'
  }
})

dataPoint
  .resolve('request:getOrgRepositories | collection:getRepositoryLatestTag')
  .then((output) => {
    console.log(output)
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

<details>
  <summary>Filtering a collection using a function</summary>
  
  ```js
  dataPoint.addEntities({
    'request:getOrgRepositories': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
    },
    'collection:getRepositoryUrl': {
      map: '$url',
      filter: (input) => {
        return input.stargazers_count > 100
      }
    }
  })
  
  dataPoint
    .resolve(['request:getOrgRepositories', 'collection:getRepositoryUrl'])
    .then((output) => {
      console.log(output)
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
</details>


Because `filter` accepts a reducer, you could use it to check whether a property evaluates to a [Truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value.

The following example gets all the repos that are actually forks. In this case, because the `fork` property is a boolean, then you can do the following:

<details>
  <summary>Filter collection by the truthiness of a property</summary>

  ```js
  dataPoint.addEntities({
    'request:getOrgRepositories': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
    },
    'collection:getRepositoryUrl': {
      filter: '$fork'
    }
  })
  
  dataPoint
    .resolve(['request:getOrgRepositories', 'collection:getRepositoryUrl'])
    .then((output) => {
      console.log(output)
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
</details>


##### <a name="collection-find">Collection.find</a>

Returns the value of the first element in the array that satisfies the provided testing transform. Otherwise, `undefined` is returned.

<details>
  <summary>Find a repository with name equals: `node`</summary>
  
  ```js
  dataPoint.addEntities({
    'request:repos': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
    },
    'collection:getNodeRepo': {
      before: 'request:repos',
      find: (input) => {
        // notice we are checking against the property -name- 
        return input.name === 'node'
      }
    }
  })
  
  dataPoint
    .resolve('request:repos | collection:getNodeRepo')
    .then((output) => {
      console.log(output)
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
</details>


##### <a name="collection-compose">Collection.compose</a>

`Collection.compose` receives an array of **modifiers**  (filter, map, find). You may add as many modifiers as you need, in any order, by _composition_.

**IMPORTANT:** The order of the modifiers is important. Keep in mind that `Collection.find` returns the **matched** element. However, the `map` and `filter` modifiers expect an array. If your matched item is **NOT** an array, the entity will **throw an error**.

<details>
  <summary>Basic `Collection.find` with `compose` example</summary>
  
  ```js
  const isEqualTo = (match) => (input) => {
    return input === match
  }
  
  dataPoint.addEntities({
    'request:repos': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
    },
    'collection:getNodeRepo': {
      before: 'request:repos',
      compose: [{
        // passing the value of property -name- to the
        // next reducer, which will compare to a given value 
        find: ['$name', isEqualTo('node')]
      }]
    }
  };
  
  dataPoint
    .resolve('request:repos | collection:getNodeRepo')
    .then((output) => {
      console.log(output)
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
</details>


<details>
  <summary>Get all forks and map them to a Hash entity</summary>
  
  ```js
  const isEqualTo = (match) => (input) => {
    return input === match
  }
  
  dataPoint.addEntities({
    'request:repos': {
      url: 'https://api.github.com/orgs/nodejs/repos',
      options: () => ({
        headers: {
          'User-Agent': 'request'
        }
      })
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
  
  dataPoint
    .resolve('request:repos | collection:forkedReposSummary')
    .then((output) => {
      console.log(output)
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
</details>


For more examples of collection entities, see the [Examples](examples), on the unit tests: [Request Definitions](test/definitions/collection.js), and [Integration Examples](test/definitions/integrations.js)

#### <a name="control-entity">Control Entity</a>

The Flow Control entity allows you to control the flow of your transformations.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'control:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    select: [
      { case: Reducer, do: Transform },
      ...
      { default: Transform }
    ],
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object,
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before* | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *select* | [Case Statements](#case-statements)`[]` | Array of case statements, and a default fallback |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |

##### <a name="case-statements">Case Statements</a>

The `select` array may contain one or more case statements, similar to a `switch` in plain JavaScript. It executes from top to bottom, until it finds a case statement that results in a `truthy` value. Once it finds a match, it will execute its `do` reducer to resolve the entity.

If no case statement resolves to `truthy`, then the default statement will be used as the entity's resolution. 

**IMPORTANT:**

`default` is mandatory. If it is not provided, DataPoint will produce an error when trying to parse the entity.

```js

const isEqual = (compareTo) => (input) => {
  return input === compareTo
}

const resolveTo = (newValue) => (input) => {
  return input
}

const throwError = (message) => (input) => {
  throw new Error(message)
}

dataPoint.addEntities({
  'control:fruitPrices': {
    select: [
      { case: isEqual('oranges'), do: resolveTo(0.59) },
      { case: isEqual('apples'), do: resolveTo(0.32) },
      { case: isEqual('bananas'), do: resolveTo(0.48) },
      { case: isEqual('cherries'), do: resolveTo(3.00) },
      { default: throwError('Fruit was not found!! Maybe call the manager?') },
    ]
  }
})

dataPoint.resolve('control:fruitPrices', 'apples').then((output) => {
  console.log(output) // 0.32
});

dataPoint.resolve('control:fruitPrices', 'cherries').then((output) => {
  console.log(output) // 3.00 expensive!! 
});

dataPoint.resolve('control:fruitPrices', 'plum')
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
    before: Reducer,
    inputType: String | Reducer,
    value: Reducer,
    schema: JSONSchema,
    options: Object,
    after: Reducer,
    outputType: String | Reducer,
    error: Reducer,
    params: Object
  }
})
```

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *inputType*  | String, [Reducer](#reducers) | type checks the entity's input value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *before* | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value that this entity will pass to the schema validation |
| *schema* | `Object` | Valid [JSON Schema](http://json-schema.org/documentation.html) object. If the schema is not valid, an error is thrown when creating the entity. |
| *options* | `Object` | Avj's [options](https://github.com/epoberezkin/ajv#options) object
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | type checks the entity's output value, does not mutate value. [Entity Type checking](#entity-type-check). |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |

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

**EXAMPLES**

<details>
  <summary>Reuse the options from an extension</summary>

  ```js
  dataPoint.addEntities({
    'entry:getReposWithAllTags': {
      value: 'request:repositories'
    },
    'request:githubBase': {
      options: () => ({ headers: { 'User-Agent': 'DataPoint' } })
    },
    'request:repositories -> request:githubBase': {
      // options object is provided 
      // by request:githubBase
      url: 'https://api.github.com/orgs/{locals.orgName}/repos'
    }
  })
  
  const options = {
    locals: {
      orgName: 'nodejs'
    }
  }
  
  dataPoint.resolve('entry:getReposWithAllTags', null, options).then((output) => {
    // returns all the repos
    // for nodejs org
    console.log(output) 
  })
  ```
</details>


Example at: [examples/extend-entity-keys.js](examples/extend-entity-keys.js)

<details>
  <summary>Extend Entity Reusability</summary>

  ```js
  dataPoint.addEntities({
    'hash:multiply': {
      mapKeys: {
        multiplyByFactor: '$multiplier | model:multiplyBy',
        multiplyBy20: '$multiplier | model:multiplyBy20'
      }
    },
    'model:multiplyBy': {
      value: (input, acc) => input * acc.params.multiplicand,
      params: {
        multiplicand: 1
      }
    },
    'model:multiplyBy20 -> model:multiplyBy': {
      // through the params property
      // we can parameterize the 
      // base entity
      params: {
        multiplicand: 20
      }
    }
  })

  dataPoint.resolve('hash:multiply', {multiplier: 5}).then((output) => {
    console.log(output)
    /*
    {
      multiplyByFactor: 5,
      multiplyBy20: 100
    }
    */
  })
  ```
</details>


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
| *id* | `string` | middleware ID is a two part string in the form of `<EntityType>:<EventType>`, where `<EntityType>` may be `entry`, `model`, `request`, or any other registered entity type. `<EventType>` is either `before` or `after`. |
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

DataPoint exposes a set of methods to help you build your own Custom Entity types. With them you can build on top of the [base entity API](#entity-base-api).

### <a name="adding-entity-types">Adding new Entity types</a>

You can add custom Entity types when creating a DataPoint instance with [DataPoint.create](#api-data-point-create); you can also add them later with [dataPoint.addEntityType](#data-point-add-entity-type) and/or [dataPoint.addEntityTypes](#data-point-add-entity-types).

#### <a name="data-point-add-entity-types">dataPoint.addEntityType</a>

Add a new Entity type to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityType(id:String, spec:Object)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *id* | `String` | The name of the new Entity type. |
| *spec* | `Object` | The Entity spec. |

#### <a name="data-point-add-entity-types">dataPoint.addEntityType</a>

Adds a single Entity Type to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityType(name:String, spec:Object)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *name* | `Object` | Name of the new Entity Type |
| *spec* | `Object` | New [Entity spec](#custom-entity-spec) API |

#### <a name="data-point-add-entity-types">dataPoint.addEntityTypes</a>

Adds one or more Entity Types to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityTypes(specs:Object)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *specs* | `Object` | Key/value hash where each key is the name of the new Entity Type and value is the [Entity spec](#custom-entity-spec) API. |

#### <a name="custom-entity-spec">Custom Entity Spec</a>

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
function resolve(acc:Accumulator, resolveReducer:function):Promise<Accumulator>
```

<details>
  <summary>Example</summary>

  ```js
  const _ = require('lodash')

  const DataPoint = require('../')

  // Entity Class
  function RenderTemplate () {
  }

  /**
  * Entity Factory
  * @param {*} spec - Entity Specification
  * @param {string} id - Entity id
  * @return {RenderTemplate} RenderTemplate Instance
  */
  function create (spec, id) {
    // create an entity instance
    const entity = DataPoint.createEntity(RenderTemplate, spec, id)
    // set/create template from spec.template value
    entity.template = _.template(_.defaultTo(spec.template, ''))
    return entity
  }

  /**
  * Resolve entity
  * @param {Accumulator} accumulator
  * @param {function} resolveReducer
  * @return {Promise}
  */
  function resolve (accumulator, resolveReducer) {
    // get Entity Spec
    const spec = accumulator.reducer.spec
    // resolve 'spec.value' reducer against accumulator
    return resolveReducer(accumulator, spec.value)
      .then((acc) => {
        // execute lodash template against accumulator value
        const output = spec.template(acc.value)
        // creates a new acc object with new value
        return Object.assign({}, acc, {
          value: output
        })
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

  const input = {
    user: {
      name: 'World'
    }
  }

  dataPoint
    .resolve('render:HelloWorld', input)
    .then((output) => {
      assert.equal(output, '<h1>Hello World!!</h1>')
    })
  ```
</details>


Example at: [examples/custom-entity-type.js](examples/custom-entity-type.js)

## <a name="integrations">Integrations</a>

### Basic Express Example

The following example creates a DataPoint API by mapping entries and exposing them to a routing system using ExpressJS. 

```js
const app = express()

const dataPoint = DataPoint.create({ 
  /* data-point options */
})

app.get('/api/:entry', (req, res, next) => {
  const {entry} = req.params
  dataPoint.resolve(`entry:${entry}`, req.query)
    .then((output) => {
      res.send((output)
    })
    .catch((error) => {
      console.error('entry: %s failed!', entry)
      console.error(error.stack)
      next(err) // pass error to middleware chain
      return
    })    
})


app.listen(3000, function () {
  console.log('listening on port 3000!')
})
```

## <a name="patterns-best-practices">Patterns and Best Practices</a>

This section documents some of the patterns and best practices we have found useful while using DataPoint.

### Parameterize a FunctionReducer

You may use a [higher order function](https://medium.com/javascript-scene/higher-order-functions-composing-software-5365cf2cbe99) to parameterize a [FunctionReducer](#function-reducer). To do this you will create a function that **must** return a [FunctionReducer](#function-reducer).

```js
// sync
const name = (param1, param2, ...) => (input:*, acc:Accumulator) => {
  return newValue
}
// async via promise
const name = (param1, param2, ...) => (input:*, acc:Accumulator) => {
  return Promise.resolve(newValue)
}
// async via callback
const name = (param1, param2, ...) => (input:*, acc:Accumulator, next:function) => {
  next(error:Error, newValue:*)
}
```

<details>
  <summary>Higher Order Reducer Example</summary>
  
  ```js
  const addStr = (newString) => (input) => {
    return `${input}${newString}`
  }
  
  dataPoint
    .resolve(addStr(' World!!'), 'Hello')
    .then((output) => {
      assert.equal(output, 'Hello World!!')
    })
  ```
</details>


Example at: [examples/reducer-function-closure.js](examples/reducer-function-closure.js)

### Keeping your FunctionReducers pure

When it comes to creating your own reducer functions you want them to be [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976#.r4iqvt9f0); this is so they do not produce any side effects. 

In the context of a [FunctionReducer](#function-reducer) it means you should never change directly (or indirectly) the value of the [Accumulator.value](#accumulator). 

<details>
  <summary>Example</summary>

  ```js
  const badReducer = () => (input) => {
    // never ever modify the value object.
    input[1].username = 'foo'

    // keep in mind JS is by reference
    // so this means this is also
    // modifying the value object
    const image = input[1]
    image.username = 'foo'

    // pass value to next reducer
    return input
  }

  // this is better
  const fp = require('lodash/fp')
  const goodReducer = () => (input) => {
    // https://github.com/lodash/lodash/wiki/FP-Guide
    // this will cause no side effects
    const newValue = fp.set('[1].username', 'foo', input)

    // pass value to next reducer
    return newValue
  }
  ```
</details>

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
