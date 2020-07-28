import check, { isValid } from "garn-validator";

describe("isValid", () => {
  test.each([
    [Function, function () {}],
    [Function, () => {}],
    // [Function, function* () {}],
    // [Function, async () => {}],
    [Promise, (async () => {})()],
    [Promise, new Promise(() => {})],
    [Promise, Promise.resolve()],
    [Object, {}],
    [Number, 2],
    [String, "str"],
  ])("isValid(%p)(%p) return true", (a, b) => {
    expect(isValid(a)(b)).toBe(true);
  });
});

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
  test("simple", () => {
    const isValidNumber = check(Number);
    expect(() => {
      isValidNumber(2);
    }).not.toThrow();

    expect(() => {
      isValidNumber("2");
    }).toThrow();
  });
  test("multiple", () => {
    expect(() => {
      const isGood = check(
        Number,
        (v) => v < 1990,
        (v) => v > 1980,
        (v) => v % 2 === 0
      );
      isGood(1982);
    }).not.toThrow();
    expect(() => {
      isGood(2001);
    }).toThrow();
    expect(() => {
      isGood(1978);
    }).toThrow();
  });
  test("with schema", () => {
    const validUser = check({
      name: String,
      age: (v) => v > 18,
      password: String,
    });
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "1234",
      });
    }).not.toThrow();
    expect(() => {
      validUser({
        name: "garn",
        age: 18,
        password: "1234",
      });
    }).toThrow();
  });
  test("with complex schema", () => {
    const isValidPassword = check(
      String,
      /[a-z]/,
      /[A-Z]/,
      /[0-9]/,
      /[-_/!"·$%&/()]/
    );
    const isValidName = check(String, (name) => name.length >= 3);
    const isValidAge = check(
      Number,
      (age) => age > 18,
      (age) => age < 40
    );

    const validUser = check({
      name: isValidName,
      age: isValidAge,
      password: isValidPassword,
    });
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "12345aA-",
      });
    }).not.toThrow();
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "1234",
      });
    }).toThrow();
  });
  test("nested", () => {
    const validUser = check({
      name: check(String, (name) => name.length >= 3),
      age: check(
        Number,
        (age) => age > 18,
        (age) => age < 40
      ),
      password: check(String, /[a-z]/, /[A-Z]/, /[0-9]/, /[-_/!"·$%&/()]/),
    });
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "12345aA-",
      });
    }).not.toThrow();
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "1234",
      });
    }).toThrow();
  });
});

describe("multiple validations in series", () => {
  test("should pass every validation as an and operator", () => {
    expect(isValid(Number, String)(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(isValid((val) => val > 0, Number, 2, "2")(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(
      isValid(
        (val) => val > 0,
        Number,
        2,
        (val) => val === 2
      )(2)
    ).toBe(true);
  });
});
