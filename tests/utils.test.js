import {
  isValidOrThrow,
  arrayOf,
  objectOf,
  isValidOrThrowAll,
  hasErrors,
  not,
  or,
  and,
  Integer,
  Numeric,
  hasDecimals,
  Odd,
  Even,
  Finite,
  Positive,
  Negative,
  SafeInteger,
  SafeNumber,
} from "garn-validator";

describe("utils", () => {
  test("ArrayOf", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2, "3"]);
    }).toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))(["1", 2, 3]);
    }).toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1, b: "b" });
    }).toThrow();
  });

  describe("not()", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(not(Number))(null);
        isValidOrThrow(not(Number))("2");
        isValidOrThrow(not(Number))(1n);
        isValidOrThrow(not(Number))({});
        isValidOrThrow(not(Number))([]);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(not(Number))(2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(not(Number))(2e2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(not(Number))(0o11);
      }).toThrow();
      expect(() => {
        isValidOrThrow(not(Number))(0xff);
      }).toThrow();
    });

    test("should work in series", () => {
      expect(() => {
        isValidOrThrow(
          not(
            (v) => v > 0,
            (v) => v < 10
          )
        )(20);
      }).not.toThrow();
    });
    test("should throw in series", () => {
      expect(() => {
        isValidOrThrow(
          not(
            (v) => v > 0,
            (v) => v < 10
          )
        )(2);
      }).toThrow();
    });
    test("should work in enum", () => {
      expect(() => {
        isValidOrThrow(not([String, Number]))(null);
        isValidOrThrow(not([String, Number]))([]);
      }).not.toThrow();
    });
    test("should throw in enum", () => {
      expect(() => {
        isValidOrThrow(not([String, Number]))(2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(not([String, Number]))("null");
      }).toThrow();
    });
    test("should work in schema", () => {
      expect(() => {
        isValidOrThrow(not({ a: Number }))({ a: "a" });
      }).not.toThrow();
    });
    test("should throw in schema", () => {
      expect(() => {
        isValidOrThrow(not({ a: Number }))({ a: 1 });
      }).toThrow();
    });
    test("should work a doble negation", () => {
      expect(() => {
        isValidOrThrow(
          not(
            not(
              (v) => v > 0,
              (v) => v < 10
            )
          )
        )(2);
      }).not.toThrow();
    });
    test("should throw a doble negation", () => {
      expect(() => {
        isValidOrThrow(
          not(
            not(
              (v) => v > 0,
              (v) => v < 10
            )
          )
        )(20);
      }).toThrow();
    });
  });

  describe("or()", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(or(Number, String))(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(or(Number, String))(null);
      }).toThrow();
    });
  });
  describe("and()", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(
          and(
            (v) => v > 0,
            (v) => v < 10
          )
        )(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(
          and(
            (v) => v > 0,
            (v) => v < 10
          )
        )(20);
      }).toThrow();
    });
  });
  describe("Integer", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Integer)(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Integer)(2.2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Integer)("2");
      }).toThrow();
    });
  });
  describe("Numeric", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Numeric)(2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Numeric)("2");
        isValidOrThrow(Numeric)("2e10");
        isValidOrThrow(Numeric)("0b111");
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Numeric)(2n);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Numeric)(Infinity);
        isValidOrThrow(Numeric)("Infinity");
      }).not.toThrow();
    });

    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Numeric)(NaN);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Numeric)(null);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Numeric)("infinity");
      }).toThrow();
      expect(() => {
        isValidOrThrow(Numeric)("x2e1");
      }).toThrow();
    });
  });
  describe("hasDecimals", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(hasDecimals)(2.2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(hasDecimals)(2.2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(hasDecimals)("2.2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(hasDecimals)(2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(hasDecimals)("2");
      }).toThrow();
    });
  });
  describe("Finite", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Finite)(3);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Finite)(-3);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Finite)(-3n);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Finite)("12");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Finite)(Infinity);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Finite)(-Infinity);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Finite)(null);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Finite)(NaN);
      }).toThrow();
    });
  });
  describe("Odd", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Odd)(3);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Odd)(-3);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Odd)(-3n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Odd)(3.1);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Odd)(-2);
      }).toThrow();
    });
  });
  describe("Even", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Even)(2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Even)(0);
        isValidOrThrow(Even)(-2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Even)(-4n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Even)(2.1);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Even)(-0.0001);
      }).toThrow();
    });
  });
  describe("Positive", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Positive)(2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Positive)(+0.0000000000001);
        isValidOrThrow(Positive)(Infinity);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Positive)(4n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Positive)(-2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Positive)(0);
      }).toThrow();
    });
  });
  describe("Negative", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(Negative)(-2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Negative)(-0.0000000000001);
        isValidOrThrow(Negative)(-Infinity);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(Negative)(-4n);
        isValidOrThrow(Negative)("-2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(Negative)(2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Negative)(null);
      }).toThrow();
      expect(() => {
        isValidOrThrow(Negative)(0);
      }).toThrow();
    });
  });
  describe("SafeInteger", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(SafeInteger)(-2);
      }).not.toThrow();

      expect(() => {
        isValidOrThrow(SafeInteger)(Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(SafeInteger)(-Infinity);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)(null);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)(Infinity);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)("-2");
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)(0.2);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)(-0.0000000000001);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeInteger)(Number.MAX_SAFE_INTEGER + 1);
      }).toThrow();
    });
  });
  describe("SafeNumber", () => {
    test("should work", () => {
      expect(() => {
        isValidOrThrow(SafeNumber)(-2);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(-2.000123);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(Number.MIN_SAFE_INTEGER);
      }).not.toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)("-2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        isValidOrThrow(SafeNumber)(-Infinity);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(null);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(Infinity);
      }).toThrow();

      expect(() => {
        isValidOrThrow(SafeNumber)(Number.MIN_SAFE_INTEGER - 1);
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(
          999999999999999999999999999999999999999999999999
        );
      }).toThrow();
      expect(() => {
        isValidOrThrow(SafeNumber)(Number.MAX_SAFE_INTEGER + 1);
      }).toThrow();
    });
  });
});
