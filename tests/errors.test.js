import {
  isValidOrThrow,
  hasErrors,
  isValidOrLogAllErrors,
  isValidOrThrowAllErrors,
} from "garn-validator";

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
    }).toThrow('on path /a value undefined do not match type Number');
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(Number, String)(2);
    }).toThrow('value 2 do not match type String');
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
    try {
      isValidOrThrow(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(global.console.log).not.toHaveBeenCalled();
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
      hasErrors({ num: Number, str: String })( { num: "2", str: "str" })
    ).toEqual([
      new TypeError('on path /num value "2" do not match type Number'),
    ]);
  });
  describe("in serie", () => {
    test.each([
      [Number, (v) => v > 0, 2, null],
      [
        Number,
        (v) => v > 100,
        2,
        [new TypeError('value 2 do not match type v=>v>100')],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeError('value 2 do not match type String'),
          new TypeError('value 2 do not match type v=>v>100'),
        ],
      ],
    ])("hasErrors(%p,%p)(%p) === %p", (a, b, input, expected) => {
      expect(hasErrors(a, b)(input)).toStrictEqual(expected);
    });
  });
  describe("in schema", () => {
    test.each([
      [{ num: Number }, { num: 2 }, null],
      [{ num: Number, str: String }, { num: 2, str: "str" }, null],
    ])(
      "should return null : hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
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
          new TypeError('on path /str value null do not match type String'),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
      }
    );
  });
  describe("in recursive schema", () => {
    test.each([
      [{ obj: { num: Number } }, { obj: { num: 2 } }],
      [{ obj: { num: Number, str: String } }, { obj: { num: 2, str: "str" } }],
    ])("should return null : hasErrors(%p)(%p) === %p", (schema, obj) => {
      expect(hasErrors(schema)(obj)).toStrictEqual(null);
    });
    test.each([
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: "str" } },
        [
          new TypeError(
            'on path /obj/num value "2" do not match type Number'
          ),
        ],
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
          new TypeError(
            'on path /obj/num value "2" do not match type Number'
          ),
          new TypeError(
            'on path /obj/str value null do not match type String'
          ),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
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
          'on path /noValidKey value 1 do not match type ()=>false'
        ),
        new TypeError(
          'on path /name value "Garn" do not match type /^[a-z]{3,}$/'
        ),
        new TypeError('on path /age value 18 do not match type age=>age>18'),
        new EvalError("unexpected key"),
        new TypeError(
          'on path /car/brand value "Honda" do not match type ["honda","toyota"]'
        ),
        new TypeError(
          'on path /car/date value "1982-01-01" do not match type Date'
        ),
        new TypeError(
          'on path /car/country/name value undefined do not match type String'
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
        y: 1
      }
      expect(hasErrors(schema1,schema2)(obj)).toEqual([
        new TypeError(
          'on path /x value true do not match type Number'
        ),
        new TypeError(
          'on path /y value 1 do not match type Boolean'
        ),
        new TypeError(
          'on path /z value undefined do not match type Function'
        ),

      ]);
    });
  });
});

describe("isValidOrThrowAllErrors ", () => {
  test("should throw AggregateError with all errors", () => {
    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).toThrow(AggregateError);

    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).not.toThrow(TypeError);
  });
  test("should throw 2 errors", () => {
    try {
      isValidOrThrowAllErrors(Number, Boolean, String)(true);
    } catch (error) {
      expect(error.errors.length).toBe(2);
      // error.errors.forEach(e => console.warn(e.name, e.message))
    }
  });
});
describe("isValidOrLogAllErrors", () => {
  test("should return true or false", () => {
    expect(isValidOrLogAllErrors(Number, String)(true)).toBe(false);

    expect(isValidOrLogAllErrors(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(Number, Boolean, String)(true);
    expect(global.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(Number, Boolean, String)(true);

    expect(global.console.error).toHaveBeenCalledWith(
      'value true do not match type Number'
    );
    expect(global.console.error).toHaveBeenCalledWith(
      'value true do not match type String'
    );
  });
  test("should log meaningful errors in schemas", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(
      { x: Number },
      { y: Boolean },
      { z: String }
    )({ x: 1, y: 2, z: 3 });

    expect(global.console.error).toHaveBeenCalledWith(
      "on path /y value 2 do not match type Boolean"

    );
    expect(global.console.error).toHaveBeenCalledWith(
      "on path /y value 2 do not match type Boolean"
    );
  });
});
