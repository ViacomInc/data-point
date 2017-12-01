'use strict'

function Middleware (name, callback) {
  this.name = name
  this.callback = callback
}

function create (name, callback) {
  return new Middleware(name, callback)
}

module.exports.create = create
