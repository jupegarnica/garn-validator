import {
  mustBe,
  hasErrors,
  isValidOrLogAll,
  mustBeOrThrowAll,
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
        mustBeOrThrowAll({ a: Number, b: String })({});
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, EnumValidationError, Error])(
    "if enums fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        mustBeOrThrowAll([Number, String])(true);
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, SerieValidationError, Error])(
    "if Series fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        mustBeOrThrowAll(Number, String)(true);
      }).toThrow(ErrorType);
    }
  );
  test("checking schema should throw SchemaValidationError or TypeValidationError", () => {
    try {
      mustBeOrThrowAll({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
      expect(error.errors.length).toBe(2);
    }
    try {
      mustBe({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }

    // only 1 key fails
    try {
      mustBeOrThrowAll({ a: 1 })({});
    } catch (error) {
      expect(error instanceof TypeValidationError).toBe(true);
      expect(error instanceof SchemaValidationError).toBe(false);
    }
  });
  test("checking enum should throw EnumValidationError or TypeValidationError", () => {
    try {
      mustBe([Boolean, String])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      mustBe([Boolean])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }
  });
  test("checking series should throw SerieValidationError or TypeValidationError ", () => {
    try {
      mustBeOrThrowAll(Boolean, String)(1);
    } catch (error) {
      expect(error instanceof SerieValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      mustBeOrThrowAll(Boolean)(1);
    } catch (error) {
      expect(error instanceof SerieValidationError).toBe(false);
      expect(error instanceof TypeValidationError).toBe(true);
    }
  });
  test("should message enum", () => {
    try {
      mustBe([
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
      mustBe(Boolean)(33);
    }).toThrow(TypeValidationError);
  });
  test("Should throw meaningfully message", () => {
    expect(() => {
      mustBe(1)(33);
    }).toThrow("33 do not match primitive 1");
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      mustBe((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      mustBe((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow("ups");
  });
  test("should throw anything", () => {
    try {
      mustBe((v) => {
        if (v > 10) throw "ups";
      })(33);
    } catch (error) {
      expect(error).toBe("ups");
    }
  });
  test("should throw anything", () => {
    try {
      mustBeOrThrowAll(
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
      mustBe({ a: Number })(33);
    }).toThrow('33 do not match schema {"a":Number}');
  });
  test("should format the value", () => {
    expect(() => {
      mustBe({ a: Number })({ b: 33 });
    }).toThrow("At path /a undefined do not match constructor Number");
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      mustBe(Number, String)(2);
    }).toThrow("2 do not match constructor String");
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      mustBe(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    jest.spyOn(globalThis.console, "log");
    try {
      mustBe(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(globalThis.console.log).not.toHaveBeenCalled();
  });
});

// describes("check with invalid validator", () => {
//   test("should detect async functions", () => {
//     try {
//       mustBe(async () => false)(1);
//       throw "mec";
//     } catch (error) {
//       expect(error).toBeInstanceOf(SyntaxError);
//     }
//   });
//   test("should detect generators", () => {
//     try {
//       mustBe(function* () {})(1);
//       throw "mec";
//     } catch (error) {
//       expect(error).toBeInstanceOf(SyntaxError);
//     }
//   });
// });
