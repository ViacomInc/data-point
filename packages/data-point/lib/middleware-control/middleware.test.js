/* eslint-env jest */

const middleware = require("./middleware");

test("middleware#run - with no middleware", async () => {
  const stack = [];

  const expected = {
    foo: "foo"
  };

  const context = await middleware.execute(expected, stack);
  expect(context).toEqual(expected);
});

test("middleware#run - execute 1 middleware", async () => {
  const stack = [
    (acc, next) => {
      acc.bar = "bar";
      next(null);
    }
  ];

  const expected = {
    foo: "foo",
    bar: "bar"
  };

  const context = await middleware.execute(expected, stack);
  expect(context).toEqual(expected);
});

test("middleware#run - catch unhandled error", async () => {
  const stack = [
    () => {
      throw new Error("unhandled");
    }
  ];

  const expected = {
    foo: "foo",
    bar: "bar"
  };

  await expect(
    middleware.execute(expected, stack)
  ).toThrowErrorMatchingInlineSnapshot(`"received is not a function"`);
});

test("middleware#run - pass programmed middleware error", async () => {
  const stack = [
    (acc, next) => {
      next(new Error("planned"));
    }
  ];

  const expected = {
    foo: "foo",
    bar: "bar"
  };

  await expect(
    middleware.execute(expected, stack)
  ).toThrowErrorMatchingInlineSnapshot(`"received is not a function"`);
});

test("middleware#run - with multiple middleware methods", async () => {
  const stack = [
    (acc, next) => {
      acc.a = "a";
      next(null);
    },
    (acc, next) => {
      acc.b = "b";
      next(null);
    },
    (acc, next) => {
      acc.c = "c";
      next(null);
    }
  ];

  const expected = {
    a: "a",
    b: "b",
    c: "c"
  };

  const context = await middleware.execute(expected, stack);
  expect(context).toEqual(expected);
});

test("middleware#run - exit chain when ___done set to true", async () => {
  const stack = [
    (acc, next) => {
      acc.a = "a";
      next(null);
    },
    (acc, next) => {
      acc.b = "b";
      // eslint-disable-next-line no-underscore-dangle
      acc.___done = true;
      next(null);
    },
    (acc, next) => {
      /* istanbul ignore next */
      acc.c = "c";
      /* istanbul ignore next */
      next(null);
    }
  ];

  const expected = {
    a: "a",
    b: "b"
  };

  const context = await middleware.execute(expected, stack);
  expect(context).toEqual(expected);
});

test("middleware#run - exit when next is called with two parameters, value should be second parameter", async () => {
  const stack = [
    (acc, next) => {
      next(null);
    },
    (acc, next) => {
      next(null, "b");
    },
    (acc, next) => {
      /* istanbul ignore next */
      next(null, "c");
    }
  ];

  const acc = {};

  const context = await middleware.execute(acc, stack);
  expect(context.value).toEqual("b");
});

test("middleware#run - only one call to next with resolved value should be used", async () => {
  const stack = [
    (acc, next) => {
      next();
    },
    (acc, next) => {
      next(null, "a");
      setInterval(next, null, "b");
    }
  ];

  const acc = {};
  await expect(middleware.execute(acc, stack)).resolves.toHaveProperty(
    "value",
    "a"
  );
});

test("middleware#run - exit chain on error", async () => {
  const stack = [
    (acc, next) => {
      acc.a = "a";
      next(null);
    },
    (acc, next) => {
      acc.b = "b";
      next(new Error("planned"));
    },
    (acc, next) => {
      /* istanbul ignore next */
      acc.c = "c";
      /* istanbul ignore next */
      next(null);
    }
  ];

  const expected = {
    a: "a",
    b: "b"
  };

  await expect(
    middleware.execute(expected, stack)
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"planned"`);
});
