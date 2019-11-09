const debug = require("debug");
const memoize = require("lodash/memoize");
const merge = require("lodash/merge");

const middleware = require("../../middleware");
const utils = require("../../utils");

/**
 * create a new debug scope
 * @param {String} entityType debug scope
 */
function createDebugEntity(entityType) {
  return debug(`data-point:entity:${entityType}`);
}

// debug scope gets memoize so it is not as expensive, it will only create one
// per entity type
const debugEntity = memoize(createDebugEntity);

/**
 * @param {Reducer} reducer
 * @param {Object} entity
 */
function getCurrentReducer(reducer, entity) {
  if (!reducer.spec) {
    return utils.assign(reducer, {
      spec: entity
    });
  }

  return reducer;
}

module.exports.getCurrentReducer = getCurrentReducer;

/**
 * Incase there is an override present, assigns parameters to the correct entity.
 * @param {*} accumulator
 * @param {*} entity
 */
function assignParamsHelper(accumulator, entity) {
  if (accumulator.entityOverrides[entity.entityType]) {
    return merge(
      {},
      entity.params,
      accumulator.entityOverrides[entity.entityType].params
    );
  }
  return entity.params;
}

module.exports.assignParamsHelper = assignParamsHelper;

/**
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Object} entity
 * @returns {Accumulator}
 */
function createCurrentAccumulator(accumulator, reducer, entity) {
  const currentReducer = getCurrentReducer(reducer, entity);
  const entityId = reducer.id;
  const uid = `${entityId}:${utils.getUID()}`;

  // create accumulator to resolve
  const currentAccumulator = utils.assign(accumulator, {
    uid,
    context: entity,
    reducer: currentReducer,
    initialValue: accumulator.value,
    params: assignParamsHelper(accumulator, entity),
    debug: debugEntity(reducer.entityType)
  });

  return currentAccumulator;
}

module.exports.createCurrentAccumulator = createCurrentAccumulator;

function resolveMiddleware(manager, middlewareName, accumulator, value) {
  return middleware.resolve(
    manager,
    middlewareName,
    utils.set(accumulator, "value", value)
  );
}

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Object} entity
 * @returns {Promise}
 */
async function resolveEntity(
  manager,
  resolveReducer,
  accumulator,
  reducer,
  entity
) {
  const currentAccumulator = createCurrentAccumulator(
    accumulator,
    reducer,
    entity
  );

  const spec = currentAccumulator.reducer.spec;

  const trace = currentAccumulator.context.params.trace === true;

  let timeId;
  if (trace === true) {
    timeId = `⧖ ${currentAccumulator.uid}`;
    // eslint-disable-next-line no-console
    console.time(timeId);
  }

  currentAccumulator.debug(currentAccumulator.uid, "- resolve:start");

  let value = currentAccumulator.value;

  let byPass = false;

  try {
    if (spec.inputType) {
      await resolveReducer(manager, currentAccumulator, spec.inputType);
    }

    if (manager.middleware.store.has("before")) {
      const middlewareResult = await resolveMiddleware(
        manager,
        "before",
        currentAccumulator,
        value
      );

      // eslint-disable-next-line no-underscore-dangle
      if (middlewareResult.___resolve === true) {
        byPass = true;
        value = middlewareResult.value;
      }
    }

    const middlewareEntityBefore = `${reducer.entityType}:before`;
    if (!byPass && manager.middleware.store.has(middlewareEntityBefore)) {
      const middlewareResult = await resolveMiddleware(
        manager,
        middlewareEntityBefore,
        currentAccumulator,
        value
      );

      // eslint-disable-next-line no-underscore-dangle
      if (middlewareResult.___resolve === true) {
        byPass = true;
        value = middlewareResult.value;
      }
    }

    if (!byPass) {
      if (spec.before) {
        value = await resolveReducer(
          manager,
          utils.set(currentAccumulator, "value", value),
          spec.before
        );
      }

      if (spec.value) {
        value = await resolveReducer(
          manager,
          utils.set(currentAccumulator, "value", value),
          spec.value
        );
      }

      currentAccumulator.debug(currentAccumulator.uid, "- resolve");
      value = await entity.resolve(
        utils.set(currentAccumulator, "value", value),
        resolveReducer.bind(null, manager)
      );

      if (spec.after) {
        value = await resolveReducer(
          manager,
          utils.set(currentAccumulator, "value", value),
          spec.after
        );
      }
    }

    const middlewareEntityAfter = `${reducer.entityType}:after`;
    if (manager.middleware.store.has(middlewareEntityAfter)) {
      const middlewareResult = await resolveMiddleware(
        manager,
        middlewareEntityAfter,
        currentAccumulator,
        value
      );

      // eslint-disable-next-line no-underscore-dangle
      if (middlewareResult.___resolve === true) {
        byPass = true;
        value = middlewareResult.value;
      }
    }

    if (!byPass && manager.middleware.store.has("after")) {
      const middlewareResult = await resolveMiddleware(
        manager,
        "after",
        currentAccumulator,
        value
      );

      // eslint-disable-next-line no-underscore-dangle
      if (middlewareResult.___resolve === true) {
        byPass = true;
        value = middlewareResult.value;
      }
    }

    if (spec.outputType) {
      await resolveReducer(
        manager,
        utils.set(currentAccumulator, "value", value),
        spec.outputType
      );
    }
  } catch (error) {
    // attach entity information to help debug
    // eslint-disable-next-line no-param-reassign
    error.entityId = currentAccumulator.reducer.spec.id;

    if (!spec.error) {
      throw error;
    }

    value = await resolveReducer(
      manager,
      utils.set(currentAccumulator, "value", error),
      spec.error
    );

    if (spec.outputType) {
      await resolveReducer(
        manager,
        utils.set(currentAccumulator, "value", value),
        spec.outputType
      );
    }
  } finally {
    if (trace === true) {
      // eslint-disable-next-line no-console
      console.timeEnd(timeId);
    }
    currentAccumulator.debug(currentAccumulator.uid, `- resolve:end`);
  }

  return value;
}

module.exports.resolveEntity = resolveEntity;

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Object} entity
 * @returns {Promise<Accumulator>}
 */
async function resolve(manager, resolveReducer, accumulator, reducer, entity) {
  const hasEmptyConditional = reducer.hasEmptyConditional;

  if (hasEmptyConditional && utils.isFalsy(accumulator.value)) {
    return accumulator.value;
  }

  if (!reducer.asCollection) {
    return resolveEntity(manager, resolveReducer, accumulator, reducer, entity);
  }

  if (!Array.isArray(accumulator.value)) {
    return undefined;
  }

  const promises = accumulator.value.map(itemValue => {
    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return itemValue;
    }

    const itemCtx = utils.set(accumulator, "value", itemValue);
    return resolveEntity(manager, resolveReducer, itemCtx, reducer, entity);
  });

  return Promise.all(promises);
}

module.exports.resolve = resolve;
