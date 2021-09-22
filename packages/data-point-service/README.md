# DataPoint Factory

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![codecov](https://codecov.io/gh/ViacomInc/data-point/branch/master/graph/badge.svg)](https://codecov.io/gh/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](https://github.com/ViacomInc/data-point#contributors)

> Creates a DataPoint instance with redis support

## Requirements

- Node 10 LTS (or higher)
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

| option               | type      | description                                                                                                                                                                                                                                                                                                                                                                          |
| :------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cache**            | `Object`  | cache specific settings                                                                                                                                                                                                                                                                                                                                                              |
| **cache.isRequired** | `Boolean` | false by default, if true it will throw an error                                                                                                                                                                                                                                                                                                                                     |
| **cache.redis**      | `Object`  | **redis** settings passed to the [ioredis](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) constructor. For key prefixing, set [keyPrefix](https://github.com/luin/ioredis#transparent-key-prefixing) through `cache.redis.keyPrefix`; if the value is not provided then [os.hostname()](https://nodejs.org/api/os.html#os_os_hostname) will be used. |

This method returns a Promise that resolves to a Service Object.

The Service Object holds a reference to a dataPoint instance.

```js
const options = {
  entities: {
    "reducer:foo": (input, acc) => "bar"
  }
};
factory
  .create(options)
  .then(service => {
    return service.dataPoint.transform("reducer:foo");
  })
  .then(output => {
    console.log(output);
    // bar
  });
```

## Express example

```js
const express = require("express");
const DataPoint = require("data-point");
const DataPointService = require("data-point-service");

function server(dataPoint) {
  const app = express();

  app.get("/api/hello-world", (req, res) => {
    dataPoint.resolve(`entry:HelloWorld`, req.query).then(output => {
      res.send(output);
    });
  });

  app.listen(3000, function() {
    console.log("listening on port 3000!");
  });
}

function createService() {
  return DataPointService.create({
    DataPoint,
    entities: {
      "reducer:HelloWorld": (input, acc) => "Hello World!!"
    }
  }).then(service => {
    return service.dataPoint;
  });
}

createService().then(server);
```

## <a name="entity-params-cache">Configure entity's cache settings</a>

To configure an entity's cache settings you must set cache configuration through the params object.

```js
'<type>:<entity-name>': {
  params: {
    cache: {
      ttl: String|Number,
      staleWhileRevalidate: String|Number|Boolean,
      revalidateTimeout: String|Number
    }
  }
}
```

### cache.ttl

```js
ttl: String | Number;
```

Use `cache.ttl` to set an entity's cache entry **Time To Live** value. When this value is a `string` it is expected to be written using the format supported by [ms](https://www.npmjs.com/package/ms).

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

```js
staleWhileRevalidate: String|Number|Boolean (defaults to `5s` if set to `true`)
```

`staleWhileRevalidate = time to serve stale while revalidating`

`staleWhileRevalidate` value is expected to be written as a string following the format supported by [ms](https://www.npmjs.com/package/ms). Alternately it may also be set to `true`, which tells the entity to use double the time of the value of its `ttl`.

Use `cache.staleWhileRevalidate` in conjunction with a valid `cache.ttl` to use the Stale While Revalidate cache pattern. When present, caches MAY serve the response in which it appears after it becomes stale, up to the indicated `ttl`. The cache SHOULD attempt to revalidate it asynchronously while still serving stale responses. If `staleWhileRevalidate` time has passed without the cached entity being revalidated, it SHOULD NOT continue to be served stale.

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

### cache.revalidateTimeout

```js
revalidateTimeout: String | Number;
```

_defaults to_: `5s`

`revalidateTimeout` is the time a revalidation process has before it times-out, the value is expected to be written as a string (eg. `'20m'`) following the format supported by [ms](https://www.npmjs.com/package/ms). When revalidation starts a **revalidation flag** is set which blocks revalidation duplicates from happening. Once the revalidation times-out the revalidation flag will be removed and the **key** will be unblocked for being revalidated again. If omitted it defaults to 5 seconds.

This value is only used when `staleWhileRevalidate` is also set.

## Revalidation and concurrency

When an entity is requested for the first time it will be considered a _cold lookup_, once the entity is resolved a cache entry will be saved on **redis**. For the key's life set by the entity's `ttl` (and `staleWhileRevalidate`) the entity will return the value (considered **stale**) from the **redis** store. Once a new request is made for the key and it's `ttl` has expired a revalidation will be triggered _on the background_; when a revalidation starts a revalidation **flag** will be added to prevent new calls of duplicating the revalidation process.

Revalidation flags are saved **locally** (in memory - they get cleared once their timeout expires) and also added to the redis store to be accessed by multiple node instances sharing the same keys. The **local** flag is to prevent duplicate revalidation by a single instance, because it is in memory it is an instant lookup; the **remote** flag (redis) is to prevent multiple instances of attempting to revalidate the same request.

In the case the revalidation fails the flag will be removed to allow a new revalidation to be triggered.

It is important to know that once the `staleWhileRevalidate` delta has also expired a background revalidation will no longer be triggered and cold lookup will be triggered instead. For this reason it is important to carefully set the cache settings to have a solid caching strategy.

### Validation

If an entity's `outputType` reducer is set, revalidation will execute it before storing the new entry in cache. If the validation fails the entry will not be stored.

In the case revalidation happens via `stale-while-revalidate` and `outputType` does not pass then stale value will be served until the stale value expires on its own.

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
