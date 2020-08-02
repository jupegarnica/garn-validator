import {
  isValidOrThrow,
  hasErrors,
  isValidOrLogAllErrors,
  isValidOrThrowAllErrors,
  SchemaValidationError,
  EnumValidationError,
  SeriesValidationError,
} from "garn-validator";

describe("AggregateError", () => {
  test.each([AggregateError, SchemaValidationError, Error])(
    "if schema fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors({ a: Number, b: String })({});
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, EnumValidationError, Error])(
    "if enums fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors([Number, String])(true);
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, SeriesValidationError, Error])(
    "if Series fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors(Number, String)(true);
      }).toThrow(ErrorType);
    }
  );
  test("checking schema should throw SchemaValidationError or TypeError", () => {
    try {
      isValidOrThrowAllErrors({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
      expect(error.errors.length).toBe(2);
    }
    try {
      isValidOrThrow({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(false);
      expect(error instanceof TypeError).toBe(true);
    }

    // only 1 key fails
    try {
      isValidOrThrowAllErrors({ a: 1 })({});
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
      expect(error instanceof SchemaValidationError).toBe(false);
    }
  });
  test("checking enum should throw EnumValidationError or TypeError", () => {
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
      expect(error instanceof TypeError).toBe(true);
    }
  });
  test("checking series should throw SeriesValidationError or TypeError ", () => {
    try {
      isValidOrThrowAllErrors(Boolean, String)(1);
    } catch (error) {
      expect(error instanceof SeriesValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      isValidOrThrowAllErrors(Boolean)(1);
    } catch (error) {
      expect(error instanceof SeriesValidationError).toBe(false);
      expect(error instanceof TypeError).toBe(true);
    }
  });
});

describe("check with invalid validator", () => {
  test('should detect async functions', () => {
    try {
      isValidOrThrow(async () => false)(1);
      throw 'mec';
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
    }
  });
  test('should detect generators', () => {
    try {
      isValidOrThrow(function*(){})(1);
      throw 'mec';
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
    }
  });

});
describe("check errors", () => {
  test("by default throws TypeError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("Should throw meaningfully message", () => {
    expect(() => {
      isValidOrThrow(1)(33);
    }).toThrow("value 33 do not match type 1");
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
      isValidOrThrowAllErrors(
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
    }).toThrow('value 33 do not match type {"a":Number}');
  });
  test("should format the value", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({ b: 33 });
    }).toThrow("on path /a value undefined do not match type Number");
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(Number, String)(2);
    }).toThrow("value 2 do not match type String");
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
describe("checking enums", () => {
  test("should throw AggregateError (EnumValidationError) if none pass", () => {
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
      expect(error).toBeInstanceOf(AggregateError);
    }
  });
});

describe("hasErrors", () => {
  test("should return null", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: 2, str: "str" })
    ).toBe(null);
  });
  test("should return array of errors", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: "2", str: "str" })
    ).toEqual([
      new TypeError('on path /num value "2" do not match type Number'),
    ]);
  });
  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1 }, () => false)(true).length).toBe(3);
  });

  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1, y: 2 }, [1, 2])({}).length).toBe(5);
  });
  describe("in serie", () => {
    test.each([
      [Number, (v) => v > 0, 2, null],
      [
        Number,
        (v) => v > 100,
        2,
        [new TypeError("value 2 do not match type v=>v>100")],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeError("value 2 do not match type String"),
          new TypeError("value 2 do not match type v=>v>100"),
        ],
      ],
    ])("hasErrors(%p,%p)(%p) === %p", (a, b, input, expected) => {
      expect(hasErrors(a, b)(input)).toEqual(expected);
    });
  });
  describe("in schema", () => {
    test.each([
      [{ num: Number }, { num: 2 }, null],
      [{ num: Number, str: String }, { num: 2, str: "str" }, null],
    ])(
      "should return null : hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
    test.each([
      [
        { num: Number, str: String },
        { num: "2", str: "str" },
        [new TypeError('on path /num value "2" do not match type Number')],
      ],
      [
        { num: Number, str: String },
        { num: "2", str: null },
        [
          new TypeError('on path /num value "2" do not match type Number'),
          new TypeError("on path /str value null do not match type String"),
        ],
        // [
        //   new AggregateError(
        //     [
        //       new TypeError('on path /num value "2" do not match type Number'),
        //       new TypeError("on path /str value null do not match type String"),
        //     ],
        //     'value {"num":"2","str":null} do not match type {"num":Number,"str":String}'
        //   ),
        // ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
  });
  describe("in recursive schema", () => {
    test.each([
      [{ obj: { num: Number } }, { obj: { num: 2 } }],
      [{ obj: { num: Number, str: String } }, { obj: { num: 2, str: "str" } }],
    ])("should return null : hasErrors(%p)(%p) === %p", (schema, obj) => {
      expect(hasErrors(schema)(obj)).toEqual(null);
    });
    test.each([
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: "str" } },
        [new TypeError('on path /obj/num value "2" do not match type Number')],
      ],
      [
        {
          thr: () => {
            throw new RangeError("ups");
          },
        },
        { thr: 1 },
        [new RangeError("ups")],
      ],
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: null } },
        [
          new TypeError('on path /obj/num value "2" do not match type Number'),
          new TypeError("on path /obj/str value null do not match type String"),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
  });
  describe("complex schema", () => {
    const schema = {
      name: /^[a-z]{3,}$/,
      age: (age) => age > 18,
      car: {
        brand: ["honda", "toyota"],
        date: Date,
        country: {
          name: String,
        },
        [/./]: () => {
          throw new EvalError("unexpected key");
        },
      },
      optional$: true,
      [/./]: () => false,
    };
    test("should return null ", () => {
      const obj = {
        name: "garn",
        age: 19,
        optional: true,
        car: {
          brand: "honda",
          date: new Date("1982-01-01"),
          country: {
            name: "Japan",
          },
        },
      };
      expect(hasErrors(schema)(obj)).toEqual(null);
    });
    test("should return errors", () => {
      const obj = {
        name: "Garn",
        age: 18,
        optional: false,
        car: {
          brand: "Honda",
          date: "1982-01-01",
          country: {
            NAME: "Japan",
          },
          evalError: null,
        },
        noValidKey: 1,
      };
      expect(hasErrors(schema)(obj)).toEqual([
        new TypeError(
          "on path /noValidKey value 1 do not match type ()=>false"
        ),
        new TypeError(
          'on path /name value "Garn" do not match type /^[a-z]{3,}$/'
        ),
        new TypeError("on path /age value 18 do not match type age=>age>18"),
        new EvalError("unexpected key"),
        new TypeError(
          'on path /car/brand value "Honda" do not match type "honda"'
        ),
        new TypeError(
          'on path /car/brand value "Honda" do not match type "toyota"'
        ),
        new TypeError(
          'on path /car/date value "1982-01-01" do not match type Date'
        ),
        new TypeError(
          "on path /car/country/name value undefined do not match type String"
        ),

        new TypeError("on path /optional value false do not match type true"),
      ]);
    });
  });
  describe("multiples schemas in series", () => {
    test("should return errors", () => {
      const schema1 = {
        x: Number,
      };
      const schema2 = {
        y: Boolean,
        z: Function,
      };
      const obj = {
        x: true,
        y: 1,
      };
      expect(hasErrors(schema1, schema2)(obj)).toEqual([
        new TypeError("on path /x value true do not match type Number"),
        new TypeError("on path /y value 1 do not match type Boolean"),
        new TypeError("on path /z value undefined do not match type Function"),
      ]);
    });
  });
});

describe("isValidOrThrowAllErrors ", () => {
  jest.spyOn(globalThis.console, "error");

  test("should throw AggregateError with all errors", () => {
    try {
      isValidOrThrowAllErrors(Number, String)(true);
      throw "ups";
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
    }
    try {
      isValidOrThrowAllErrors(Number, String)(true);

      throw "ups";
    } catch (error) {
      expect(error).not.toBeInstanceOf(TypeError);
    }
  });
  test("should throw 2 errors", () => {
    try {
      isValidOrThrowAllErrors(Number, Boolean, String)(true);
    } catch (error) {
      expect(error.errors.length).toBe(2);
    }
  });
});
describe("isValidOrLogAllErrors", () => {
  test("should return true or false", () => {
    jest.spyOn(globalThis.console, "error");
    expect(isValidOrLogAllErrors(Number, String)(true)).toBe(false);

    expect(isValidOrLogAllErrors(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    jest.spyOn(globalThis.console, "error");

    isValidOrLogAllErrors(Number, Boolean, String)(true);
    expect(globalThis.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    jest.spyOn(globalThis.console, "error");
    isValidOrLogAllErrors(Number, Boolean, String)(true);

    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeError("value true do not match type Number")
    );
    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeError("value true do not match type String")
    );
  });
  test("should log meaningful errors in schemas", () => {
    jest.spyOn(globalThis.console, "error");
    isValidOrLogAllErrors(
      { x: Number },
      { y: Boolean },
      { z: String }
    )({ x: 1, y: 2, z: 3 });

    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeError("on path /y value 2 do not match type Boolean")
    );
    expect(globalThis.console.error).toHaveBeenCalledWith(
      new TypeError("on path /z value 3 do not match type String")
    );
  });
});
