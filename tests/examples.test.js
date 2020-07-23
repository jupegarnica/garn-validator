import check, { setOnError, isValid } from "garn-validator";

describe("check with constructors", () => {
  test("should work", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

    expect(() => {
      check(RegExp)(/\s/);
    }).not.toThrow();

    expect(() => {
      check(Array)([]);
    }).not.toThrow();

    expect(() => {
      check(RangeError)(new RangeError());
    }).not.toThrow();

    expect(() => {
      check(Object)({});
    }).not.toThrow();

    expect(() => {
      class MyClass {}
      check(MyClass)(new MyClass());
    }).not.toThrow();
  });
});
describe("check with primitives values", () => {
  test("should work", () => {
    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check(2)(2);
    }).not.toThrow();

    expect(() => {
      check(1)(2);
    }).toThrow();
  });
});

describe("check with custom validator", () => {
  test("can return true or false", () => {
    expect(() => {
      check(() => true)(33);
    }).not.toThrow();

    expect(() => {
      check(() => false)(33);
    }).toThrow();
  });
  test("can throw a custom message", () => {
    expect(() => {
      check(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      check(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("can throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
describe("check with enums", () => {
  test("Should be used as OR operator", () => {
    expect(() => {
      check([1, 0])(1);
    }).not.toThrow();

    expect(() => {
      check([Number, String])(0);
    }).not.toThrow();

    expect(() => {
      check([undefined, 0])(null);
    }).toThrow();
  });
});

describe("check objects against a schema", () => {
  test("check with constructor", () => {
    expect(() => {
      check({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      check({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();

    expect(() => {
      check({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
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


  test("check with custom function", () => {
    expect(() => {
      check({ a: (val) => val < 0 })({
        a: 1,
      });
    }).toThrow();
  });
  test("check with custom function against the root object", () => {

    expect(() => {
      check({ x: (val, rootObject, keyName) => rootObject.y === val })({ x: "x", y: "x" });
    }).not.toThrow();

    expect(() => {
      check({
        max: (val, rootObject,keyName) => val > rootObject.min,
        min: (val, rootObject,keyName) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();

    expect(() => {
      check({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();

    expect(() => {
      check({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  describe("match key with regex", () => {
    test('should match all keys matching the regex', () => {
      expect(() => {
        check({ [/[a-z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test('should throw', () => {
      expect(() => {
        check({ [/[a-z]/]: 0 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });

    test('should throw only if the key is matched', () => {
      expect(() => {
        check({ [/[A-Z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

  test('not throws, all lowercase keys are numbers', () => {
    expect(() => {
      check({ [/[a-z]/]: Number, a: 1 })({
        a: 1,
        b: 2,
      }); //
    }).not.toThrow();
  });

    test('should throw (a is not 2) ', () => {
      expect(() => {
        check({ [/[a-z]/]: Number, a: 2 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });
  });
});

describe("multiple validations in series", () => {
  test("should pass every validation as an AND operator", () => {
    expect(isValid(Number, String)(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(isValid((val) => val > 0, Number, 2, val => val === 2)(2)).toBe(true);
  });

  test("should throw the error message related to the check failed", () => {
    expect(()=> {
      check(() => { throw new Error()}, String)(2)
    }).toThrow(Error)
  });

  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
    try {
      check(() => { throw new Error()}, () => console.log('I run?'))(2)
    } catch (err) {

    }
    expect(global.console.log).not.toHaveBeenCalled();
  });
});

describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      check({ [/\d/]: Number })([1, 2]);
    }).not.toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      check({ [/\w/]: Number })({ a: 1 });
    }).not.toThrow();
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
  test("check big object", () => {
    expect(() => {
      check(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
});

describe("composable", () => {
  test("isValidNumber", () => {
    const isValidNumber = check(Number);

    expect(() => {
      isValidNumber(2);
    }).not.toThrow();
  });
  test("isPositive", () => {
    const isPositive = check((v) => v > 0);

    expect(() => {
      isPositive(2);
    }).not.toThrow();
  });
});

describe("set on error to isValid", () => {
  // const isValid = setOnError(() => false); // import named isValid

  test("should return true if valid", () => {
    expect(isValid(Number)(2)).toBe(true);
  });
  test("should return false if valid", () => {
    expect(isValid(String)(2)).toBe(false);
  });
});

describe("set on error  to log error", () => {
  beforeAll(() => {
    global.console = {
      error: jest.fn(),
      log: jest.fn(),
    };
  });
  const checkOrLog = setOnError((err) => console.error(err)); // same as isValidOrLog

  test("should not log error", () => {
    checkOrLog(Number)(2);

    expect(global.console.error).not.toHaveBeenCalled();
  });
  test("should log error", () => {
    checkOrLog(String)(2);

    expect(global.console.error).toHaveBeenCalled();
  });
});
