# DataPoint Express

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master)


> Create DataPoint service with Express middleware support

## Requirements

- Node 6 LTS (or higher)
- [Redis](https://redis.io/) (Optional for development)
- Peer dependencies: [data-point](https://www.npmjs.com/package/data-point), [Express](https://www.npmjs.com/package/express)

## Install

**NOTE:** Express and DataPoint are peer dependencies

```bash
npm install --save express data-point data-point-express 
```

## Quick start

A simplistic example of creating a DataPoint Express service.

```js
const express = require('express')
const Service = require('data-point-express')

const app = new express()

Service.create({
  // add DataPoint entities
  entities: {
    'entry:hello-world': () => 'Hello World!!'
  }
})
.then((service) => {
  // expose DataPoint inspector
  app.use(
    '/api/inspect', 
    service.inspector()
  )
  
  // maps route: /api/hello-world to
  // entityId: entry:hello-world
  app.get(
    '/api/hello-world', 
    service.mapTo('entry:hello-world')
  )

  // start Express server
  app.listen(3000, (err) => {
    console.log('DataPoint service ready!')
  })
})
```

The code above should expose two paths: 

- http://localhost:3000/api/inspect - DataPoint entity inspector
- http://localhost:3000/api/hello-world - should return the string `Hello World!!`

## Create a DataPoint Service Object

This method returns a `Promise` that resolves to a [DataPoint Service Object](#service-object). 

```js
Service.create({
  entities: Object,
  entityTypes: Object,
  cache: {
    localTTL: Number,
    redis: Object,
    isRequired: true,
    prefix: String
  }
}):Promise<Object>
```

The following table describes the properties of the `options` argument:

| option | type | required | description |
|:---|:---|:---|:---|
| **entities** | `Object` | **yes** | DataPoint [entities](https://github.com/ViacomInc/data-point#entities) Object. |
| **entityTypes** | `Object` | optional | Create your DataPoint [custom entity](https://github.com/ViacomInc/data-point#custom-entity-types) types. |
| **cache.localTTL** | `Number` | optional | Value in Milliseconds of in **memory TTL**, by default it's set to `2000` (2 seconds) |
| **cache.redis** | `Object` | optional | Value passed to the [ioredis](https://github.com/luin/ioredis) [constructor](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) |
| **cache.isRequired** | `Boolean` | optional | Defaults to `false`. If true the service will **throw an error** when getting created.  |
| **cache.prefix** | `String` | optional | Defaults to [os.hostname()](https://nodejs.org/api/os.html#os_os_hostname). In production you may be using multiple node instances and might want to instead share the prefix.  |

### Example

Creates a new DataPoint Service:

```js
const express = require('express')
const Service = require('data-point-express')

const app = new express()

Service.create({
  // add DataPoint entities
  entities: {
    'entry:HelloWorld': (input, acc) => 'Hello World!!',
    'entry:Greet': (input, acc) => `Hello ${acc.locals.params.person}!!`
  }
})
.then(service => {
  // create Express routes
  app.get('/api/hello-world', service.mapTo('entry:HelloWorld'))
  app.get('/api/greet/:person', service.mapTo('entry:Greet'))

  app.listen(3000, (err) => {
    if(err) {
      throw err
    }
    console.info('DataPoint service ready!')
  })
})
.catch(error => {
  console.info('Failed to Create Service')
  console.error(error)
  process.exit(1)
})
```

Service: http://localhost:3000/api/hello-world

Returns:

```text
Hello World!!
```

Service: http://localhost:3000/api/greet/darek

Returns:

```text
Hello darek!!
```

## <a name="service-object">DataPoint Service Object</a>

When `Service.create` is resolved it returns a `service` instance that exposes the following api:

- [service.mapTo()](#service-map-to) - creates an express middleware that gets mapped to a DataPoint Entity id.
- [service.router()](#service-router) - creates an [Express.Router](http://expressjs.com/en/4x/api.html#router) with DataPoint aware routes.
- [service.inspector()](#service-inspector) - exposes a DataPoint Entity inspector.

### <a name="service-map-to">service.mapTo()</a>

Maps a DataPoint entityId to a middleware method. This method returns an Express Middleware function.

```js
service.mapTo(entityId:String):Function
```

**arguments:**

| argument | type | description |
|:---|:---|:---|
| **entityId** | `String` | DataPoint [entity](https://github.com/ViacomInc/data-point#entities) Id. |

**Example:**

Maps path `'/api/hello-world'` to entityId `'entry:HelloWorld'` 

```js
app.get('/api/hello-world', service.mapTo('entry:HelloWorld'))
```

### <a name="service-router">service.router()</a>

Create DataPoint aware routes. This method returns a [Express.Router](http://expressjs.com/en/4x/api.html#express.router) Object.

```js
service.router(routes:Object):Router
```

**arguments:**

| argument | type | description |
|:---|:---|:---|
| **routes** | `Object` | [Routes Object](#routes-object) |

**Example:**

Create a set of routes under the path `'/api'`. Notice how you can set the _http method_ on each route as well as the priority.

```js
app.use('/api', service.router({
  helloWorld: {
    priority: 100,
    path: '/hello-world',
    method: 'GET',
    middleware: 'transform:HelloWorld'
  },
  addUser: {
    priority: 200,
    path: '/user',
    method: 'POST',
    middleware: 'entry:addUser'
  },
  deleteUser: {
    priority: 300,
    path: '/user',
    method: 'DELETE',
    middleware: 'entry:deleteUser'
  }
}))
```

### <a name="routes-object">Routes Object</a>

This object must follow a specific structure: 

```js
{
  routeId: {
    path: String,
    priority: Number,
    enabled: Boolean, 
    method: String,
    middleware: Array<Function|String>|Function|String
  }
}
```

Each property of a route is described in the table below: 

| property | type | description |
|:---|:---|:---|
| **path** | `String` | Valid Express route |
| **priority** | `Number` | Number to order the routes, since in express this order matters make sure you place these numbers correctly |
| **enabled** | `Boolean` | Enable/disable a route from being added. `true` by default, unless explicitly set to `false` |
| **method** | `String` | http method mapped to the route. Defaults to 'GET'. Available methods: 'GET', 'PUT', 'DELETE', 'POST'. |
| **middleware** | <code>Array<Function&#124;String></code> | This is the actual middleware function used for the route. For information on how to use please look at [route.middleware](#route-middleware)  |


### <a name="route-middleware">route.middleware</a>

Route Middleware can be written in multiple ways: 

#### <a name="route-middleware-as-a-function">Middleware as a Function</a>

Using standard express functions, it accepts standard Express middleware methods as described in [using express middleware](http://expressjs.com/en/guide/using-middleware.html).

**Example:**

```js
{
  helloWorld: {
    path: '/hello/:person',
    priority: 100,
    middleware: (req, res) => res.send('hello ${req.params.person}!')
  }
}
```

#### <a name="route-middleware-as-a-entityId">Middleware as an Entity Id</a>

You must pass a string that points to a valid DataPoint entity id; this maps the middleware to the given entity Id. The entity's resolution becomes the result sent to the client.

**Example:**

```js
// data point entities:
{
  'entry:HelloWorld': {
    value: (input, acc) => `hello ${acc.locals.params.person}!`
  }
}

// routes
{
  helloWorld: {
    path: '/hello/:person',
    priority: 100,
    middleware: 'entry:HelloWorld'
  }
}
```

#### <a name="route-middleware-mixed">Mixed middleware</a>

You may also use a mix of functions and entity ids, for example you may want to do authentication or parameter normalization before executing a DataPoint entity.

One caveat is that you may only pass one entity id and it must be the last middleware otherwise it throws an error.

**Example:**

```js
// data point entities:
{
  'entry:HelloWorld': {
    value: (input, acc) => `hello ${acc.locals.params.person}!`
  }
}

// routes
{
  helloWorldProtected: {
    path: '/hello/:person',
    priority: 100, 
    middleware: [requireAuthentication, 'entry:HelloWorld']
  },
  badRoute: {
    path: '/hello/:person',
    priority: 100, 
    // this is not allowed, entity
    // must be at the end.
    middleware: ['entry:HelloWorld', requireAuthentication]
  }
}
```

## <a name="service-inspector">service.inspector()</a>

This service comes with a DataPoint entity _inspector_ web interface. To mount you must pass the result of `service.inspector()` to Express [app.use](http://expressjs.com/en/4x/api.html#app.use). Make sure you specify a _path_ where to mount the inspector.

**IMPORTANT:** for security do not expose this middleware in production environments.

Basic implementation example:

```js
const express = require('express')
const Service = require('data-point-express')

const app = new express()

Service.create({
  // DataPoint entities
  entities: {
    'entry:hello-world': (input, acc) => 'Hello World!!'
  }
})
.then((service) => {
  // expose DataPoint inspector
  app.use('/api/inspect', service.inspector())

  app.listen(3000)
})
.catch(error => {
  console.info('Failed to Create Service')
  console.error(error)
  process.exit(1)
})
```

Working example at [/examples/inspector-demo.js](/examples/inspector-demo.js)

### <a name="accumulator-locals"></a>Accumulator.locals

When an entity executes through a DataPoint Middleware, it appends some useful information to the [Accumulator](https://github.com/ViacomInc/data-point#accumulator)`.locals` property. These values are persistent across the execution of the request.

| Property | Type | Description |
|---|---|---|
| **routeRequestType** | `String` | Type of route request being made: 'api', 'rdom', 'html' |
| **req**              | `Express.RequestObject` | Reference to current Express [req](http://expressjs.com/tr/api.html#req) |
| **url**              | `String` | Node's [message.url](https://nodejs.org/api/http.html#http_message_url) |
| **query**            | `Object` | Reference to current Express [req.query](http://expressjs.com/tr/api.html#req.query) |
| **params**           | `Object` | Reference to current Express [req.params](http://expressjs.com/tr/api.html#req.params) |
| **queryParams**      | `Object` | This is a [defaults](https://lodash.com/docs/4.17.4#defaults) merge of `req.query` with `req.params` |
| **paramsQuery**      | `Object` | This is a [defaults](https://lodash.com/docs/4.17.4#defaults) merge of `req.params` with `req.query` |

**Example:**

[DataPoint Reducer](https://github.com/ViacomInc/data-point#function-reducer) that prints out the `acc.locals.url` to the console.

```js
const reducer = (input, acc) => {
  console.log('url that originated this call:', acc.locals.url)
  return input
}
```

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
