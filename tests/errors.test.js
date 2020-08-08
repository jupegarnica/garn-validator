import {
  isValidOrThrow,
  hasErrors,
  isValidOrLogAll,
  isValidOrThrowAll,
  SchemaValidationError,
  EnumValidationError,
  SerieValidationError,
  TypeValidationError,
} from "garn-validator";

describe("AggregateError", () => {
  test.each([AggregateError, SchemaValidationError, Error])(
    "if schema fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAll({ a: Number, b: String })({});
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, EnumValidationError, Error])(
    "if enums fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAll([Number, String])(true);
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, SerieValidationError, Error])(
    "if Series fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAll(Number, String)(true);
      }).toThrow(ErrorType);
    }
  );
  test("checking schema should throw SchemaValidationError or TypeValidationError", () => {
    try {
      isValidOrThrowAll({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
      expect(error.errors.length).toBe(2);
    }
    try {
      isValidOrThrow({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }

    // only 1 key fails
    try {
      isValidOrThrowAll({ a: 1 })({});
    } catch (error) {
      expect(error instanceof TypeValidationError).toBe(true);
      expect(error instanceof SchemaValidationError).toBe(false);
    }
  });
  test("checking enum should throw EnumValidationError or TypeValidationError", () => {
    try {
      isValidOrThrow([Boolean, String])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      isValidOrThrow([Boolean])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }
  });
  test("checking series should throw SerieValidationError or TypeValidationError ", () => {
    try {
      isValidOrThrowAll(Boolean, String)(1);
    } catch (error) {
      expect(error instanceof SerieValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      isValidOrThrowAll(Boolean)(1);
    } catch (error) {
      expect(error instanceof SerieValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }
  });
  test("should message enum", () => {
    try {
      isValidOrThrow([
        () => {
          throw "ups";
        },
        String,
      ])(1);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(EnumValidationError);
      expect(error.message).toMatch("enum");
      expect(error).toBeInstanceOf(AggregateError);
    }
  });
});

describe("check errors", () => {
  test("by default throws TypeValidationError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeValidationError);
  });
  test("Should throw meaningfully message", () => {
    expect(() => {
      isValidOrThrow(1)(33);
    }).toThrow("value 33 do not match primitive 1");
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow("ups");
  });
  test("should throw anything", () => {
    try {
      isValidOrThrow((v) => {
        if (v > 10) throw "ups";
      })(33);
    } catch (error) {
      expect(error).toBe("ups");
    }
  });
  test("should throw anything", () => {
    try {
      isValidOrThrowAll(
        () => {
          throw 1;
        },
        () => {
          throw 2;
        }
      )(33);
    } catch (error) {
      // error is AggregateError
      expect(error).toBeInstanceOf(AggregateError);
      expect(error.errors).toEqual([1, 2]);
    }
  });
  test("should format the schema", () => {
    expect(() => {
      isValidOrThrow({ a: Number })(33);
    }).toThrow('value 33 do not match schema {"a":Number}');
  });
  test("should format the value", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({ b: 33 });
    }).toThrow("on path /a value undefined do not match constructor Number");
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(Number, String)(2);
    }).toThrow("value 2 do not match constructor String");
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    jest.spyOn(globalThis.console, "log");
    try {
      isValidOrThrow(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(globalThis.console.log).not.toHaveBeenCalled();
  });
});

describe("check with invalid validator", () => {
  test("should detect async functions", () => {
    try {
      isValidOrThrow(async () => false)(1);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
    }
  });
  test("should detect generators", () => {
    try {
      isValidOrThrow(function* () {})(1);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
    }
  });
});
