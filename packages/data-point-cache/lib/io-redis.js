// This file is here to support mocking ioredis
// https://github.com/stipsan/ioredis-mock/issues/568
const ioredis = require('ioredis')
const Promise = require('bluebird')

ioredis.Promise = Promise

module.exports = ioredis
