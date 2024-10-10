const _ = require("lodash");
const fp = require("lodash/fp");
const Promise = require("bluebird");

const utils = require("../../utils");

/**
 * request's default options
 * @type {Object}
 */
const REQUEST_DEFAULT_OPTIONS = {
  method: "GET",
  json: true
};

/**
 * @param {string} url
 * @param {Object} specOptions
 * @return {Object}
 */
function getRequestOptions(url, specOptions) {
  const options = _.defaults({}, specOptions, REQUEST_DEFAULT_OPTIONS);

  let requestUrl;
  // Make a new URL using URL object.
  if (options.baseUrl) {
    const uri = options.uri || options.url || url;
    requestUrl = new URL(uri, options.baseUrl);
  } else {
    requestUrl = new URL(options.url || url);
  }

  options.url = requestUrl.toString();
  // If there are additional query params from qs then we need to add/append them here.
  // We'll then reuse the requestUrl to form the proper requestUrl to be passed to options.url
  if (options.qs) {
    const queryParams = new URLSearchParams([
      ...Array.from(requestUrl.searchParams.entries()),
      ...Object.entries(options.qs)
    ]);
    options.url = `${requestUrl.origin}${requestUrl.pathname}?${queryParams}`;
  }
  return options;
}

module.exports.getRequestOptions = getRequestOptions;

/**
 * @param {string} url
 * @param {Accumulator} acc
 * @return {string}
 */
function resolveUrlInjections(url, acc) {
  const matches = url.match(/\{(.*?)\}/g) || [];
  const injectedUrl = matches.reduce((replacementTarget, match) => {
    const objPath = match.slice(1, -1);
    const value = _.get(acc, objPath, "");
    return replacementTarget.replace(match, value);
  }, url);

  return injectedUrl;
}

module.exports.resolveUrlInjections = resolveUrlInjections;

/**
 * @param {Accumulator} acc
 * @return {Accumulator}
 */
function resolveUrl(acc) {
  let urlToResolve = acc.reducer.spec.url;

  // use acc.value when Request.url is not set
  if (!urlToResolve && typeof acc.value === "string" && acc.value) {
    urlToResolve = acc.value;
  }

  // prevent from executing resolveUrlInjections when
  // urlToResolve is empty string
  return urlToResolve && typeof urlToResolve === "string"
    ? resolveUrlInjections(urlToResolve, acc)
    : undefined;
}

module.exports.resolveUrl = resolveUrl;

/**
 * Resolve options object
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveOptions(accumulator, resolveReducer) {
  const url = resolveUrl(accumulator);
  const specOptions = accumulator.reducer.spec.options;
  return resolveReducer(accumulator, specOptions).then(value => {
    const options = getRequestOptions(url, value);
    return utils.assign(accumulator, { options });
  });
}

module.exports.resolveOptions = resolveOptions;

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveRequest(acc) {
  const options = Object.assign({}, acc.options);

  const request = new Request(options.url, options);

  return fetch(request)
    .then(async res => {
      // 404 Handler
      if (!res.ok) {
        throw new Error("fetch unsuccessful 2XX response not recieved", {
          cause: res
        });
      }

      const resBody = await res.text();

      // check if response is set to return as json (set true in default request option)
      // otherwise return response as default fetch Response object
      if (options.json) {
        // if body is JSON parse it. If not try, stringify then parse it.
        try {
          return JSON.parse(resBody);
        } catch (e) {
          return JSON.parse(JSON.stringify(resBody));
        }
      }
      return res;
    })
    .catch(async error => {
      // remove auth objects from acc and error for printing to console
      const redactedAcc = fp.set("options.auth", "[omitted]", acc);

      const message = [
        "Entity info:",
        "\n  - Id: ",
        _.get(redactedAcc, "reducer.spec.id"),
        "\n",
        utils.inspectProperties(
          redactedAcc,
          ["options", "params", "value"],
          "  "
        )
      ];

      // Retrieve error text from response and store it back in response (for easier usage with inspectProperties later)
      const response = error.cause;
      if (response) {
        const errorText = await response.text();
        response.bodyText = errorText;
        response.error_message = error.message;
        message.push(
          "\n  Response:\n",
          utils.inspectProperties(
            response,
            ["error_message", "status", "statusText", "bodyText"],
            "  "
          )
        );
      }

      // attaching to error so it can be exposed by a handler outside datapoint
      // eslint-disable-next-line no-param-reassign
      error.message = `${error.message}\n\n${message.join("")}`;
      throw error;
    });
}

module.exports.resolveRequest = resolveRequest;

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolve(acc, resolveReducer) {
  return Promise.resolve(acc)
    .then(itemContext => resolveOptions(itemContext, resolveReducer))
    .then(itemContext => resolveRequest(itemContext, resolveReducer));
}

module.exports.resolve = resolve;
