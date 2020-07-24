import check, { setOnError, isValid,isValidOrLog } from "garn-validator";

describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      check({ [/\d/]: Number })([1, 2]);
    }).not.toThrow();
    expect(() => {
      check({ [/\d/]: 0 })([1, 2]);
    }).toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      check({ [/\w/]: Number })({ a: 1 });
    }).not.toThrow();
    expect(() => {
      check({ [/\w/]: 0 })({ a: 1 });
    }).toThrow();
  });
});

describe("composable", () => {
  test("isValidNumber", () => {
    const isValidNumber = check(Number);
    expect(() => {
      isValidNumber(2);
    }).not.toThrow();

    expect(() => {
      isValidNumber("2");
    }).toThrow();
  });
  test("isPositive", () => {
    const isPositive = check((v) => v > 0);
    expect(() => {
      isPositive(2);
    }).not.toThrow();

    expect(() => {
      isPositive(-1);
    }).toThrow();
  });
});

describe("set on error to isValid", () => {
  // const isValid = setOnError(() => false);
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
  // const isValidOrLog = setOnError((err) => console.error(err));

  test("should not log error", () => {
    isValidOrLog(Number)(2);
    expect(global.console.error).not.toHaveBeenCalled();
  });
  test("should log error", () => {
    isValidOrLog(String)(2);
    expect(global.console.error).toHaveBeenCalled();
  });
});

describe("multiple validations in series", () => {
  test("should pass every validation as an and operator", () => {
    expect(isValid(Number, String)(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(isValid((val) => val > 0, Number, 2, '2')(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(isValid((val) => val > 0, Number, 2, val => val === 2)(2)).toBe(true);
  });
  test("should throw the error message related to the check failed", () => {
    expect(()=> {
      check(Number, String)(2)
    }).toThrow('value 2 do not match type \"function String() { [native code] }\"')
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
