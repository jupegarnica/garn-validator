import {
  isValid,
  isValidOrThrowAll,
  isValidOrLogAll,
  hasErrors,
  AsyncFunction,
  GeneratorFunction,
  TypeValidationError,
  mustBe,
  Numeric,
} from "garn-validator";

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
    [GeneratorFunction, () => {}],
    [Function, function* () {}],
    [Function, async () => {}],
    [Promise, { then() {}, catch() {} }],
    [Promise, Promise],
    [Object, []],
    [Number, "2"],
    [String, 2],
  ])("isValid(%p)(%p) return false", (a, b) => {
    expect(isValid(a)(b)).toBe(false);
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
      new TypeValidationError(
        'At path /num "2" do not match constructor Number'
      ),
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
        [new TypeValidationError("2 do not match validator v=>v>100")],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeValidationError("2 do not match constructor String"),
          new TypeValidationError("2 do not match validator v=>v>100"),
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
        [
          new TypeValidationError(
            'At path /num "2" do not match constructor Number'
          ),
        ],
      ],
      [
        { num: Number, str: String },
        { num: "2", str: null },
        [
          new TypeValidationError(
            'At path /num "2" do not match constructor Number'
          ),
          new TypeValidationError(
            "At path /str null do not match constructor String"
          ),
        ],
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
        [
          new TypeValidationError(
            'At path /obj/num "2" do not match constructor Number'
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
          new TypeValidationError(
            'At path /obj/num "2" do not match constructor Number'
          ),
          new TypeValidationError(
            "At path /obj/str null do not match constructor String"
          ),
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
        new TypeValidationError(
          "At path /noValidKey 1 do not match validator ()=>false"
        ),
        new TypeValidationError(
          'At path /name "Garn" do not match regex /^[a-z]{3,}$/'
        ),
        new TypeValidationError(
          "At path /age 18 do not match validator age=>age>18"
        ),
        new EvalError("unexpected key"),
        new TypeValidationError(
          'At path /car/brand "Honda" do not match primitive "honda"'
        ),
        new TypeValidationError(
          'At path /car/brand "Honda" do not match primitive "toyota"'
        ),
        new TypeValidationError(
          'At path /car/date "1982-01-01" do not match constructor Date'
        ),
        new TypeValidationError(
          "At path /car/country/name undefined do not match constructor String"
        ),

        new TypeValidationError(
          "At path /optional false do not match primitive true"
        ),
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
        new TypeValidationError(
          "At path /x true do not match constructor Number"
        ),
        new TypeValidationError(
          "At path /y 1 do not match constructor Boolean"
        ),
        new TypeValidationError(
          "At path /z undefined do not match constructor Function"
        ),
      ]);
    });
  });
});

describe("isValidOrThrowAll ", () => {
  jest.spyOn(globalThis.console, "error");
  jest.spyOn(globalThis.console, "group");
  jest.spyOn(globalThis.console, "groupEnd");

  test("should throw AggregateError with all errors", () => {
    try {
      isValidOrThrowAll(Number, String)(true);
      throw "ups";
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
    }
    try {
      isValidOrThrowAll(Number, String)(true);

      throw "ups";
    } catch (error) {
      expect(error).not.toBeInstanceOf(TypeValidationError);
    }
  });
  test("should throw 2 errors", () => {
    try {
      isValidOrThrowAll(Number, Boolean, String)(true);
    } catch (error) {
      expect(error.errors.length).toBe(2);
    }
  });
});
describe("isValidOrLogAll", () => {
  test("should return true or false", () => {
    jest.spyOn(globalThis.console, "error");
    jest.spyOn(globalThis.console, "group");
    jest.spyOn(globalThis.console, "groupEnd");
    expect(isValidOrLogAll(Number, String)(true)).toBe(false);

    expect(isValidOrLogAll(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    jest.spyOn(globalThis.console, "error");
    jest.spyOn(globalThis.console, "group");
    jest.spyOn(globalThis.console, "groupEnd");

    isValidOrLogAll(Number, Boolean, String)(true);
    expect(globalThis.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    jest.spyOn(globalThis.console, "error");
    jest.spyOn(globalThis.console, "group");
    jest.spyOn(globalThis.console, "groupEnd");
    isValidOrLogAll(Number, Boolean, String)(true);

    expect(globalThis.console.error).toHaveBeenCalledWith(
      "true do not match constructor Number"
    );
    expect(globalThis.console.error).toHaveBeenCalledWith(
      "true do not match constructor String"
    );
  });
  test("should log meaningful errors in schemas", () => {
    jest.spyOn(globalThis.console, "error");
    jest.spyOn(globalThis.console, "group");
    jest.spyOn(globalThis.console, "groupEnd");
    isValidOrLogAll(
      { x: Number },
      { y: Boolean },
      { z: String },
      {
        h() {
          throw "ups";
        },
      }
    )({ x: 1, y: 2, z: 3 });

    expect(globalThis.console.error).toHaveBeenCalledWith(
      "At path /y 2 do not match constructor Boolean"
    );
    expect(globalThis.console.error).toHaveBeenCalledWith("ups");
  });
});

describe("mustBe", () => {
  test("should return the value", () => {
    expect(mustBe(Number)(2)).toBe(2);
    expect(mustBe(String)("3")).toBe("3");
  });
  test("should throw", () => {
    expect(() => {
      mustBe(Number)("");
    }).toThrow();
  });
  describe("mustBe().or()", () => {
    test("should return default value", () => {
      expect(mustBe(Number).or(0)(null)).toBe(0);
    });
    test("should return value if not fails", () => {
      expect(mustBe(Number).or(0)(2)).toBe(2);
    });
    test("should apply transformer if fails", () => {
      expect(mustBe(Number).or((val) => Number(val))("2")).toBe(2);
    });
    test("should fail if OR fails", () => {
      const NumberOrZero = mustBe(Number).or(() => {
        throw new Error("ups");
      });
      expect(() => {
        mustBe(NumberOrZero)(null);
      }).toThrow("ups");
    });

    test("should stop collecting errors if OR fails", () => {
      jest.spyOn(globalThis.console, "log");

      const NumberOrZero = mustBe(Number).or(() => {
        throw new Error("ups");
      });
      try {
        mustBe(NumberOrZero, () => console.log("i run?"))(null);
      } catch {}

      expect(globalThis.console.log).not.toHaveBeenCalled();
    });

    test("should work nested", () => {
      const NumberOrZero = mustBe(Numeric).or(0);
      const res = mustBe({ a: NumberOrZero })({ a: null });
      expect(res).toEqual({ a: 0 });
    });
    test("should work nested with regex and optional keys", () => {
      const NumberOrZero = mustBe(Number).or(0);
      const res = mustBe({
        a: NumberOrZero,
        [/b/]: NumberOrZero,
        c$: NumberOrZero,
        d$: NumberOrZero,
      })({
        a: null,
        b: null,
        //  c: undefined,
        d: "null",
      });
      expect(res).toEqual({ a: 0, b: 0, d: 0 });
    });
    test("should work nested deeper", () => {
      const NumberOrZero = mustBe(Number).or(0);
      const res = mustBe({
        a: NumberOrZero,
        b: {
          c: NumberOrZero,
        },
      })({
        a: null,
        b: {
          c: null,
        },
      });
      expect(res).toEqual({
        a: 0,
        b: {
          c: 0,
        },
      });
    });

    test("should not modify original object", () => {
      let obj = {
        a: null,
      };
      const NumberOrZero = mustBe(Number).or(0);
      let newObject = mustBe({ a: NumberOrZero })(obj);
      expect(obj.a).not.toBe(newObject.a);
      expect(newObject).not.toBe(obj);
    });
    test.skip("should not modify original object", () => {
      let obj = {
        a: {b: null},
      };
      const NumberOrZero = mustBe(Number).or(0);
      let newObject = mustBe({ a: {b:NumberOrZero} })(obj);
      expect(obj.a.b).not.toBe(newObject.a.b);
      expect(newObject).not.toBe(obj);
    });
    test('should inherit conf', () => {
      const NumberOrZero = mustBe(Number).or(0);
      expect(isValid(NumberOrZero)(null)).toBe(false)

    });
  });
  describe("mustBe().transform()", () => {
    test("should apply transform always", () => {
      expect(mustBe(Numeric).transform((val) => Number(val) * 2)("2")).toBe(4);
    });
    test.skip("should apply transform twice", () => {
      expect(
        mustBe(Number)
          .transform((val) => val + 2)
          .transform((val) => val + 7)(0)
      ).toBe(4);
    });
    test("should apply OR first and later transform", () => {
      expect(
        mustBe(Numeric)
          .or(1)
          .transform((val) => Number(val) * 2)(null)
      ).toBe(2);
    });
    test("should apply OR first and later transform", () => {
      expect(
        mustBe(Numeric)
          .or(1)
          .transform((val) => Number(val) * 2)(null)
      ).toBe(2);
    });
    test("should apply transform even if not OR is applied", () => {
      expect(
        mustBe(Numeric)
          .or(1)
          .transform((val) => Number(val) * 2)("2")
      ).toBe(4);
    });
  });
});
