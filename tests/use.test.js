import isValidOrThrow, { isValid, arrayOf, objectOf,AsyncFunction,GeneratorFunction } from "garn-validator";

describe("isValid", () => {
  test.each([
    [Function, function () {}],
    [Function, () => {}],
    [GeneratorFunction, function* () {}],
    [AsyncFunction, async () => {}],
    [Promise, (async () => {})()],
    [Promise, new Promise(() => {})],
    [Promise, Promise.resolve()],
    [Object, {}],
    [Number, 2],
    [String, "str"],
  ])("isValid(%p)(%p) return true", (a, b) => {
    expect(isValid(a)(b)).toBe(true);
  });
  test.each([
    [AsyncFunction, function () {}],
    [GeneratorFunction,  () => {}],
    [Function, function* () {}],
    [Function, async () => {}],
    [Promise, {then(){},catch(){}}],
    [Promise, Promise],
    [Object, []],
    [Number, '2'],
    [String, 2],
  ])("isValid(%p)(%p) return false", (a, b) => {
    expect(isValid(a)(b)).toBe(false);
  });
});



describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2,'3']);
    }).toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))(['1', 2,3]);
    }).toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 , b:'b'});
    }).toThrow();
  });
});

describe("composable", () => {
  test("simple", () => {
    const isValidNumber = isValidOrThrow(Number);
    expect(() => {
      isValidNumber(2);
    }).not.toThrow();

    expect(() => {
      isValidNumber("2");
    }).toThrow();
  });
  test("multiple", () => {
    expect(() => {
      const isGood = isValidOrThrow(
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
    const validUser = isValidOrThrow({
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
    const isValidPassword = isValidOrThrow(
      String,
      /[a-z]/,
      /[A-Z]/,
      /[0-9]/,
      /[-_/!"·$%&/()]/
    );
    const isValidName = isValidOrThrow(String, (name) => name.length >= 3);
    const isValidAge = isValidOrThrow(
      Number,
      (age) => age > 18,
      (age) => age < 40
    );

    const validUser = isValidOrThrow({
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
    const validUser = isValidOrThrow({
      name: isValidOrThrow(String, (name) => name.length >= 3),
      age: isValidOrThrow(
        Number,
        (age) => age > 18,
        (age) => age < 40
      ),
      password: isValidOrThrow(String, /[a-z]/, /[A-Z]/, /[0-9]/, /[-_/!"·$%&/()]/),
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
