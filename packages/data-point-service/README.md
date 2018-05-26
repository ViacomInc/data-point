# DataPoint Factory

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![codecov](https://codecov.io/gh/ViacomInc/data-point/branch/master/graph/badge.svg)](https://codecov.io/gh/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](https://github.com/ViacomInc/data-point#contributors)

> Creates a DataPoint instance with redis support

## Requirements

- Node 6 LTS (or higher)
- [Redis](https://redis.io/) (Optional for development)

## Install

```bash
$ npm install data-point-cache
```

## `factory.create`

Create a new DataPoint Service Object


```js
factory.create(options):Promise<Service>
```

Properties of the `options` argument:

| option | type | description |
|:---|:---|:---|
| **cache** | `Object` | cache specific settings |
| **cache.isRequired** | `Boolean` | false by default, if true it will throw an error |
| **cache.redis** | `Object` | **redis** settings passed to the [ioredis](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) constructor. For key prefixing, set [keyPrefix](https://github.com/luin/ioredis#transparent-key-prefixing) through `cache.redis.keyPrefix`; if the value is not provided then [os.hostname()](https://nodejs.org/api/os.html#os_os_hostname) will be used. |

This method returns a Promise that resolves to a Service Object. 

The Service Object holds a reference to a dataPoint instance. 

```js
const options = {
  entities: {
    'reducer:foo': (input, acc) => 'bar'
  }
}
factory.create(options)
  .then((service) => {
    return service.dataPoint.transform('reducer:foo')
  })
  .then((output) => {
    console.log(output)
    // bar
  })
```

## Express example

```js
const express = require('express')
const DataPoint = require('data-point')
const DataPointService = require('data-point-service')

function server (dataPoint) {
  const app = express()

  app.get('/api/hello-world', (req, res) => {
    dataPoint.resolve(`entry:HelloWorld`, req.query)
      .then((output) => {
        res.send(output)
      })
  })

  app.listen(3000, function () {
    console.log('listening on port 3000!')
  })
}

function createService () {
  return DataPointService.create({
    DataPoint,
    entities: {
      'reducer:HelloWorld': (input, acc) => 'Hello World!!'
    }
  }).then((service) => {
    return service.dataPoint
  })
}

createService()
  .then(server)
```

## <a name="entity-params-cache">Configure entity's cache settings</a>

To configure an entity's cache settings you must set cache configuration through the params object.

```js
'<type>:<entity-name>': {
  params: {
    cache: {
      ttl: String|Number,
      staleWhileRevalidate: String|Number
    }
  }
}
```

### cache.ttl

```js
ttl: String|Number
```

Use `cache.ttl` to set an entity's cache entry **Time To Live** value. This value is expected to be written as a string following the format supported by [ms](https://www.npmjs.com/package/ms).

**Example:**

Creates a request entity that when called will append an entry to redis with a TTL of 20 minutes. When the entry expires, the next request that comes through will have to re-fetch again to respond, upon success a new cache entry with same TTL will be created.

```js
DataPointService.create({
  DataPoint,
  entities: {
    'request:getPlanets': {
      url: 'https://swapi.co/api/planets/'
      params: {
        cache: {
          ttl: '20m', // 20 minutes
        }
      }
    }
  }
})
```

### cache.staleWhileRevalidate

`staleWhileRevalidate = delta-seconds`

`staleWhileRevalidate` value is expected to be written as a string following the format supported by [ms](https://www.npmjs.com/package/ms). Alternately it may also be set to `true`, which tells the entity to use double the time of the value of its `ttl`.

Use `cache.staleWhileRevalidate` in conjunction with a valid `cache.ttl` to use the Stale While Revalidate cache pattern. When present, caches MAY serve the response in which it appears after it becomes stale, up to the indicated `ttl`. The cache SHOULD attempt to revalidate it asynchronously while still serving stale responses. If delta-seconds passes without the cached entity being revalidated, it SHOULD NOT continue to be served stale.

**Example:**

Creates a request entity that when called will append an entry to redis with no expiration (stale), at the same time it will create a controller cache entry that has the ttl value. On every request to this entity the stale value will be returned, when the control entry expires, the stale value will continue to be returned and a background process will be triggered to execute the entity and update the stale entry.

```js
DataPointService.create({
  DataPoint,
  entities: {
    'request:getPlanets': {
      url: 'https://swapi.co/api/planets/'
      params: {
        cache: {
          ttl: '20m', // 20 minutes
          staleWhileRevalidate: true
        }
      }
    }
  }
})
```

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
