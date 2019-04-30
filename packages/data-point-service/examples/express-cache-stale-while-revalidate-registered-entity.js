const express = require('express')
const DataPoint = require('data-point')
const DataPointService = require('../lib')

const Model = DataPoint.Model('HelloWorld', {
  value: (input, acc) => {
    const person = acc.locals.query.person
    if (!person) {
      throw new Error(
        'Url query parameter "person" is missing. Try appending ?person=Darek at the end of the URL'
      )
    }
    return `Hello ${person}!!`
  },
  params: {
    cache: {
      ttl: '30s',
      staleWhileRevalidate: '3m'
    }
  }
})

function server (dataPoint) {
  const app = express()

  app.get('/api/hello-world', (req, res) => {
    const options = {
      // exposing query to locals will make this object available to all
      // reducers
      locals: {
        query: req.query
      }
    }
    dataPoint
      .resolve(Model, {}, options)
      .then(value => {
        const responseText = `${value} (person = "${req.query.person}")`
        res.send(responseText)
      })
      .catch(error => {
        res.status(500).send(error.toString())
      })
  })

  app.listen(3000, function () {
    console.log('listening on port 3000!')
  })
}

function createService () {
  return DataPointService.create({
    DataPoint
  }).then(service => {
    return service.dataPoint
  })
}

createService().then(server)
