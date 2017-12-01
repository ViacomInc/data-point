# DataPoint Factory

[![Build Status](https://travis-ci.org/ViacomInc/data-point.svg?branch=ci)](https://travis-ci.org/ViacomInc/data-point) [![Coverage Status](https://coveralls.io/repos/github/ViacomInc/data-point/badge.svg?branch=ci)](https://coveralls.io/github/ViacomInc/data-point?branch=ci)

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
| **cache.prefix** | `string` | by default [os.hostname()](https://nodejs.org/api/os.html#os_os_hostname), this will be the prefix of every cache key added to redis |
| **cache.redis** | `Object` | redis settings passed to the [IORedis constructor](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options) |

This method returns a Promise that resolves to a Service Object. 

The Service Object holds a reference to a dataPoint instance. 

```js
const options = {
  entities: {
    'transform:foo': (acc) => 'bar'
  }
}
factory.create(options)
  .then((service) => {
    return service.dataPoint.transform('transform:foo')
  })
  .then(acc => {
    console.log(acc.value)
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
    dataPoint.transform(`entry:HelloWorld`, req.query)
      .then(result => {
        res.send(result.value)
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
      'entry:HelloWorld': (acc) => 'Hello World!!'
    }
  }).then((service) => {
    return service.dataPoint
  })
}

createService()
  .then(server)
```

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
