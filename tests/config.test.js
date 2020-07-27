import { isValidOrThrowAllErrors,isValidOrThrow ,isValidOrLogAllErrors} from "garn-validator";


describe("configured to throw only first error", () => {
  test("should throw only one error", () => {
    expect(() => {
      isValidOrThrow(Number, String)(true);
    }).toThrow(TypeError);
  });
  test("should throw only one custom error", () => {
    expect(() => {
      isValidOrThrow(Boolean, () => {
        throw new RangeError('ups')
      }, Number)(true);
    }).toThrow(RangeError);
  });
});

describe("configured to throw all  errors as AggregateError ", () => {
  test("should throw AggregateError with all errors", () => {
    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).toThrow(AggregateError);

    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).not.toThrow(TypeError);
  });
  test('should throw 2 errors', () => {
    try {
      isValidOrThrowAllErrors(Number, Boolean,String)(true);

    } catch (error) {
      expect(error.errors.length).toBe(2);
      // error.errors.forEach(e => console.warn(e.name, e.message))
    }
  });

});
describe("configured to log all  errors and return true or false ", () => {
  global.console = {
    error: jest.fn(),
  };
  test("should throw AggregateError with all errors", () => {
    expect(
      isValidOrLogAllErrors(Number, String)(true)
    ).toBe(false);

    expect(
      isValidOrLogAllErrors(Boolean, true)(true)
    ).toBe(true)
  });
  test('should throw 2 errors', () => {

    try {
      isValidOrLogAllErrors(Number, Boolean,String)(true);

    } catch (err) {}
    expect(global.console.error).toHaveBeenCalledTimes(2);

  });

});
