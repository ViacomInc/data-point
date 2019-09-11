---
id: data-point-fetch
title: @data-point/fetch
sidebar_label: @data-point/fetch
---

```js
const Fetch = require("@data-point/fetch");
```

DataPoint Reducer that wraps the [node-fetch](https://github.com/bitinn/node-fetch) module.

**Example:**

```js
const DataPoint = require("@data-point/core");
const Fetch = require("@data-point/fetch");

async function main() {
  const dataPoint = DataPoint();

  const getLuke = Fetch({
    url: value => `https://swapi.co/api/people/${value}`
  });

  const result = await dataPoint.resolve(1, getLuke);

  console.log(result.name); // Luke Skywalker
}

main();
```

## Syntax

```js
Fetch({
  // Fetch properties
  url: Reducer,
  query: Reducer,
  options: Reducer,
  response: Reducer,

  // inherited Entity class properties
  name: String,
  inputType: String | Reducer,
  before: Reducer,
  value: Reducer,
  after: Reducer,
  outputType: String | Reducer,
  catch: Reducer,
  params: Object
});
```

By default the `Fetch` reducer returns the value of `response.json()`. To override this behavior use [fetch.response](#fetch.response) to have full control over the result of the [Response](https://github.com/bitinn/node-fetch#class-response) object.

## Arguments

| Key                        | Type                        | Description                                                                            |
| :------------------------- | :-------------------------- | :------------------------------------------------------------------------------------- |
| [url](#modelurl)           | [Reducer](../reducer-types) | Resolves to the URL for fetching.                                                      |
| [options](#modeloptions)   | [Reducer](../reducer-types) | [Options](https://github.com/bitinn/node-fetch#fetch-options) for the http(s) request. |
| [query](#modelquery)       | [Reducer](../reducer-types) | Resolves to a query string object to append to the url.                                |
| [response](#modelresponse) | [Reducer](../reducer-types) | Handles the response of the fetch.                                                     |

## fetch.url

The resolved result of this reducer is the url to be fetched.

### Example: Fetch url

Builds a url from the input passed to `dataPoint.resolve`.

```js
const getLuke = Fetch({
  url: value => `https://swapi.co/api/people/${value}`
});

const result = await dataPoint.resolve(1, getLuke);

console.assert(result.name, "Luke Skywalker");
```

## fetch.query

Builds a query string object and appends it to the url being fetched. Overrides query string found on the `Fetch.url`.

### Example: Fetch with query string

Builds a url from the input passed to `dataPoint.resolve`.

```js
const searchPeople = Fetch({
  url: () => "https://swapi.co/api/people/",

  query: {
    search: value => value
  },

  response: [res => res.json(), "$results"]
});

const result = await dataPoint.resolve("sky", searchPeople);

console.assert(result.results[0].name, "Luke Skywalker");
```

## fetch.options

Builds the [Options](https://github.com/bitinn/node-fetch#fetch-options) Object passed to `node-fetch`.

### Example: Fetch with options object

Hi [https://httpbin.org](https://httpbin.org) service with a post request.

```js
const testPost = Fetch({
  url: () => "https://httpbin.org/post",

  options: value => ({ method: "POST", body: value })
});

const result = await dataPoint.resolve("a=1", testPost);

console.assert(result);
```

## fetch.response

Handles the response of the fetch operation, receives a [Response](https://github.com/bitinn/node-fetch#class-response) Object as its input. This reducer will execute **only** if [response.ok](https://github.com/bitinn/node-fetch#responseok) is `true`.

Use this reducer if you need to access the response directly coming from fetch, usually the case will be when you need to treat the result as a non json result.

### Example: Fetch and save stream

```js
const saveOctocat = Fetch({
  url: () =>
    "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png",

  response: res => {
    const dest = fs.createWriteStream("./octocat.png");
    res.body.pipe(dest);
  }
});

await dataPoint.resolve(true, saveOctocat);
```
