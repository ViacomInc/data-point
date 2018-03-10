# data-point-cache

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=master)](https://travis-ci.org/ViacomInc/data-point) [![codecov](https://codecov.io/gh/ViacomInc/data-point/branch/master/graph/badge.svg)](https://codecov.io/gh/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=master)](https://coveralls.io/github/ViacomInc/data-point?branch=master) [![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors)

> DataPoint cache layer

Factory method to create a simple cache API that you can use for data persistence. 

## Requirements

- Node 6 LTS (or higher)
- [Redis](https://redis.io/) (Optional for development)

## Install

```bash
$ npm install data-point-cache
```

## Usage

```js
const Cache = require('data-point-cache')

Cache.create()
  .then(cache => {
    return cache.set('myKey', 'foo', '20m')
      .then(() => {
        return cache.get('myKey')
      })
  })
  .then(result => {
    console.log('foo')
  )
```

## Storage mechanism

This cache API has an in-memory storage mechanism. The idea here is that every time a get/set operation happens, a short (TTL of 2 seconds) in-memory version of that key will be stored. After the TTL of the in-memory key has expired, the key will be removed. The swiping mechanism triggers every second and will kill every key that has its TTL has expired. The idea behind this is to try to be as optimal with our requests to redis, but also be careful not to store for too long in the in-memory layer.

Like any software, see if this works for you and your use case before going to production.

## API

### Cache.create

Create a cache instance.

```js
Cache.create({
  localTTL: Number,
  redis: Object,
}):Promise<cache>
```

This factory method returns a Promise that resolves to a cache instance. 

| option | type | required | description |
|:---|:---|:---|:---|
| **localTTL** | `Number` | optional | Value in Milliseconds of in **memory TTL**, by default is set to `2000` (2 seconds) |
| **redis** | `Object` | optional | Value passed to the [ioredis](https://github.com/luin/ioredis) [constructor](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) |

### cache.set

Adds a new entry to the cache. This method 

```js
cache.set(key:String, value:Any, ttl:String):Promise
```

Returns a promise. 

Parameter description:

**arguments:**

| argument | type | required | description |
|:---|:---|:---|:---|
| **key** | `String` | yes | key related to this entry. |
| **value** | `Any` | yes | Value to be stored, this value will be stringified when stored in redis. |
| **ttl** | `String` | optional | Time To Live of the entry. Defaults to **20 minutes**.  |

### cache.get

This method gets an entry from the cache. Every time this method gets executed it will:

1. check if it exists in redis
2. attempt to retrieve it from the in-memory cache
3. if not found it will try to get it from redis
4. if found in redis, it will re-store it back into the in-memory cache where it will be available for 2 seconds.

```js
cache.get(key:String):Promise<Any|undefined>
```

Returns a promise, if the key does not exist it will resolve to `undefined`. 

Parameter description:

**arguments:**

| argument | type | required | description |
|:---|:---|:---|:---|
| **key** | `String` | yes | key related to this entry. |

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
