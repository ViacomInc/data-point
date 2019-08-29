const mockReducer = jest.fn(spec => {
  return (value, acc) => spec(value, acc);
});

jest.mock("./create-reducer", () => {
  return {
    createReducer: mockReducer
  };
});

const { ReducerEntity } = require("./ReducerEntity");
const { Accumulator } = require("./Accumulator");

afterEach(() => {
  jest.clearAllMocks();
});

const mockResolveReducer = jest.fn((acc, reducer) => {
  return reducer(acc.value, acc);
});

describe("ReducerEntity", () => {
  describe("createReducerProperty", () => {
    it("should return reducer if spec's property is set", () => {
      const spec = {
        value: () => "value"
      };

      const result = ReducerEntity.prototype.createReducer.call(
        undefined,
        "value",
        spec
      );

      expect(mockReducer).toBeCalledWith(spec.value);
      expect(result()).toEqual("value");
    });

    it("should do nothing if spec's property is not set", () => {
      const spec = {};

      const result = ReducerEntity.prototype.createReducer.call(
        undefined,
        "prop",
        spec
      );

      expect(mockReducer).not.toBeCalled();
      expect(result).toEqual(undefined);
    });
  });

  describe("constructor", () => {
    const uid = () => "uid";
    const params = {
      params: true
    };
    function createEntity() {
      return new ReducerEntity({
        uid,
        name: "customEntity",
        value: () => "value",
        inputType: () => "inputType",
        outputType: () => "outputType",
        before: () => "before",
        after: () => "after",
        params
      });
    }
    it("should set uid", () => {
      const entity = createEntity();
      expect(entity).toHaveProperty("uid", uid);
    });

    it("should set params", () => {
      const entity = createEntity();
      expect(entity).toHaveProperty("params", params);
    });

    it("should set default params to empty object", () => {
      const entity = new ReducerEntity({});
      expect(entity).toHaveProperty("params", {});
    });

    it("should set name", () => {
      const entity = createEntity();
      expect(entity).toHaveProperty("name", "customEntity");
    });

    it("should set reducers", () => {
      const entity = createEntity();
      expect(entity.value()).toEqual("value");
      expect(entity.after()).toEqual("after");
      expect(entity.before()).toEqual("before");
      expect(entity.inputType()).toEqual("inputType");
      expect(entity.outputType()).toEqual("outputType");
    });
  });

  describe("resolveReducer", () => {
    it("should resolve entityValue", async () => {
      const entity = new ReducerEntity({
        name: "customEntity",
        value: "value"
      });

      const mockResolveEntityValue = jest
        .spyOn(entity, "resolveEntityValue")
        .mockResolvedValue("entityValue");

      const acc = new Accumulator();

      const result = await entity.resolveReducer(acc, mockResolveReducer);

      expect(mockResolveEntityValue).toBeCalledWith(acc, mockResolveReducer);

      expect(result).toEqual("entityValue");
    });

    describe("handle resolveEntityValue throwing an error", () => {
      it("should throw augmented error if this.catch is not set", async () => {
        const entity = new ReducerEntity({
          name: "customEntity",
          value: () => "value"
        });

        jest
          .spyOn(entity, "resolveEntityValue")
          .mockRejectedValue(new Error("entityError"));

        const acc = new Accumulator();

        let error;

        try {
          await entity.resolveReducer(acc, mockResolveReducer);
        } catch (err) {
          error = err;
        }

        expect(error).toMatchInlineSnapshot(`[Error: entityError]`);
        expect(error.reducer).toEqual(entity);
      });

      it("should resolve this.catch", async () => {
        const entity = new ReducerEntity({
          name: "customEntity",
          value: () => "value",
          catch: () => "catch"
        });

        const mockResolveEntityValue = jest
          .spyOn(entity, "resolveEntityValue")
          .mockRejectedValue(new Error("entityError"));

        const acc = new Accumulator();

        const result = await entity.resolveReducer(acc, mockResolveReducer);

        expect(mockResolveEntityValue).toBeCalledWith(acc, mockResolveReducer);
        expect(mockResolveReducer).toHaveBeenCalledTimes(1);
        expect(result).toEqual("catch");
      });

      it("should check output type of this.catch resolved value for data integrity", async () => {
        const entity = new ReducerEntity({
          name: "customEntity",
          value: () => "value",
          catch: () => "catch",
          outputType: () => "outputType"
        });

        const mockResolveEntityValue = jest
          .spyOn(entity, "resolveEntityValue")
          .mockRejectedValue(new Error("entityError"));

        const acc = new Accumulator();

        const result = await entity.resolveReducer(acc, mockResolveReducer);

        expect(mockResolveEntityValue).toBeCalledWith(acc, mockResolveReducer);
        expect(mockResolveReducer).toHaveBeenCalledTimes(2);
        expect(result).toEqual("catch");
      });

      it("should not handle error if catch fails", async () => {
        const entity = new ReducerEntity({
          name: "customEntity",
          value: () => "value",
          catch: () => {
            throw new Error("catchError");
          }
        });

        const mockResolveEntityValue = jest
          .spyOn(entity, "resolveEntityValue")
          .mockRejectedValue(new Error("entityError"));

        const acc = new Accumulator();

        const result = await entity
          .resolveReducer(acc, mockResolveReducer)
          .catch(err => err);

        expect(mockResolveEntityValue).toBeCalledWith(acc, mockResolveReducer);
        expect(mockResolveReducer).toHaveBeenCalledTimes(1);
        expect(result).toMatchInlineSnapshot(`[Error: catchError]`);
      });

      it("should not handle error if outputType fails", async () => {
        const entity = new ReducerEntity({
          name: "customEntity",
          value: () => "value",
          catch: () => "catch",
          outputType: () => {
            throw new Error("outputTypeError");
          }
        });

        const mockResolveEntityValue = jest
          .spyOn(entity, "resolveEntityValue")
          .mockRejectedValue(new Error("entityError"));

        const acc = new Accumulator();

        const result = await entity
          .resolveReducer(acc, mockResolveReducer)
          .catch(err => err);

        expect(mockResolveEntityValue).toBeCalledWith(acc, mockResolveReducer);
        expect(mockResolveReducer).toHaveBeenCalledTimes(2);
        expect(result).toMatchInlineSnapshot(`[Error: outputTypeError]`);
      });
    });
  });

  describe("resolveEntityValue", () => {
    it("should return value if no reducers are set", async () => {
      const entity = new ReducerEntity({
        name: "customEntity"
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(result).toEqual("initialValue");
    });

    it("should execute inputType but not mutate result", async () => {
      const inputType = jest.fn(() => "inputType");
      const entity = new ReducerEntity({
        name: "customEntity",
        inputType
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(inputType).toBeCalled();
      expect(result).toEqual("initialValue");
    });

    describe("cache", () => {
      it("should skip cache if cache.get is not a function", async () => {
        const mockBefore = jest.fn(value => value);
        const entity = new ReducerEntity("type", {
          name: "customEntity",
          before: mockBefore
        });

        const cache = {
          get: undefined
        };

        const acc = new Accumulator({
          value: "initialValue",
          cache
        });

        const result = await entity.resolveEntityValue(acc, mockResolveReducer);
        expect(mockBefore).toBeCalled();
        expect(result).toEqual("initialValue");
      });

      it("should call this.uid when assigned", async () => {
        const mockUid = jest.fn(() => "uid");
        const entity = new ReducerEntity("type", {
          uid: mockUid,
          name: "customEntity"
        });

        const acc = new Accumulator({
          value: "initialValue"
        });

        await entity.resolveEntityValue(acc, mockResolveReducer);
        expect(mockUid).toBeCalledWith(acc);
      });

      it("should use cache result if cache.get returns !== undefined", async () => {
        const mockUid = jest.fn(() => "uid");
        const mockBefore = jest.fn(value => value);

        const entity = new ReducerEntity("type", {
          uid: mockUid,
          name: "customEntity",
          before: mockBefore
        });

        const cache = {
          get: jest.fn(() => "cachedResult")
        };

        const acc = new Accumulator({
          value: "initialValue",
          cache
        });

        const result = await entity.resolveEntityValue(acc, mockResolveReducer);
        expect(cache.get).toBeCalledWith("uid", acc);
        expect(mockBefore).not.toBeCalled();
        expect(result).toEqual("cachedResult");
      });

      it("should ignore cache result if cache.get returns undefined", async () => {
        const mockBefore = jest.fn(value => value);
        const entity = new ReducerEntity("type", {
          name: "customEntity",
          before: mockBefore
        });

        const cache = {
          get: () => undefined
        };

        const acc = new Accumulator({
          value: "initialValue",
          cache
        });

        const result = await entity.resolveEntityValue(acc, mockResolveReducer);
        expect(mockBefore).toBeCalled();
        expect(result).toEqual("initialValue");
      });

      it("should call cache.set if cache.set is set, and cache.get() misses", async () => {
        const entity = new ReducerEntity({
          name: "customEntity"
        });

        const cache = {
          get: () => undefined,
          set: jest.fn()
        };

        const acc = new Accumulator({
          value: "initialValue",
          cache
        });

        const result = await entity.resolveEntityValue(acc, mockResolveReducer);
        expect(cache.set).toBeCalled();
        expect(result).toEqual("initialValue");
      });
    });

    it("should resolve and return value of this.before reducer", async () => {
      const entity = new ReducerEntity({
        name: "customEntity",
        before: value => `${value}:before`
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(result).toEqual("initialValue:before");
    });

    it("should resolve and return value of this.value reducer", async () => {
      const entity = new ReducerEntity({
        name: "customEntity",
        value: value => `${value}:value`
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(result).toEqual("initialValue:value");
    });

    it("should resolve and return value of this.after reducer", async () => {
      const entity = new ReducerEntity({
        name: "customEntity",
        after: value => `${value}:after`
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(result).toEqual("initialValue:after");
    });

    it("should execute outputType but not mutate result", async () => {
      const outputType = jest.fn(() => "outputType");
      const entity = new ReducerEntity({
        name: "customEntity",
        outputType
      });

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(outputType).toBeCalled();
      expect(result).toEqual("initialValue");
    });

    it("should execute this.resolve (if set) and return value", async () => {
      const outputType = jest.fn(() => "outputType");
      const entity = new ReducerEntity({
        name: "customEntity",
        outputType
      });

      entity.resolve = jest.fn(acc => `${acc.value}:resolve`);

      const acc = new Accumulator({
        value: "initialValue"
      });

      const result = await entity.resolveEntityValue(acc, mockResolveReducer);
      expect(outputType).toBeCalled();
      expect(result).toEqual("initialValue:resolve");
    });

    it("should execute reducers in right order", async () => {
      const tracker = [];
      const mockResolveReducerTracker = jest.fn((acc, reducer) => {
        tracker.push(reducer(acc.value, acc));
      });

      const entity = new ReducerEntity({
        name: "customEntity",
        inputType: () => "inputType",
        before: () => "before",
        value: () => "value",
        after: () => "after",
        outputType: () => "outputType"
      });

      entity.resolve = () => tracker.push("resolve");

      const acc = new Accumulator({
        value: "initialValue"
      });

      await entity.resolveEntityValue(acc, mockResolveReducerTracker);

      expect(tracker).toMatchInlineSnapshot(`
        Array [
          "inputType",
          "before",
          "value",
          "resolve",
          "after",
          "outputType",
        ]
      `);
    });
  });
});
