import check, { isValid } from "garn-validator";
describe("check schema", () => {
  const value = {
    a: 1,
    b: 2,
  };
  test("check with constructor", () => {
    expect(() => {
      check({ a: Number })(value); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      check({ a: Number, c: Number })(value);
    }).toThrow();
    expect(() => {
      check({ a: Number, c: undefined })(value);
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      check({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      check({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with primitives", () => {
    expect(() => {
      check({ a: 2 })(value);
    }).toThrow();
    expect(() => {
      check({ a: 1 })(value);
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      check({ a: (val) => val < 0 })(value);
    }).toThrow();
    expect(() => {
      check({ a: (val) => val > 0 })(value);
    }).not.toThrow();
  });
  test("check with custom function", () => {
    let obj = { x: "x", y: "x" };
    expect(() => {
      check({ x: (val, rootObject) => rootObject.y === val })(obj);
    }).not.toThrow();

    expect(() => {
      check({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();
    expect(() => {
      check({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: 10,
      });
    }).toThrow();

    expect(() => {
      check({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();
    expect(() => {
      check({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      check({ [/[a-z]/]: Number })(value);
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: 0 })(value);
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      check({ [/[A-Z]/]: Number })(value);
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: Number, a: 1 })(value); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: Number, a: 2 })(value); // will throw (a is not 2)
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
      check(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      check({ ...schema, a: String })(obj);
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
  test("shold work ending with $ or ?", () => {
    expect(isValid({ 'a?': Number })({ a: 1 })).toBe(true);
    expect(isValid({ 'a?': String })({ a: 1 })).toBe(false);
  });

  test("complex example shold work", () => {
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
});
