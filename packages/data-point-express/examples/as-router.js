const Express = require('express')
const Service = require('../lib')
const entities = require('./entities')

const app = new Express()

// API Routes
const routes = {
  helloWorld: {
    priority: 100,
    path: '/hello-world',
    middleware: 'transform:HelloWorld'
  },
  greet: {
    priority: 200,
    path: '/greet/:name',
    middleware: 'transform:greet'
  },
  getPerson: {
    priority: 300,
    path: '/person/:personId',
    middleware: 'entry:getPerson'
  }
}

Service.create({ entities })
  .then(service => {
    // create Express routes

    // creates an inspect route
    // only use this in NON Production
    // environments.
    app.use('/api/inspect', service.inspector())

    // create api routes
    app.use('/api', service.router(routes))

    app.listen(3000, err => {
      if (err) {
        throw err
      }

      console.info('Server ready!')

      console.info(
        'Inspector available at',
        'http://localhost:3000/api/inspect'
      )
    })
  })
  .catch(error => {
    console.info('Failed to Create Service')
    console.error(error)
    process.exit(1)
  })
