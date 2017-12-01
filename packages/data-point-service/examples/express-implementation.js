const express = require('express')
const DataPoint = require('data-point')
const DataPointService = require('../lib')

function server (dataPoint) {
  const app = express()

  app.get('/api/hello-world', (req, res) => {
    dataPoint.transform(`entry:HelloWorld`, req.query).then(result => {
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
      'entry:HelloWorld': acc => 'Hello World!!'
    }
  }).then(service => {
    return service.dataPoint
  })
}

createService().then(server)
