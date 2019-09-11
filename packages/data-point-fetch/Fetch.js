const { URL, URLSearchParams } = require("url");

const fetch = require("node-fetch");

const ReducerEntity = require("@data-point/core/ReducerEntity");
const createReducer = require("@data-point/core/createReducer");

function appendSearchParams(currentSearch, query) {
  const newSearchParams = new URLSearchParams(query);

  if (!currentSearch) {
    return newSearchParams;
  }

  const existingSearchParams = new URLSearchParams(currentSearch);

  newSearchParams.forEach((value, key) => {
    existingSearchParams.append(key, value);
  });

  return existingSearchParams;
}

/**
 * @param {string} initialUrl request url.
 * @param {Object} query query string object.
 * @returns {string} url with query string appended
 */
function createRequestUrl(initialUrl, query) {
  if (!query) {
    return initialUrl;
  }

  const url = new URL(initialUrl);

  url.search = appendSearchParams(url.search, query);

  return url.href;
}

/**
 * @param {string} url request url.
 * @param {options} options fetch [options](https://github.com/bitinn/node-fetch#fetch-options).
 * @returns {Response} [Response](https://github.com/bitinn/node-fetch#class-response) from fetch.
 * @throws Will throw error if `response.ok` is not `true`.
 */
async function makeFetch(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(`${response.status} - ${response.statusText}`);
    error.response = response;
    throw error;
  }

  return response;
}

/**
 * DataPoint Reducer to interface with [node-fetch](https://github.com/bitinn/node-fetch)
 *  module.
 *
 * By default it will return the value of `response.json()`, set
 *  `Fetch.response` to have full control over the result of the
 *  [Response](https://github.com/bitinn/node-fetch#class-response) object.
 *
 * @alias Fetch
 */
class Fetch extends ReducerEntity {
  /**
   * @param {Object} spec
   * @param {Reducer} spec.url Resolves to the URL for fetching
   * @param {Reducer} spec.query Resolves to a query string object to
   *  append to the url
   * @param {Reducer} spec.options [Options](https://github.com/bitinn/node-fetch#fetch-options)
   *  for the http(s) request.
   * @param {Reducer} spec.response Handles the response of the fetch
   *  operation. It will execute only if [response.ok](https://github.com/bitinn/node-fetch#responseok)
   *  is `true`.
   *  The input value passed to this reducer is the [Response](https://github.com/bitinn/node-fetch#class-response).
   */
  constructor(spec = {}) {
    super(spec);

    if (!spec.url) {
      throw new Error("fetch.url:Reducer must be provided");
    }

    this.url = createReducer(spec.url);

    if (spec.query) {
      this.query = createReducer(spec.query);
    }

    if (spec.options) {
      this.options = createReducer(spec.options);
    }

    if (spec.response) {
      this.response = createReducer(spec.response);
    }
  }

  static create(spec) {
    return new Fetch(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const request = await resolveReducer(accumulator, this.url);

    const options = this.options
      ? await resolveReducer(accumulator, this.options)
      : undefined;

    const query = this.query
      ? await resolveReducer(accumulator, this.query)
      : undefined;

    const url = createRequestUrl(request, query);

    const responseObject = await makeFetch(url, options);

    // by default if this.response is not set then res.json() is assumed
    if (!this.response) {
      return responseObject.json();
    }

    return resolveReducer(
      accumulator.set("value", responseObject),
      this.response
    );
  }
}

module.exports = {
  appendSearchParams,
  createRequestUrl,
  makeFetch,
  Fetch
};
