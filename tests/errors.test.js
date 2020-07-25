import check, { collectAllErrors } from "garn-validator";

describe("check errors", () => {
  test("by default throws TypeError", () => {
    expect(() => {
      check(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("Should throw meaningfully message", () => {
    expect(() => {
      check(1)(33);
    }).toThrow("value 33 do not match type 1");
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow("ups");
  });
  test("should format the schema", () => {
    expect(() => {
      check({ a: Number })(33);
    }).toThrow(
      'value 33 do not match type {"a":"Number"}'
    );
  });
  test("should format the value", () => {
    expect(() => {
      check({ a: Number })({ b: 33 });
    }).toThrow(
      'value {"b":33} do not match type {"a":"Number"}'
    );
  });
});
describe("check error in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      check(Number, String)(2);
    }).toThrow(
      'value 2 do not match type "String"'
    );
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      check(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
    try {
      check(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(global.console.log).not.toHaveBeenCalled();
  });
});
describe("collect all errors", () => {
  test("should collect all errors in series", () => {
    expect(() => {
      try {
        collectAllErrors(Boolean, String, (v) => {
          if (v < 0) return true;
          throw new RangeError(`${v} must be negative`);
        })(33);
      } catch (error) {
        // error.errors.forEach(err => console.warn(err.name,err.message))
        throw error;
      }
    }).toThrow();
  });
});
