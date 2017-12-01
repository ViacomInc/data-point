function generateKey (prefix, ctx) {
  const cacheKey = ctx.context.params.cacheKey
    ? ctx.context.params.cacheKey(ctx)
    : `entity:${ctx.context.id}`

  return `${prefix}:${cacheKey}`
}

module.exports.generateKey = generateKey

function before (service, ctx, next) {
  if (ctx.locals.resetCache === true || !ctx.context.params.ttl) {
    return next()
  }

  service.cache
    .get(generateKey(service.cachePrefix, ctx))
    .then(res => {
      /* istanbul ignore else */
      if (res) {
        ctx.resolve(res)
      }
      next(null)
    })
    .catch(next)
    .done()

  return true
}

module.exports.before = before

function after (service, ctx, next) {
  if (!ctx.context.params.ttl) {
    return next()
  }

  service.cache
    .set(
      generateKey(service.cachePrefix, ctx),
      ctx.value,
      ctx.context.params.ttl
    )
    .then(res => next())
    .catch(next)
    .done()

  return true
}

module.exports.after = after

function setupMiddleware (service) {
  return Promise.resolve(true).then(() => {
    const settings = service.settings
    const dataPoint = service.dataPoint

    let middlewareBefore = settings.before
      ? settings.before
      : before.bind(null, service)
    let middlewareAfter = settings.after
      ? settings.after
      : after.bind(null, service)

    dataPoint.middleware.use('before', middlewareBefore)
    dataPoint.middleware.use('after', middlewareAfter)

    return service
  })
}

module.exports.setupMiddleware = setupMiddleware
