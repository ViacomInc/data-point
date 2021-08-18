/* eslint-disable no-console */
const backoff = require("./backoff");

describe("backoff", () => {
  console.log = jest.fn();
  console.error = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.clearAllTimers();
  });

  test("It should retry four times before succeeding", async () => {
    const func = () => {
      let count = 0;
      return async () => {
        count += 1;
        if (count < 5) {
          throw new Error(`Missing ${5 - count} iterations.`);
        } else {
          return "ok";
        }
      };
    };

    backoff(func()).then(result => {
      expect(result).toBe("ok");

      expect(console.log).toHaveBeenCalledWith(
        "data-point-cache - retrying in 2s"
      );
      expect(console.log).toHaveBeenCalledWith(
        "data-point-cache - retrying in 3s"
      );
      expect(console.log).toHaveBeenCalledWith(
        "data-point-cache - retrying in 5s"
      );
      expect(console.log).toHaveBeenCalledWith(
        "data-point-cache - retrying in 8s"
      );
      expect(console.error).toHaveBeenCalledWith(
        "data-point-cache - backoff error:",
        new Error("Missing 4 iterations.")
      );
      expect(console.error).toHaveBeenCalledWith(
        "data-point-cache - backoff error:",
        new Error("Missing 3 iterations.")
      );
      expect(console.error).toHaveBeenCalledWith(
        "data-point-cache - backoff error:",
        new Error("Missing 2 iterations.")
      );
      expect(console.error).toHaveBeenCalledWith(
        "data-point-cache - backoff error:",
        new Error("Missing 1 iterations.")
      );
    });
  });
});
