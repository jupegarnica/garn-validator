import { isValidOrThrowAllErrorsAsync, isValid } from "garn-validator";

describe("Async validation", () => {
  test("should return a promise ", () => {
    let promise = isValidOrThrowAllErrorsAsync(Number)(2);
    expect(isValid(Promise)(promise)).toBe(true);
  });
  test("should resolve in true ", async () => {
    expect(await isValidOrThrowAllErrorsAsync(Number)(2)).toBe(true);
  });
  test("should reject in error ", () => {
    let promise = isValidOrThrowAllErrorsAsync(String)(2);
    expect(promise).rejects.toEqual(
      new TypeError('value 2 do not match type "String"')
    );
  });
  test("should reject in AggregateError ", () => {
    let promise = isValidOrThrowAllErrorsAsync(String, Boolean)(2);
    expect(promise).rejects.toStrictEqual(
      new AggregateError(
        [new TypeError('value 2 do not match type "String"')],
        "value 2 do not match type [String,Boolean]"
      )
    );
  });

  const fetchValidation = async (v) => {
    if (v === 33) return value;
    throw "invalid value: " + v;
  };
  test("should work using an async validator", async () => {
    let isValid = await isValidOrThrowAllErrorsAsync(async (val) => {
      return await fetchValidation(val);
    })(3);
    expect(isValid).toBe(true);
  });

  test("should throw using an async validator", async () => {
    try {
      await isValidOrThrowAllErrorsAsync(async (val) => {
        throw "invalid value: " + 10;

      })(10);
      // throw 1;
    } catch (error) {
      console.log(error);
      expect(error).toBe("invalid value: 10");
    }
    expect().toBe("invalid value: 10");
  });
});
