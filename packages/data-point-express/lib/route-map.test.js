/* eslint-env jest */

const RouteMap = require('./route-map')
const _ = require('lodash')
const logger = require('./logger')
logger.clear()

const routes = {
  a: {
    priority: 200,
    path: '/a/:b',
    middleware: (route, next) => {
      next(null, 'a')
    }
  },
  b: {
    priority: 100,
    path: '/',
    middleware: (route, next) => {
      next(null, 'b')
    }
  },
  c: {
    priority: 300,
    path: '/a/:b/:c',
    middleware: 'c'
  },
  d: {
    priority: 150,
    path: '/a',
    middleware: (route, next) => {
      next(null, false)
    }
  },
  e: {
    priority: 180,
    path: '/a',
    middleware: (route, next) => {
      next(null, 'e')
    }
  },
  f: {
    priority: 400,
    path: '/error',
    middleware: (route, next) => {
      next(new Error('bad'))
    }
  },
  g: {
    priority: 250,
    path: '/throw',
    middleware: (route, next) => {
      throw new Error('error')
    }
  },
  j: {
    priority: 250,
    enabled: false
  }
}

describe('toCollection', () => {
  test('converts a hash into a collection', () => {
    const result = RouteMap.toCollection({
      a: {},
      b: {},
      c: {}
    })
    expect(_.map(result, 'id')).toEqual(['a', 'b', 'c'])
  })
})

describe('sortByPriority', () => {
  test('sorts routes in prioroty order', () => {
    const result = RouteMap.sortByPriority([
      {
        id: 'a',
        priority: 200
      },
      {
        id: 'b',
        priority: 100
      },
      {
        id: 'c',
        priority: 300
      }
    ])
    expect(_.map(result, 'id')).toEqual(['b', 'a', 'c'])
  })
})

describe('filterEnabled', () => {
  test('remove any that has enabled set to false', () => {
    const result = RouteMap.filterEnabled([
      {
        id: 'a',
        enabled: false
      },
      {
        id: 'b',
        enabled: true
      },
      {
        id: 'c'
      }
    ])
    expect(_.map(result, 'id')).toEqual(['b', 'c'])
  })
})

describe('normalizeRoutesMiddleware', () => {
  test('sorts routes in prioroty order', () => {
    const result = RouteMap.normalizeRoutesMiddleware([
      { middleware: 'a' },
      { middleware: ['a'] }
    ])
    expect(_.map(result, 'middleware')).toEqual([['a'], ['a']])
  })
})

describe('verifyMiddlewareFormat', () => {
  function createRoute (id, middleware) {
    return {
      id,
      middleware
    }
  }
  test('accepts non string middleware', () => {
    expect(
      RouteMap.verifyMiddlewareFormat(createRoute('Foo', [() => {}]))
    ).toEqual(true)
  })
  test('should not be empty', () => {
    expect(() => {
      RouteMap.verifyMiddlewareFormat(createRoute('Foo', []))
    }).toThrowErrorMatchingSnapshot()
  })
  test('accepts string entityId', () => {
    expect(
      RouteMap.verifyMiddlewareFormat(createRoute('Foo', ['entityId']))
    ).toEqual(true)
  })
  test('throw error if more than one entityId', () => {
    expect(() => {
      RouteMap.verifyMiddlewareFormat(
        createRoute('Foo', ['entityId1', 'entityId2'])
      )
    }).toThrowErrorMatchingSnapshot()
  })
  test('throw error if entityId is not the last middleware', () => {
    expect(() => {
      RouteMap.verifyMiddlewareFormat(createRoute('Foo', ['entityId1', 1]))
    }).toThrowErrorMatchingSnapshot()
  })
  test('allow entityId to be the last middleware', () => {
    expect(
      RouteMap.verifyMiddlewareFormat(createRoute('Foo', [1, 2, 'entityId1']))
    ).toEqual(true)
  })
})

describe('normalize', () => {
  test('defaults to []', () => {
    const result = RouteMap.normalize()
    expect(_.map(result, 'id')).toEqual([])
  })
  test('sorts routes in prioroty order', () => {
    const result = RouteMap.normalize(routes)
    expect(_.map(result, 'id')).toEqual(['b', 'd', 'e', 'a', 'g', 'c', 'f'])
  })
})

describe('normalizeMiddleware', () => {
  test('It should map list, non string pass as is', () => {
    expect(RouteMap.normalizeMiddleware([1, 2])).toEqual([1, 2])
  })

  test('It should map string middleware as callback decorator', () => {
    const list = [1, 'a:1']
    const callback = jest.fn()
    RouteMap.normalizeMiddleware(list, callback)
    expect(callback.mock.calls.length).toEqual(1)
    expect(callback.mock.calls[0]).toEqual(['a:1'])
  })
})

describe('sendResponseFromValue', () => {
  test('It should use "req.send" if value is string', () => {
    const value = 'value'
    const send = jest.fn()
    const req = {
      value
    }

    const res = {
      send
    }

    RouteMap.sendResponseFromValue(req, res)
    expect(send).toBeCalledWith(value)
  })

  test('It should use "req.json" if value is string', () => {
    const value = {
      value: 'value'
    }
    const json = jest.fn()
    const req = {
      value
    }

    const res = {
      json
    }

    RouteMap.sendResponseFromValue(req, res)
    expect(json).toBeCalledWith(value)
  })
})

describe('getRouteMethod', () => {
  test('It should return false if method is not valid', () => {
    expect(RouteMap.getRouteMethod('invalid')).toEqual(false)
  })
  test('It should return get by default', () => {
    expect(RouteMap.getRouteMethod()).toEqual('get')
  })
  test('It should return lower case method if valid', () => {
    expect(RouteMap.getRouteMethod('PUT')).toEqual('put')
  })
  test('It should return valid for get, put, delete, post', () => {
    expect(RouteMap.getRouteMethod('get')).toEqual('get')
    expect(RouteMap.getRouteMethod('post')).toEqual('post')
    expect(RouteMap.getRouteMethod('delete')).toEqual('delete')
    expect(RouteMap.getRouteMethod('post')).toEqual('post')
  })
})

const createApp = () => ({
  locals: {
    dataPoint: {}
  }
})

describe('addRoute', () => {
  test('It should throw error if invalid method', () => {
    expect(() => {
      const route = {
        method: 'foo'
      }
      RouteMap.addRoute(createApp(), '/api', route, () => {})
    }).toThrowError()
  })

  test('It should add a route', () => {
    const mid = () => 1
    const route = {
      path: '/test',
      method: 'get',
      middleware: [mid, 'dp']
    }
    const app = createApp()
    app.get = jest.fn()
    const dataPointMiddleware = (dataPoint, middleware) => middleware
    RouteMap.addRoute(app, '/api', route, dataPointMiddleware)
    expect(app.get).toBeCalled()
  })
})

describe('createRoutes', () => {
  test('It should create multiple routes', () => {
    const mid = () => 1

    const routes = {
      a: {
        path: '/a',
        method: 'get',
        middleware: [mid, 'dp']
      },
      b: {
        path: '/b',
        method: 'put',
        middleware: [mid]
      }
    }
    const app = createApp()
    app.get = jest.fn()
    app.put = jest.fn()
    const dataPointMiddleware = () => 'dp'
    RouteMap.createRoutes(app, '/api', routes, dataPointMiddleware)
    expect(app.get).toBeCalledWith('/api/a', mid, 'dp')
    expect(app.put).toBeCalledWith('/api/b', mid)
  })
})
