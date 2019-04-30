# DataPoint

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![codecov](https://codecov.io/gh/ViacomInc/data-point/branch/master/graph/badge.svg)](https://codecov.io/gh/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](https://github.com/ViacomInc/data-point#contributors)

> JavaScript Utility for collecting, processing and transforming data.

DataPoint helps you reason with and streamline your data processing layer. With it you can collect, process, and transform data from multiple sources, and deliver the output in a tailored format to your end consumer. 

**Prerequisites**

Node v8 LTS or higher

**Installing**

```bash
npm install --save data-point
```

## Table of Contents

- [Getting Started](#getting-started)
  - [Hello World Example](#hello-world-example)
  - [Fetching remote services](#fetching-remote-services)
- [API](#api)
  - [create](#create)
  - [createReducer](#createreducer)
  - [resolve](#resolve)
  - [transform](#transform)
  - [addEntities](#addentities)
  - [addValue](#addvalue)
- [Accumulator](#accumulator)
- [Reducers](#reducers)
  - [function](#function-reducer)
  - [object](#object-reducer)
  - [entity](#entity-reducer)
  - [entity-id](#entity-by-id-reducer)
  - [list](#list-reducer)
- [Reducer Helpers](#reducer-helpers)
  - [assign](#assign)
  - [map](#map)
  - [filter](#filter)
  - [find](#find)
  - [constant](#constant)
  - [parallel](#parallel)
  - [withDefault](#withdefault)
- [Entities](#entities)
  - [Instance Entity](#instance-entity)
  - [Registered Entity](#registered-entity)
  - [Entity Base API](#entity-base-api)
  - [Entity type check](#entity-type-check)
  - [Entity types](#entity-types)
    - [Reducer](#reducer)
    - [Model](#model)
    - [Entry](#entry)
    - [Request](#request)
    - [Hash](#hash)
    - [Collection](#collection)
    - [Control](#control)
    - [Schema](#schema)
  - [Entity ComposeReducer](#entity-compose-reducer)
  - [Extending Entities](#extending-entities)
  - [Global Entity Options](#global-entity-options)
- [Middleware](#middleware)
  - [dataPoint.use](#datapointuse)
- [Custom Entity Types](#custom-entity-types)
- [Tracing DataPoint calls](#tracing-datapoint-calls)
- [Integrations](#integrations)
- [Patterns and Best Practices](#patterns-and-best-practices)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

DataPoint provides the following mechanisms for transforming data:

- [Reducers](#reducers) - these are the simplest transformations; think of them as DataPoint "primitives"

- [Entities](#entities) - these are more complex transformations that are defined using one or more reducers

- [Middleware](#middleware) - middleware functions give the user more control when resolving entities; they're useful to implement caching and other metatasks

The following examples demonstrate some of these concepts. For detailed API documentation, you can jump into the [DataPoint.create](#create) section and move from there.

Additionally, there is a [Hello World](https://www.youtube.com/watch?v=3VxP-FIWgF0) YouTube tutorial that explains the basics of DataPoint.

### Hello World Example

Trivial example of transforming a given **input** with a [function reducer](#function-reducer).

```js
const DataPoint = require('data-point')
// create DataPoint instance
const dataPoint = DataPoint.create()

// function reducer that concatenates
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

  const {
    Request,
    Model,
    Schema,
    map
  } = DataPoint

  // schema to verify data input
  const PlanetSchema = Schema('PlanetSchema', {
    schema: {
      type: 'object',
      properties: {
        planetId: {
          $id: '/properties/planet',
          type: 'integer'
        }
      }
    }
  })

  // remote service request
  const PlanetRequest = Request('Planet', {
    // {value.planetId} injects the
    // value from the accumulator
    // creates: https://swapi.co/api/planets/1/
    url: 'https://swapi.co/api/planets/{value.planetId}'
  })

  const ResidentRequest = Request('Resident', {
    // check input is string
    inputType: 'string',
    url: '{value}'
  })

  // model entity to resolve a Planet
  const ResidentModel = Model('Resident', {
    inputType: 'string',
    value: [
      // hit request:Resident
      ResidentRequest,
      // extract data
      {
        name: '$name',
        gender: '$gender',
        birthYear: '$birth_year'
      }
    ]
  })

  // model entity to resolve a Planet
  const PlanetModel = Model('Planet', {
    inputType: PlanetSchema,
    value: [
      // hit request:Planet data source
      PlanetRequest,
      // map result to an object reducer
      {
        // map name key
        name: '$name',
        population: '$population',
        // residents is an array of urls
        // eg. https://swapi.co/api/people/1/
        // where each url gets mapped
        // to a model:Resident
        residents: ['$residents', map(ResidentModel)]
      }
    ]
  })

  const input = {
    planetId: 1
  }

  dataPoint.resolve(PlanetModel, input)
    .then((output) => {
      console.log(output)
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

Example at: [examples/full-example-instances.js](examples/full-example-instances.js)

## API

### create

Static method that creates a DataPoint instance.

**SYNOPSIS**

```js
DataPoint.create([options])
```

**Arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *options* | `Object` (_optional_) | This parameter is optional, as are its properties (values, entities, and entityTypes). You may configure the instance later through the instance's API. |

The following table describes the properties of the `options` argument. 

| Property | Type | Description |
|:---|:---|:---|
| *values* | `Object` | Hash with values you want exposed to every [Reducer](#reducers) |
| *entities* | `Object` | Application's defined [entities](#entities) |
| *entityTypes* | `Object` | [Custom Entity Types](#custom-entity-types) |

**RETURNS**

DataPoint instance.

#### DataPoint.create example

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
        'reducer:HelloWorld': (input) => {
          return `hello ${input}!!`
        }
      }
    })
  ```
</details>


### createReducer
Static method that creates a reducer, which can be executed with [resolve](#resolve) or [transform](#transform).

**SYNOPSIS**

```js
DataPoint.createReducer(source:*, [options:Object]):Reducer
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *source* | `*` | Spec for any of the supported [Reducer types](#reducers) |
| *options* | `Object` | Optional config object  |


**Options**

| Property | Type | Description |
|:---|:---|:---|
| *default* | `*` | Default value for the reducer. Setting this value is equivalent to using the [withDefault](#withdefault) reducer helper. |


### resolve

Execute a [Reducer](#reducers) against an input value. This function supports currying and will be executed when at least the first *2* parameters are provided.

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
| *options* | `Object` | Options within the scope of the current transformation. More details available [here](#transform-options). |

**EXAMPLES:**

- [Hello World](#hello-world-example) example.
- [With options](#acc-locals-example) example.


### transform

This method is similar to [dataPoint.resolve](#resolve). The differences between the methods are:

- `.transform()` accepts an optional third parameter for node style callback.
- `.transform()` returns a Promise that resolves to the **full** [Accumulator](#accumulator) object instead of `accumulator.value`. This may come in handy if you want to inspect other values from the transformation.

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
| *options* | `Object` | Options within the scope of the current transformation |
| *done* | `function` _(optional)_ | Error-first [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks) with the arguments `(error, accumulator)`. The second parameter is an [Accumulator](#accumulator) object where `accumulator.value` is the actual result of the transformation.

### transform options

The following table describes the properties of the `options` argument. 

| Property | Type | Description |
|:---|:---|:---|
| *locals* | `Object` | Hash with values you want exposed to every reducer. See [example](#acc-locals-example). |
| *trace* | `boolean` | Set this to `true` to trace the entities and the time each one is taking to execute. **Use this option for debugging.** |

### resolveFromAccumulator

Execute a [Reducer](#reducers) from a provided Accumulator. This function will attempt at resolving a reducer providing an already constructed Accumulator Object. It will take the value provided in the Accumulator object to use as the input.

**SYNOPSIS**

```js
dataPoint.resolveFromAccumulator(reducer:Reducer, acc:Accumulator):Promise(acc:Accumulator)
```

This method returns a **Promise** with the final output value.

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Reducer that manipulates the input. |
| *acc* | [Accumulator](#accumulator) | Reducer's accumulator Object. The main property is `value`, which is the value the  reducer will use as its input. |

### addEntities

This method adds new [entities](#entities) to a DataPoint instance.

**SYNOPSIS**

When defining new entities, `<EntityType>` must refer to either a [built-in type](#entity-types) like `'model'` or a [custom entity type](#custom-entity-types). `<EntityId>` should be unique for each type; for example, `model:foo` and `hash:foo` can both use the `foo` ID, but an error is thrown if `model:foo` is defined twice.


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
| *EntityType* | `string` | valid entity type |
| *EntityId* | `string` | unique entity ID |


### addValue

Stores any value to be accessible via [Accumulator](#accumulator).values. This object can also be set by passing a `values` property to [DataPoint.create](#create).

**SYNOPSIS**

```js
dataPoint.addValue(objectPath, value)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *objectPath* | `string` | object path where you want to add the new value. Uses [_.set](https://lodash.com/docs/4.17.4#set) to append to the values object |
| *value* | `*` | anything you want to store |

## Accumulator

This object is passed to reducers and middleware callbacks; it has contextual information about the current transformation or middleware that's being resolved.

The `accumulator.value` property is the current input data. This property should be treated as a **read-only immutable object**. This helps ensure that your reducers are [pure functions](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976#.r4iqvt9f0) that produce no side effects. If the value is an object, use it as your initial source for creating a new object.

**Properties exposed:**

| Key | Type | Description |
|:---|:---|:---|
| *value*  | `Object` | Value to be transformed. |
| *initialValue*  | `Object` | Initial value passed to the entity. You can use this value as a reference to the initial value passed to your Entity before any reducer was applied. |
| *values*  | `Object` | Access to the values stored via [dataPoint.addValue](#addvalue). |
| *params*  | `Object` | Value of the current Entity's params property. (for all entities except [Reducer](#reducer)) |
| *locals*  | `Object` | Value passed from the `options` _argument_ when executing [dataPoint.transform](#transform). |
| *reducer*  | `Object` | Information relative to the current [Reducer](#reducers) being executed. |
| *debug*  | `Function` | [debug](https://github.com/visionmedia/debug) method with scope `data-point` |

## Reducers

Reducers are used to transform values **asynchronously**. DataPoint supports the following reducer types:

1. [path](#path-reducer)
2. [function](#function-reducer)
3. [object](#object-reducer)
4. [entity](#entity-reducer)
5. [entity-id](#entity-by-id-reducer)
6. [list](#list-reducer)

### Path Reducer

A path reducer is a `string` that extracts a path from the current [Accumulator](#accumulator) value (which must be an Object). It uses lodash's [_.get](https://lodash.com/docs/4.17.4#get) behind the scenes.

**SYNOPSIS**

```js
'$[.|..|<path>]'
```

**OPTIONS**

| Option | Description |
|:---|:---|
| *$* | Reference to current `accumulator.value`. |
| *$..* | Gives full access to `accumulator` properties (i.e. `$..params.myParam`). |
| *$path* | Object path notation to extract data from `accumulator.value`. |
| *$path[]* | Appending `[]` will map the reducer to each element of an input array. If the current accumulator value is not an array, the reducer will return `undefined`.

#### Root path $

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
      assert.strictEqual(output, input)
    })
  ```
</details>


#### Access accumulator reference

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
      assert.strictEqual(output input)
    })
  ```
</details>


#### Object Path

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
      assert.strictEqual(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-path.js](examples/reducer-path.js)

#### Object Map

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
      assert.deepStrictEqual(output, ['Hello World', 'Hello Solar System', 'Hello Universe'])
    })
  ```
</details>


### Function Reducer

A function reducer allows you to use a function to apply a transformation. There are several ways to define a function reducer:

- Synchronous `function` that returns new value
- Asynchronous `function` that returns a `Promise`
- Asynchronous `function` with callback parameter
- Asynchronous `function` through [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) **(only if your environment supports it)**

**IMPORTANT:** Be careful with the parameters passed to your function reducer; DataPoint relies on the number of arguments to detect the type of function reducer it should expect.

#### Returning a value

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
  <summary>Function Reducer Example</summary>
  
  ```js
   const reducer = (input, acc) => {
    return input + ' World'
  }
  
  dataPoint
    .resolve(reducer, 'Hello')
    .then((output) => {
      assert.strictEqual(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-function-sync.js](examples/reducer-function-sync.js)

#### Returning a Promise

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
      assert.strictEqual(output, 'Hello World')
    })
  ```
</details>


Example at: [examples/reducer-function-promise.js](examples/reducer-function-promise.js)

#### With a callback parameter

Accepting a third parameter as a **callback** allows you to execute an asynchronous block of code. This should be an error-first, [Node.js style callback](https://nodejs.org/api/errors.html#errors_node_js_style_callbacks) with the arguments `(error, value)`, where value will be the _value_ passed to the _next_ transform; this value becomes the new value of the transformation.

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
      assert.strictEqual(output, 'Hello World')
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

### Object Reducer

These are plain objects where the value of each key is a [Reducer](#reducers). They're used to aggregate data or transform objects. You can add constants with the [constant](#constant) reducer helper, which is more performant than using a function reducer:

```js
const { constant } = require('data-point')

const objectReducer = {
  // in this case, x and y both resolve to 42, but DataPoint
  // can optimize the resolution of the constant value
  x: () => 42,
  y: constant(42)
}
```

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


Each of the reducers might contain more object reducers (which might contain other reducers, and so on). Notice how the output changes based on the position of the object reducers in the two expressions:

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

An empty object reducer will resolve to an empty object:

```js
const reducer = {}

const input = { a: 1 }

dataPoint.resolve(reducer, input) // => {}
```

### Entity Reducer

An entity instance reducer is used to apply a given entity with to the current [Accumulator](#accumulator).

See the [Entities](#entities) section for information about the supported entity types.

**OPTIONS**

| Option | Type | Description |
|:---|:---|:---|
| *?* | `String` | Only execute entity if `acc.value` is not equal to `false`, `null` or `undefined`. |
| *EntityType* | `String` | Valid Entity type. |
| *EntityID* | `String` | Valid Entity ID. Appending `[]` will map the reducer to each element of an input array. If the current accumulator value is not an array, the reducer will return `undefined`. |

<details>
  <summary>Entity Reducer Example</summary>

  ```js
  const {
    Model,
    Request
  } = require('data-point')

  const PersonRequest = Request('PersonRequest', {
    url: 'https://swapi.co/api/people/{value}'
  })

  const PersonModel = Model('PersonModel', {
    value: {
      name: '$name',
      birthYear: '$birth_year'
    }
  })

  dataPoint
    .resolve([PersonRequest, PersonModel], 1)
    .then((output) => {
      assert.deepStrictEqual(output, {
        name: 'Luke Skywalker',
        birthYear: '19BBY'
      })
    })
  ```

</details>

Example at: [examples/reducer-entity-instance.js](examples/reducer-entity-instance.js)

### Entity By Id Reducer

An entity reducer is used to execute an entity with the current [Accumulator](#accumulator) as the input.

Appending `[]` to an entity reducer will map the given entity to each element of an input array. If the current accumulator value is not an array, the reducer will return `undefined`.

See the [Entities](#entities) section for information about the supported entity types.

**SYNOPSIS**

```js
'[?]<EntityType>:<EntityId>[[]]'
```

**OPTIONS**

| Option | Type | Description |
|:---|:---|:---|
| *?* | `String` | Only execute entity if `acc.value` is not equal to `false`, `null` or `undefined`. |
| *EntityType* | `String` | Valid Entity type. |
| *EntityID* | `String` | Valid Entity ID. Appending `[]` will map the reducer to each element of an input array. If the current accumulator value is not an array, the reducer will return `undefined`. |

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
    'reducer:getGreeting': '$a.b',
    'reducer:toUpperCase': toUpperCase,
  })

  // resolve `reducer:getGreeting`,
  // pipe value to `reducer:toUpperCase`
  dataPoint
    .resolve(['reducer:getGreeting | reducer:toUpperCase'], input)
    .then((output) => {
      assert.strictEqual(output, 'HELLO WORLD')
    })
  ```
</details>

<details>
  <summary>Array Mapping Example</summary>

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
    'reducer:toUpperCase': toUpperCase
  })

  dataPoint
    .resolve(['$a | reducer:toUpperCase[]'], input)
    .then((output) => {
      assert.strictEqual(output[0], 'HELLO WORLD')
      assert.strictEqual(output[1], 'HELLO LAIA')
      assert.strictEqual(output[2], 'HELLO DAREK')
      assert.strictEqual(output[3], 'HELLO ITALY')
    })
  ```
</details>

### List Reducer

A list reducer is an array of reducers where the result of each reducer becomes the input to the next reducer. The reducers are executed serially and **asynchronously**. It's possible for a list reducer to contain other list reducers.

| List Reducer | Description |
|:---|:---|
| `['$a.b', (input) => { ... }]` | Get path `a.b`, pipe value to function reducer |
| `['$a.b', (input) => { ... }, 'hash:Foo']` | Get path `a.b`, pipe value to function reducer, pipe result to `hash:Foo` |

**IMPORTANT**: an empty list reducer will resolve to `undefined`. This mirrors the behavior of empty functions.

```js
const reducer = []

const input = 'INPUT'

dataPoint.resolve(reducer, input) // => undefined
```

### Conditionally execute an entity

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
  'reducer:getPerson': {
    name: '$name',
    // request:getPerson will only
    // be executed if swapiId is
    // not false, null or undefined
    birthYear: '$swapiId | ?request:getPerson | $birth_year'
  }
})

dataPoint
  .resolve('reducer:getPerson[]', people)
  .then((output) => {
    assert.deepStrictEqual(output, [
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

## Reducer Helpers

Reducer helpers are factory functions for creating reducers. They're accessed through the `DataPoint` Object:

```js
const {
  assign,
  constant,
  filter,
  find,
  map,
  parallel,
  withDefault
} = require('data-point')
```

### assign

The **assign** reducer creates a new Object by resolving the provided [Reducer](#reducers) and merging the result with the current accumulator value. It uses [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) internally.

**SYNOPSIS**

```js
assign(reducer:Reducer):Object
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *reducer* | [Reducer](#reducers) | Result from this reducer will be merged into the current `accumulator.value`. By convention, this reducer should return an Object. |

**EXAMPLE:**

<details>
  <summary>Add a key that references a nested value from the accumulator.</summary>

  ```js
  const input = {
    a: 1
  }

  // merges the object reducer with
  // accumulator.value
  const reducer = DataPoint.assign({
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

Example at: [examples/reducer-helper-assign.js](examples/reducer-helper-assign.js)

### map

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
  const input = [{
    a: 1
  }, {
    a: 2
  }]

  // get path `a` then multiply by 2
  const reducer = DataPoint.map(
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

### filter

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
  const input = [{ a: 1 }, { a: 2 }]

  // filters array elements that are not
  // truthy for the given list reducer
  const reducer = DataPoint.filter(
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

### find

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
  const input = [{ a: 1 }, { b: 2 }]

  // the $b reducer is truthy for the
  // second element in the array
  const reducer = DataPoint.find('$b')

  dataPoint
    .resolve(reducer, input) 
    .then(output => {
      // output -> { b: 2 }
    })
  ```
</details>

Example at: [examples/reducer-helper-find.js](examples/reducer-helper-find.js)

### constant

The **constant** reducer always returns the given value. If a reducer is passed it will not be evaluated. This is primarily meant to be used in [object reducers](#object-reducer).

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
  const input = {
    a: 1,
    b: 2
  }

  const reducer = {
    a: '$a',
    b: DataPoint.constant({
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
  <summary>reducers are not evaluated when defined inside of constants</summary>

  ```js
  const input = {
    b: 1
  }

  // object reducer that contains a path reducer ('$a')
  let reducer = {
    a: '$b'
  }

  dataPoint.resolve(reducer, input) // => { a: 1 }

  // both the object and the path will be treated as
  // constants instead of being used to create reducers
  reducer = DataPoint.constant({
    a: '$b'
  })

  dataPoint.resolve(reducer, input) // => { a: '$b' }
  ```
</details>

### parallel

This resolves an array of reducers. The output is a new array where each element is the output of a reducer;
this contrasts with list reducers, which return the output from the last reducer in the array.

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
  const reducer = DataPoint.parallel([
    '$a',
    ['$b', (input) => input + 2] // list reducer
  ])

  const input = {
    a: 1,
    b: 2
  }

  dataPoint.resolve(reducer, input) // => [1, 4]
  ```
</details>

### withDefault

The **withDefault** reducer adds a default value to any reducer type. If the reducer resolves to `null`, `undefined`, `NaN`, or `''`,
the default is returned instead.

**SYNOPSIS**

```js
withDefault(source:*, value:*):*
```

**Reducer's arguments**

| Argument | Type | Description |
|:---|:---|:---|
| *source* | * | Source data for creating a [Reducer](#reducers)  |
| *value* | * | The default value to use (or a function that returns the default value) |

The default value is not cloned before it's returned, so it's good practice to wrap any Objects in a function.

**EXAMPLE:**

```js
const input = {
  a: undefined
}

// adds a default to a path reducer
const r1 = DataPoint.withDefault('$a', 50)

dataPoint.resolve(r1, input) // => 50

// passing a function is useful when the default value is
// an object, because it returns a new object every time
const r2 = withDefault('$a', () => {
  return { b: 1 }
})

dataPoint.resolve(r2, input) // => { b: 1 }

```

## Entities

Entities are used to transform data by composing multiple reducers, they can be created as non-registered or registered entities.

- **<a name="instance-entity-type">Instance entities</a>** - are entity objects created directly with an Entity Factory, they are meant to be used as a [entity reducer](#entity-reducer).
- **<a name="entity-id-type">Registered entities</a>** - are entity objects which are registered and cached in a DataPoint instance, they are meant to be used as a [registered entity reducer](#entity-by-id-reducer).

**Registered entities** may be added to DataPoint in two different ways:

1. With the `DataPoint.create` method (as explained in the [setup examples](#datapointcreate-example))
2. With the [dataPoint.addEntities](#addentities) instance method

See **[built-in entities](#entity-types)** for information on what each entity does.

### Instance Entity

Entities can be created from these factory functions:

```js
const {
  Entry,
  Model,
  Reducer,
  Collection,
  Hash,
  Request,
  Control,
  Schema
} = require('data-point')
```

**SYNOPSIS**

Each factory has the following signature:

```js
Factory(name:String, spec:Object):EntityInstance
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *name* | `string` | The name of the entity; this will be used to generate an entity ID with the format `<entityType>:<name>` |
| *spec* | `Object` | The source for generating the entity |


**Example**

```js
const DataPoint = require('data-point')
const { Model } = DataPoint

const dataPoint = DataPoint.create()

const HelloWorld = Model('HelloWorld', {
  value: input => ({
    hello: 'world'
  })
})

// to reference it we use the actual entity instance
dataPoint.resolve(HelloWorld, {})
  .then(value => {
    console.assert(value, {
      hello: 'world'
    })
  })
```

### Registered Entity

You may register an entity through [DataPoint.create](#create) or [dataPoint.addEntities](#addentities).

**Example**

```js
const DataPoint = require('data-point')

dataPoint = DataPoint.create({
  entities: {
    'model:HelloWorld', {
      value: input => ({
        hello: 'world'
      } 
    }
  }
})

// to reference it we use a string with its registered id
dataPoint.resolve('model:HelloWorld', {})
  .then(value => {
    console.assert(value, {
      hello: 'world'
    })
  })
```

### Entity Base API

All entities share a common API (except for [Reducer](#reducer)).

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error (including errors thrown from the `inputType` and `outputType` reducers) |
| *params*  | `Object` | user defined Hash that will be passed to every transform within the context of the transform's execution |

### Entity type check

You can use **inputType** and **outputType** for type checking an entity's input and output values. Type checking does not mutate the result. 

**Built in type checks:**

To use built-in type checks, you may set the value of **inputType** or **outputType** to: `'string'`, `'number'`, `'boolean'`, `'function'`, `'error'`, `'array'`, or `'object'`.

<details>
  <summary>Check if a model outputs an string</summary>

  This example uses a Model Entity, for information on what a model is please go to the [Model Entity](#model) section.

  ```js
  const dataPoint = DataPoint.create()

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

**Custom type checking:**

You may also type check with a [Schema Entity](#schema), or by creating a [Reducer](#reducers) with the `createTypeCheckReducer` function.

**SYNOPSIS**

```js
DataPoint.createTypeCheckReducer(typeCheckFunction, [expectedType])
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *typeCheckFunction* | `Function<Boolean|String>` | Return `true` when the input is valid; otherwise, an error will be thrown. If the function returns a string, that will be appended to the error message. |
| *expectedType* | `string` _(optional)_ | The expected type; this will also be used in the error message. |

  <summary>Custom type check with a <a href="#function-reducer">function reducer</a></summary>

```js
  const DataPoint = require('data-point')

  const { createTypeCheckReducer } = DataPoint

  const isNonEmptyArray = input => Array.isArray(input) && input.length > 0

  const dataPoint = DataPoint.create({
    entities: {
      'model:get-first-item': {
        inputType: createTypeCheckReducer(isNonEmptyArray, 'non-empty-array'),
        value: input => input[0]
      }
    }
  })
  ```
</details>

  <summary>Custom type check with a schema</summary>

  In this example we are using a [Schema Entity](#schema) to check the inputType.

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

## Entity Types

DataPoint comes with the following built-in entity types: 

- [Reducer / Transform](#reducer)
- [Model](#model)
- [Entry](#entry)
- [Request](#request)
- [Hash](#hash)
- [Collection](#collection)
- [Control](#control)
- [Schema](#schema)

### Reducer

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
  'reducer:<entityId>': Reducer
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
      assert.strictEqual(output, 30)
    })
  ```
</details>


### Model

A Model entity is a generic entity that provides the [base methods](#entity-base-api).

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*  | `Object` | user defined Hash that will be passed to every transform within the context of the transform's execution |

#### Model.value

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
      assert.strictEqual(output, 30)
    })
  ```
</details>


Example at: [examples/entity-model-basic.js](examples/entity-model-basic.js)

#### Model.before

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
      assert.deepStrictEqual(output, [100])
    })
  ```
</details>


Example at: [examples/entity-model-before.js](examples/entity-model-before.js)

#### Model.after

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
      assert.deepStrictEqual(output, [3, 15])
    })
  ```
</details>

#### Model.error

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
      assert.deepStrictEqual(output, [])
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

#### Model.params

The params object is used to pass custom data to your entity. This Object is exposed as a property of the [Accumulator](#accumulator) Object. Which can be accessed via a [function reducer](#function-reducer), as well as through a [path reducer](#path-reducer) expression.

<details>
  <summary>On a Function Reducer</summary>
  
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
      assert.deepStrictEqual(output, 20000)
    })
  ```
</details>


<details>
  <summary>On a Path Reducer</summary>
  
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
      assert.deepStrictEqual(output, 100)
    })
  ```
</details>

### Entry

This entity is very similar to the [Model entity](#model). Its main difference is that this entity will default to an empty object `{ }` as its initial value if none was passed. As a best practice, use it as your starting point, and use it to call more complex entities.

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*  | `Object` | user defined Hash that will be passed to every transform within the context of the transform's execution |


### Request

Requests a remote source, using [request-promise](https://github.com/request/request-promise) behind the scenes. The features supported by `request-promise` are exposed/supported by Request entity.

**SYNOPSIS**

```js
dataPoint.addEntities({
  'request:<entityId>': {
    inputType: String | Reducer,
    before: Reducer,
    value: Reducer,
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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*     | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value*      | [Reducer](#reducers) | the result of this reducer is the input when resolving **url** and **options**
| *url*        | [StringTemplate](#requesturl-as-stringtemplate) | String value to resolve the request's url |
| *options*    | [Reducer](#reducers) | reducer that returns an object to use as [request-promise](https://github.com/request/request-promise) options
| *after*      | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *error*      | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *outputType* | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *params*     | `Object` | user defined Hash that will be passed to every reducer within the context of the transform function's execution |

#### Request.url

Sets the url to be requested.

**NOTE:** When `Request.url` is not defined it will use the current `Accumulator.value` (if the value is of type `string`) as the Request's url.

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

#### Request.url as StringTemplate

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
  const dataPoint = DataPoint.create()

  dataPoint.addEntities({
    'request:searchPeople': {
      url: 'https://swapi.co/api/people',
      // options is a Reducer, but values
      // at any level can be wrapped as
      // constants (or just wrap the whole
      // object if all the values are static)
      options: {
        'content-type': DataPoint.constant('application/json')
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
      assert.strictEqual(output.results[0].name, 'R2-D2')
    })
  ```
</details>

Example at: [examples/entity-request-options.js](examples/entity-request-options.js)

For more examples of request entities, see the [Examples](examples), the [Integration Examples](test/definitions/integrations.js), and the unit tests: [Request Definitions](test/definitions/requests.js).

#### Inspecting Request Entities

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

**Boolean**

If `params.inspect` is `true`, it will output the entity's information to the console.

**Function**

If `params.inspect` is a function, it will be called twice: once before the request is made, and once when the request is resolved. It should have the signature ```(accumulator: Object, data: Object)```.

The `inspect` function is first called just before initiating the request. The first argument is the `accumulator`, and the second is a `data` object with these properties:

```js
{
  type: 'request',
  // unique ID that is shared with the 'response' object
  debugId: Number,
  // ex: 'GET'
  method: String,
  // fully-formed URI
  uri: String,
  // the value of request.body (or undefined)
  [body]: String
}
```

It's then called when the request succeeds or fails. The `data` object will have a `type` property of either `'response'` or `'error'`. The `debugId` can be used to match the response with the corresponding request.

```js
{
  type: 'response|error',
  // unique ID that is shared with the 'request' object
  debugId: Number,
  // http status code
  statusCode: Number,
}
```

### Hash

A Hash entity transforms a _Hash_ like data structure. It enables you to manipulate the keys within a Hash. 

To prevent unexpected results, a **Hash** can only return **Plain Objects**, which are objects created by the Object constructor. If a hash resolves to a different type, it will throw an error. This type check occurs *before* the value is passed to the (optional) `outputType` reducer.

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value to which the Entity resolves |
| *mapKeys* | [Object Reducer](#object-reducer) | Map to a new set of key/values. Each value accepts a reducer |
| *omitKeys* | `String[]` | Omits keys from acc.value. Internally. |
| *pickKeys* | `String[]` | Picks keys from acc.value. Internally. |
| *addKeys* | [Object Reducer](#object-reducer) | Add/Override key/values. Each value accepts a reducer. Internally, this uses the [assign](#assign) reducer helper |
| *addValues* | `Object` | Add/Override hard-coded key/values. Internally, this uses the [assign](#assign) reducer helper |
| *compose* | [ComposeReducer](#entity-compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one operation gets passed to the next one|
| *after*   | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it. Collection only supports custom outputType reducers, and not the built-in types like **string**, **number**, etc. |
| *error*   | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params*    | `Object` | User-defined Hash that will be passed to every reducer within the context of the transform function's execution |

Hash entities expose a set of optional reducers: [mapKeys](#hashmapkeys), [omitKeys](#hashomitkeys), [pickKeys](#hashpickkeys), [addKeys](#hashaddkeys), and [addValues](#hashaddvalues). When using more than one of these reducers, they should be defined through the `compose` property.

#### Hash.value

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
      assert.deepStrictEqual(output, {
        c: 'Hello',
        d: ' World!!'
      })
    })
  ```
</details>


Example at: [examples/entity-hash-context.js](examples/entity-hash-context.js)

#### Hash.mapKeys

Maps to a new set of key/value pairs through a [object reducer](#object-reducer), where each value is a [Reducer](#reducers).

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
        // uses a list reducer to
        // map to acc.value.name
        // and generate a string with
        // a function reducer
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
    assert.deepStrictEqual(output, {
      name: 'DataPoint',
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-mapKeys.js](examples/entity-hash-mapKeys.js)

#### Hash.addKeys

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
    assert.deepStrictEqual(output, {
      name: 'DataPoint',
      nameLowerCase: 'datapoint',
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-addKeys.js](examples/entity-hash-addKeys.js)

#### Hash.pickKeys

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
    assert.deepStrictEqual(output, {
      url: 'https://github.com/ViacomInc/data-point'
    })
  })
  ```
</details>


Example at: [examples/entity-hash-pickKeys.js](examples/entity-hash-pickKeys.js)

#### Hash.omitKeys

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
    assert.deepStrictEqual(output, expectedResult)
  })
  ```
</details>

Example at: [examples/entity-hash-omitKeys.js](examples/entity-hash-omitKeys.js)

#### Hash.addValues

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
      assert.deepStrictEqual(output, expectedResult)
    })
  ```
</details>


#### Hash - adding multiple reducers

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
      assert.deepStrictEqual(output, expectedResult)
    })
  ```
</details>


For examples of hash entities, see the [Examples](examples), on the unit tests: [Request Definitions](test/definitions/hash.js), and [Integration Examples](test/definitions/integrations.js)

### Collection

A Collection entity enables you to operate over an array. Its API provides basic reducers to manipulate the elements in the array.

To prevent unexpected results, a **Collection** can only return arrays. If a collection resolves to a different type, it will throw an error. This type check occurs *before* the value is passed to the (optional) `outputType` reducer.

**IMPORTANT:** Keep in mind that in DataPoint, **all** operations are asynchronous. If your operations do NOT need to be asynchronous, iterating over a large array might result in slower execution. In such cases, consider using a function reducer where you can implement a synchronous solution.

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before*  | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value to which the Entity resolves |
| *map* | [Reducer](#reducers) | Maps the items of an array. Internally, this uses the [map](#map) reducer helper |
| *find* | [Reducer](#reducers) | Find an item in the array. Internally, this uses the [find](#find) reducer helper |
| *filter* | [Reducer](#reducers) | Filters the items of an array. Internally, this uses the [filter](#filter) reducer helper |
| *compose* | [ComposeReducer](#entity-compose-reducer)`[]` | Modify the value of accumulator through an Array of `ComposeReducer` objects. Think of it as a [Compose/Flow Operation](https://en.wikipedia.org/wiki/Function_composition_(computer_science)), where the result of one object gets passed to the next one |
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it. Hash only supports custom outputType reducers, and not the built-in types like **string**, **number**, etc. |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params* | `Object` | User-defined Hash that will be passed to every reducer within the context of the transform function's execution |

#### Collection Reducers

Collection entities expose a set of optional reducers: [map](#collectionmap), [find](#collectionfind), and [filter](#collectionfilter). When using more than one of these reducers, they should be defined with the `compose` property.

#### Collection.map

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

#### Collection.filter

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


#### Collection.find

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


#### Collection.compose

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

### Control

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before* | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *select* | [Case Statements](#controlselect)`[]` | Array of case statements, and a default fallback |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |

#### Control.select

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

### Schema

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
| *inputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's input value, but does not mutate it |
| *before* | [Reducer](#reducers) | reducer to be resolved **before** the entity resolution |
| *value* | [Reducer](#reducers) | The value that this entity will pass to the schema validation |
| *schema* | `Object` | Valid [JSON Schema](http://json-schema.org/documentation.html) object. If the schema is not valid, an error is thrown when creating the entity. |
| *options* | `Object` | Avj's [options](https://github.com/epoberezkin/ajv#options) object
| *after* | [Reducer](#reducers) | reducer to be resolved **after** the entity resolution |
| *outputType*  | String, [Reducer](#reducers) | [type checks](#entity-type-check) the entity's output value, but does not mutate it |
| *error* | [Reducer](#reducers) | reducer to be resolved in case of an error |
| *params* | `Object` | User-defined Hash that will be passed to every transform within the context of the transform's execution |

**EXAMPLES**

For examples of Schema entities, see the ones used on the unit tests: [Schema Definitions](test/definitions/schema.js), and [Integration Examples](test/definitions/integrations.js)

## Entity Compose Reducer

This reducer is an `Array` of **ComposeReducer** objects. Each reducer gets executed asynchronously. You may add as many supported reducers as you want by the entity. The result of each reducer gets passed to the next reducer in sequence. 

**ComposeReducer**: is an object with a single 'key'. The key is the type of reducer you want to execute, and its value is the body of the reducer.

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

## Extending Entities

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

## Global Entity Options

You may set global params for entry types, allowing you to set these options once and have them be consistent. We do this using `entityOverrides` within the options object.

**EXAMPLE**

```js
const options = {
  entityOverrides: {
    'request': {
      params: {
        inspect: true
      }
    }
  }
}

dataPoint.resolve('request:xyz', {}, options)
```
The preceding example will make it so every `'request'` entity will have the inspect param set to true. This can be done with any entity and its respective parameters.

Example at: [examples/entity-request-options-override.js](examples/entity-request-options-override.js)

## Middleware

Middleware, in the DataPoint context, is a place to add logic that will execute `before` and `after` the resolution of specified entity types. The middleware layer adds a `resolve` method to the [Accumulator](#middleware-accumulator-object) object, which allows you to control the resolution of entities.

### dataPoint.use

Adds a middleware method.

**SYNOPSIS**

```js
dataPoint.use(id:String, callback:Function)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *id* | `string` | This ID is a string with the form `<EntityType>:<EventType>`, where `<EntityType>` is any registered entity type and `<EventType>` is either `'before'` or `'after'`. |
| *callback* | `Function` | This is the callback function that will be executed once an entity event is triggered. The callback has the form `(acc, next)`, where `acc` is the current middleware [Middleware Accumulator](#middleware-accumulator-object) object, and next is a function callback to be executed once the middleware is done executing. The `next` callback uses the form of `(error, resolvedValue)`. |

**EXAMPLE:**

```js
const dp = DataPoint.create()

dp.use('before', (acc, next) => {
  console.log(`Entity ${acc.reducer.id} is being called`)
  next()
})

dp.use('after', (acc, next) => {
  console.log(`Entity ${acc.reducer.id} was called`)
  next()
})

const MyModel = DataPoint.Model('MyModel', {
  value: () => 'new value'
})

dp.resolve(MyModel, true)
  // console output: 
  //   Entity model:MyModel is being called
  //   Entity model:MyModel was called
  .then(() => {

  })
```

### Exiting Middleware chain

To exit the middleware chain with a resolved value you must pass a second parameter to the `next(err, val)` function provided by the middleware handler. By calling the `next` function with `null` as first parameter and a value as a second parameter (eg. `next(null, newValue`) the entity will resolve to that value without executing any remaining methods in the middleware chain. This allows you to skip unnecessary work if, for example, a cached return value was found.

**NOTE**: the `next` method should be called only once per middleware handler, multiple calls will be ignored.


<details>
  <summary>hijacking the value of an entity</summary>

  ```js
  const dp = DataPoint.create()

  dp.use('before', (acc, next) => {
    console.log('Entity model:MyModel is being called')
    next()
  })

  dp.use('before', (acc, next) => {
    console.log('hijacking')
    next(null, 'hijacked')
  })

  dp.use('before', (acc, next) => {
    console.log('never got here')
    next()
  })

  const MyModel = DataPoint.Model('MyModel', {
    value: () => {
      // this will not be executed because the entity was hijacked
      console.log('processing')
      return 'hello'
    }
  })

  dp.resolve(MyModel, true)
    // console output:
    //   Entity model:MyModel is being called
    //   hijacking
    .then((value) => {
      assert.strictEqual(value, 'hijacked')
    })
  ```

</details>

Example at: [examples/middleware-exit-chain.js](examples/middleware-exit-chain.js)

## Custom Entity Types

DataPoint exposes a set of methods to help you build your own Custom Entity types. With them you can build on top of the [base entity API](#entity-base-api).

### Adding a new Entity type

You can register custom Entity types when creating a DataPoint instance with [DataPoint.create](#create); you can also register them later with [dataPoint.addEntityType](#addentitytype) and/or [dataPoint.addEntityTypes](#addentitytypes).

#### addEntityType

Adds a single Entity type to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityType(name:String, spec:Object)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *name* | `Object` | Name of the new Entity type |
| *spec* | `Object` | New [Entity spec](#custom-entity-spec) API |

#### addEntityTypes

Adds one or more Entity Types to the DataPoint instance.

**SYNOPSIS**

```js
dataPoint.addEntityTypes(specs:Object)
```

**ARGUMENTS**

| Argument | Type | Description |
|:---|:---|:---|
| *specs* | `Object` | Key/value hash where each key is the name of the new Entity type and value is the [Entity spec](#custom-entity-spec) API. |

### Custom Entity Spec

Every Entity must expose two methods:

- `create`: Factory method to create a new instance of your Entity.
- `resolve`: Resolve your entity specification

Because you are extending the base entity API, you get before, value, after, params and error values. You only have to take care of resolving value and any other custom property you added to your custom entity. Everything else will be resolved by the core DataPoint resolver. 

#### Entity.create

This is a factory method, it receives a raw entity spec, and expects to return a new entity instance object.

```js
function create(name:String, spec:Object):Object
```

#### Entity.resolve

This is where your entity resolution logic is to be implemented. It follows the following syntax: 

```js
function resolve(acc:Accumulator, resolveReducer:function):Promise
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
    const entity = mew RenderTemplate()
    entity.spec = spec
    entity.resolve = resolve
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
    // execute lodash template against
    // accumulator value
    const value = spec.template(accumulator.value)
    // set new accumulator.value
    // this method creates a new acc object
    return Object.assign({}, accumulator, {
      value
    })
  }

  /**
  * RenderEntity API
  */
  const RenderEntity = DataPoint.createEntity('render', create)

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
      assert.strictEqual(output, '<h1>Hello World!!</h1>')
    })
  ```
</details>


Example at: [examples/custom-entity-type.js](examples/custom-entity-type.js)

## Tracing DataPoint calls

To trace a DataPoint transformation you can set the value `trace:true` to the options object passed to the `datapoint.transform()` method. 

This tool will write a JSON file to disk (on the current execution path) that exposes all of the reducers that are being executed within a transformation. It provides information such as time start and duration of each process as well as information regarding the reducer that was executed.


### Example: 

```js
const DataPoint = require('data-point')
const mocks = require('./async-example.mocks')

// mock request calls
mocks()

const {
  Model,
  Request
} = DataPoint

const PersonRequest = Request('PersonRequest', {
  url: 'https://swapi.co/api/people/{value}/'
})

const PersonModel = Model('PersonModel', {
  value: {
    name: '$name',
    birthYear: '$birth_year'
  }
})

const options = {
  trace: true 
}

const dataPoint = DataPoint.create()

dataPoint
  .transform([PersonRequest, PersonModel], 1, options)
  .then((output) => {
    // a file with the name data-point-trace-<timestamp>.json will
    // be created.
  })
```

Example at: [examples/trace.js](examples/trace.js)

## Integrations

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

## Patterns and Best Practices

For recommended patterns and best practices, please visit [docs/best-practices.md](docs/best-practices.md)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
