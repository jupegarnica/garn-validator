import { config } from "garn-validator";

const throwOnlyFirstError = config({
  collectAllErrors: false,
});
const throwAllErrors = config({
  collectAllErrors: true,
});

describe("configured to throw only first error", () => {
  test("should throw only one error", () => {
    expect(() => {
      throwOnlyFirstError(Number, String)(true);
    }).toThrow(TypeError);
  });
  test("should throw only one custom error", () => {
    expect(() => {
      throwOnlyFirstError(Boolean, () => {
        throw new RangeError('ups')
      }, Number)(true);
    }).toThrow(RangeError);
  });
});

describe("configured to throw all  errors as AggregateError ", () => {
  test("should throw AggregateError with all errors", () => {
    expect(() => {
      throwAllErrors(Number, String)(true);
    }).toThrow(AggregateError);

    expect(() => {
      throwAllErrors(Number, String)(true);
    }).not.toThrow(TypeError);
  });
  test('should throw 2 errors', () => {
    try {
      throwAllErrors(Number, Boolean,String)(true);

    } catch (error) {
      expect(error.errors.length).toBe(2);
      // error.errors.forEach(e => console.warn(e.name, e.message))
    }
  });

});
