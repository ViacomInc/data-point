const express = require('express')
const DataPoint = require('data-point')
const DataPointService = require('../lib')

function server (dataPoint) {
  const app = express()

  app.get('/api/hello-world', (req, res) => {
    dataPoint.resolve(`model:HelloWorld`, {}).then(value => {
      res.send(value)
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
      'model:HelloWorld': {
        value: () => 'Hello World'
      }
    }
  }).then(service => {
    return service.dataPoint
  })
}

createService().then(server)
