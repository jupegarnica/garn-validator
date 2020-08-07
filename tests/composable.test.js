import isValidOrThrow, {
  TypeValidationError,
  isValidOrThrowAllErrors,
  SeriesValidationError,
} from "garn-validator";

describe("composable errors", () => {
  test("should work", () => {
    expect(isValidOrThrow(isValidOrThrow(Number))(1)).toBe(true);
  });
  test("should fail", () => {
    let validator = isValidOrThrow(Number);

    try {
      isValidOrThrow(validator)("2");
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(TypeValidationError);
      expect(error.message).toContain("Number");
    }
  });
  test("should fail with AggregateError collecting all errors", () => {
    let validator = isValidOrThrow(Number, String);

    try {
      isValidOrThrowAllErrors(validator)(null);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(SeriesValidationError);
      expect(error.message).toContain("[Number,String]");
      expect(error.errors.length).toBe(2);
    }
  });
  test("should fail with TypeValidationError collecting one error", () => {
    let validator = isValidOrThrowAllErrors(Number, String);

    try {
      isValidOrThrow(validator)(null);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(TypeValidationError);
      expect(error.message).not.toContain("Number,String");
      expect(error.message).toContain("Number");
      expect(error.errors).toBe(undefined);
    }
  });
});

describe("composable usage", () => {
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
