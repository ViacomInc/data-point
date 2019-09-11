const nock = require("nock");
const dataPoint = require("@data-point/core")();
const Reducer = require("@data-point/core/Reducer");

const {
  Fetch,
  createRequestUrl,
  appendSearchParams,
  makeFetch
} = require("./Fetch");

describe("appendSearchParams", () => {
  it("should return newSearchParams as is if no currentSearch", () => {
    const result = appendSearchParams(undefined, { a: 1 });
    expect(result.toString()).toEqual("a=1");
  });

  it("should append params", () => {
    const result = appendSearchParams("a=1", "b=1");
    expect(result.toString()).toEqual("a=1&b=1");
  });
});

describe("createRequestUrl", () => {
  it("should return query as is if query object is falsy", () => {
    const result = createRequestUrl("http://some.test");
    expect(result).toEqual("http://some.test");
  });

  it("should apply query string to url", () => {
    const result = createRequestUrl("http://some.test", {
      a: "bar",
      b: "baz"
    });
    expect(result).toEqual("http://some.test/?a=bar&b=baz");
  });

  it("should not override existing query strings", () => {
    const result = createRequestUrl("http://some.test?f=foo", {
      a: "bar",
      b: "baz"
    });
    expect(result).toEqual("http://some.test/?f=foo&a=bar&b=baz");
  });
});

describe("makeFetch", () => {
  it("should call fetch with given options", async () => {
    nock("https://data-point-test.test")
      .put("/path")
      .reply(200, {
        ok: "true"
      });
    const result = await makeFetch("https://data-point-test.test/path", {
      method: "put"
    });

    expect(await result.json()).toEqual({
      ok: "true"
    });
  });

  it("should throw error if response is not ok", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .reply(404);

    let error;
    try {
      await makeFetch("https://data-point-test.test/path");
    } catch (fetchError) {
      error = fetchError;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.response).toMatchObject({
      status: 404,
      statusText: "Not Found",
      url: "https://data-point-test.test/path"
    });
  });
});

describe("Fetch", () => {
  describe("constructor", () => {
    it("should throw error if url is not provided", () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new Fetch();
      }).toThrowErrorMatchingInlineSnapshot(
        `"fetch.url:Reducer must be provided"`
      );
    });

    it("should set fetch.url", () => {
      const fetch = new Fetch({
        url: () => "http://some.com"
      });
      expect(fetch.url).toBeInstanceOf(Reducer);
    });

    it("should set fetch.query", () => {
      const fetch = new Fetch({
        url: () => "http://some.com",
        query: () => true
      });
      expect(fetch.url).toBeInstanceOf(Reducer);
      expect(fetch.query).toBeInstanceOf(Reducer);
    });

    it("should set fetch.options", () => {
      const fetch = new Fetch({
        url: () => "http://some.com",
        options: () => true
      });
      expect(fetch.url).toBeInstanceOf(Reducer);
      expect(fetch.options).toBeInstanceOf(Reducer);
    });

    it("should set fetch.response", () => {
      const fetch = new Fetch({
        url: () => "http://some.com",
        response: () => true
      });
      expect(fetch.url).toBeInstanceOf(Reducer);
      expect(fetch.response).toBeInstanceOf(Reducer);
    });
  });

  describe("create", () => {
    it("should create a new instance of ReducerIfThenElse", () => {
      expect(
        Fetch.create({
          url: () => "http://some.com"
        })
      ).toBeInstanceOf(Fetch);
    });
  });

  it("should fetch an external path and default to json", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .reply(200, {
        ok: "true"
      });

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path"
    });

    const result = await dataPoint.resolve(true, fetch);

    expect(result).toEqual({ ok: "true" });
  });

  it("should fetch with query strings", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .query({ a: "bar", b: "baz" })
      .reply(200, {
        ok: "true"
      });

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path",
      query: () => ({
        a: "bar",
        b: "baz"
      })
    });

    const result = await dataPoint.resolve(true, fetch);

    expect(result).toEqual({ ok: "true" });
  });

  it("should fetch with options", async () => {
    const options = {
      reqheaders: {
        "X-My-Headers": "value",
        "X-My-Awesome-Header": "awesome-value"
      }
    };
    nock("https://data-point-test.test", options)
      .put("/path")
      .reply(200, {
        ok: "true"
      });

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path",
      options: () => ({
        method: "put",
        headers: {
          "X-My-Headers": "value",
          "X-My-Awesome-Header": "awesome-value"
        }
      })
    });

    const result = await dataPoint.resolve(true, fetch);

    expect(result).toEqual({ ok: "true" });
  });

  it("should use response reducer to process the raw response", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .reply(200, "Hello world");

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path",
      response: res => res.text()
    });

    const result = await dataPoint.resolve(true, fetch);

    expect(result).toEqual("Hello world");
  });

  it("should not call response reducer if fetch returns an error result", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .reply(404);

    const mockResponse = jest.fn();

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path",
      response: mockResponse
    });

    await expect(
      dataPoint.resolve(true, fetch)
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"404 - Not Found"`);

    expect(mockResponse).not.toBeCalled();
  });

  it("for demo purposes - handle an error", async () => {
    nock("https://data-point-test.test")
      .get("/path")
      .reply(404, "oh noes!!");

    const fetch = new Fetch({
      url: () => "https://data-point-test.test/path",
      catch: error => {
        return error.response.text();
      }
    });

    const result = await dataPoint.resolve(true, fetch);
    expect(result).toEqual("oh noes!!");
  });
});
