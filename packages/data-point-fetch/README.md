# @data-point/fetch

> DataPoint Reducer that wraps the node-fetch module.

**Prerequisites:**

Node v10 LTS or higher.

**Installing:**

```bash
npm install --save @data-point/fetch
```

For documentation on this module's api: [http://data-point.github.com/reducers/fetch](http://data-point.github.com/reducers/fetch).

For data-point's documentation visit its [home page](http://data-point.github.com) ([http://data-point.github.com](http://data-point.github.com)).

## Example

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
