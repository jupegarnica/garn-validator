import isValidOrThrow, { isValid } from "garn-validator";
describe("check schema", () => {
  test("check with constructor", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      isValidOrThrow({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with primitives", () => {
    expect(() => {
      isValidOrThrow({ a: 2 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: 1 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      isValidOrThrow({ a: (val) => val < 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: (val) => val > 0 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    let obj = { x: "x", y: "x" };
    expect(() => {
      isValidOrThrow({ x: (val, rootObject) => rootObject.y === val })(obj);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: 10,
      });
    }).toThrow();

    expect(() => {
      isValidOrThrow({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      isValidOrThrow({ [/[A-Z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number, a: 1 })({
        a: 1,
        b: 2,
      }); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number, a: 2 })({
        a: 1,
        b: 2,
      }); // will throw (a is not 2)
    }).toThrow();
  });
});

describe("check objects recursively", () => {
  const obj = {
    a: 1,
    deep: {
      x: "x",
      deeper: {
        y: "y",
        method: (v) => console.log(v),
        user: {
          name: "garn",
          city: {
            name: "narnia",
            cp: 46001,
            country: "ESP",
          },
        },
      },
    },
  };
  const schema = {
    a: Number,
    deep: {
      x: (val, root, key) => key === val,
      deeper: {
        y: "y",
        method: Function,
        user: {
          name: String,
          city: {
            name: (v) => v.length > 3,
            cp: [Number, String],
            country: ["ESP", "UK"],
          },
        },
      },
    },
  };
  test("should work", () => {
    expect(() => {
      isValidOrThrow(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      isValidOrThrow({ ...schema, a: String })(obj);
    }).toThrow();
  });
});

describe("optional keys", () => {
  test("if the key exists should be check", () => {
    expect(isValid({ a$: Number })({ a: 1 })).toBe(true);
    expect(isValid({ a$: String })({ a: 1 })).toBe(false);
  });

  test("if the key doesn't exists should be valid", () => {
    expect(isValid({ a$: Number })({})).toBe(true);
  });
  test("should work ending with $ or ?", () => {
    expect(isValid({ "a?": Number })({ a: 1 })).toBe(true);
    expect(isValid({ "a?": String })({ a: 1 })).toBe(false);
  });

  test("complex example should work", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: 1,
        b: 2,
        c: true,
      })
    ).toBe(true);
  });
  test("complex example should fail", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: true,
        b: 2,
        c: true,
      })
    ).toBe(false);
  });
  describe.skip("special cases", () => {
    test("required keys are more important than optional", () => {
      expect(
        isValidOrThrow({
          a: String,
          a$: Number,
        })({
          a: '2',
        })
      ).toBe(true);
    });
  });
});
