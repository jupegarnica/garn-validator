import {
  mustBe,
  arrayOf,
  objectOf,
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
  insensitiveCase,
  contains,
  Lowercase,
  Uppercase,
  startsWith,
  endsWith,
  asNumber,
  noExtraKeys,
  asString,
  DateString,
  after,
  before,
  asDate,
  asDateString,
} from "garn-validator";

describe("utils", () => {
  describe("objects", () => {
    test("ArrayOf", () => {
      expect(() => {
        mustBe(arrayOf(Number))([1, 2]);
      }).not.toThrow();
      expect(() => {
        mustBe(arrayOf(Number))([1, 2, "3"]);
      }).toThrow();
      expect(() => {
        mustBe(arrayOf(Number))(["1", 2, 3]);
      }).toThrow();
    });
    test("objectOf", () => {
      expect(() => {
        mustBe(objectOf(Number))({ a: 1 });
      }).not.toThrow();
      expect(() => {
        mustBe(objectOf(Number))({ a: 1, b: "b" });
      }).toThrow();
    });
    test("noExtraKeys", () => {
      expect(() => {
        mustBe(noExtraKeys({ a: Number }))({ a: 1, b: 1 });
      }).toThrow();
      expect(() => {
        mustBe(noExtraKeys({ a: Number }))({ a: 1 });
      }).not.toThrow();
    });
  });

  describe("not()", () => {
    test("should work", () => {
      expect(() => {
        mustBe(not(Number))(null);
        mustBe(not(Number))("2");
        mustBe(not(Number))(1n);
        mustBe(not(Number))({});
        mustBe(not(Number))([]);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(not(Number))(2);
      }).toThrow();
      expect(() => {
        mustBe(not(Number))(2e2);
      }).toThrow();
      expect(() => {
        mustBe(not(Number))(0o11);
      }).toThrow();
      expect(() => {
        mustBe(not(Number))(0xff);
      }).toThrow();
    });

    test("should work in series", () => {
      expect(() => {
        mustBe(
          not(
            (v) => v > 0,
            (v) => v < 10
          )
        )(20);
      }).not.toThrow();
    });
    test("should throw in series", () => {
      expect(() => {
        mustBe(
          not(
            (v) => v > 0,
            (v) => v < 10
          )
        )(2);
      }).toThrow();
    });
    test("should work in enum", () => {
      expect(() => {
        mustBe(not([String, Number]))(null);
        mustBe(not([String, Number]))([]);
      }).not.toThrow();
    });
    test("should throw in enum", () => {
      expect(() => {
        mustBe(not([String, Number]))(2);
      }).toThrow();
      expect(() => {
        mustBe(not([String, Number]))("null");
      }).toThrow();
    });
    test("should work in schema", () => {
      expect(() => {
        mustBe(not({ a: Number }))({ a: "a" });
      }).not.toThrow();
    });
    test("should throw in schema", () => {
      expect(() => {
        mustBe(not({ a: Number }))({ a: 1 });
      }).toThrow();
    });
    test("should work a doble negation", () => {
      expect(() => {
        mustBe(
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
        mustBe(
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
        mustBe(or(Number, String))(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(or(Number, String))(null);
      }).toThrow();
    });
  });
  describe("and()", () => {
    test("should work", () => {
      expect(() => {
        mustBe(
          and(
            (v) => v > 0,
            (v) => v < 10
          )
        )(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(
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
        mustBe(Integer)(2);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Integer)(2.2);
      }).toThrow();
      expect(() => {
        mustBe(Integer)("2");
      }).toThrow();
    });
  });
  describe("Numeric", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Numeric)(2);
      }).not.toThrow();
      expect(() => {
        mustBe(Numeric)("2");
        mustBe(Numeric)("2e10");
        mustBe(Numeric)("0b111");
      }).not.toThrow();
      expect(() => {
        mustBe(Numeric)(2n);
      }).not.toThrow();
      expect(() => {
        mustBe(Numeric)(Infinity);
        mustBe(Numeric)("Infinity");
      }).not.toThrow();
    });

    test("should throw", () => {
      expect(() => {
        mustBe(Numeric)(NaN);
      }).toThrow();
      expect(() => {
        mustBe(Numeric)(null);
      }).toThrow();
      expect(() => {
        mustBe(Numeric)("infinity");
      }).toThrow();
      expect(() => {
        mustBe(Numeric)("x2e1");
      }).toThrow();
    });
  });
  describe("hasDecimals", () => {
    test("should work", () => {
      expect(() => {
        mustBe(hasDecimals)(2.2);
      }).not.toThrow();
      expect(() => {
        mustBe(hasDecimals)(2.2);
      }).not.toThrow();
      expect(() => {
        mustBe(hasDecimals)("2.2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(hasDecimals)(2);
      }).toThrow();
      expect(() => {
        mustBe(hasDecimals)("2");
      }).toThrow();
    });
  });
  describe("Finite", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Finite)(3);
      }).not.toThrow();
      expect(() => {
        mustBe(Finite)(-3);
      }).not.toThrow();
      expect(() => {
        mustBe(Finite)(-3n);
      }).not.toThrow();
      expect(() => {
        mustBe(Finite)("12");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Finite)(Infinity);
      }).toThrow();
      expect(() => {
        mustBe(Finite)(-Infinity);
      }).toThrow();
      expect(() => {
        mustBe(Finite)(null);
      }).toThrow();
      expect(() => {
        mustBe(Finite)(NaN);
      }).toThrow();
    });
  });
  describe("Odd", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Odd)(3);
      }).not.toThrow();
      expect(() => {
        mustBe(Odd)(-3);
      }).not.toThrow();
      expect(() => {
        mustBe(Odd)(-3n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Odd)(3.1);
      }).toThrow();
      expect(() => {
        mustBe(Odd)(-2);
      }).toThrow();
    });
  });
  describe("Even", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Even)(2);
      }).not.toThrow();
      expect(() => {
        mustBe(Even)(0);
        mustBe(Even)(-2);
      }).not.toThrow();
      expect(() => {
        mustBe(Even)(-4n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Even)(2.1);
      }).toThrow();
      expect(() => {
        mustBe(Even)(-0.0001);
      }).toThrow();
    });
  });
  describe("Positive", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Positive)(2);
      }).not.toThrow();
      expect(() => {
        mustBe(Positive)(+0.0000000000001);
        mustBe(Positive)(Infinity);
      }).not.toThrow();
      expect(() => {
        mustBe(Positive)(4n);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Positive)(-2);
      }).toThrow();
      expect(() => {
        mustBe(Positive)(0);
      }).toThrow();
    });
  });
  describe("Negative", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Negative)(-2);
      }).not.toThrow();
      expect(() => {
        mustBe(Negative)(-0.0000000000001);
        mustBe(Negative)(-Infinity);
      }).not.toThrow();
      expect(() => {
        mustBe(Negative)(-4n);
        mustBe(Negative)("-2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Negative)(2);
      }).toThrow();
      expect(() => {
        mustBe(Negative)(null);
      }).toThrow();
      expect(() => {
        mustBe(Negative)(0);
      }).toThrow();
    });
  });
  describe("SafeInteger", () => {
    test("should work", () => {
      expect(() => {
        mustBe(SafeInteger)(-2);
      }).not.toThrow();

      expect(() => {
        mustBe(SafeInteger)(Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(SafeInteger)(-Infinity);
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)(null);
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)(Infinity);
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)("-2");
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)(0.2);
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)(-0.0000000000001);
      }).toThrow();
      expect(() => {
        mustBe(SafeInteger)(Number.MAX_SAFE_INTEGER + 1);
      }).toThrow();
    });
  });
  describe("SafeNumber", () => {
    test("should work", () => {
      expect(() => {
        mustBe(SafeNumber)(-2);
      }).not.toThrow();
      expect(() => {
        mustBe(SafeNumber)(-2.000123);
      }).not.toThrow();
      expect(() => {
        mustBe(SafeNumber)(Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
      expect(() => {
        mustBe(SafeNumber)(Number.MIN_SAFE_INTEGER);
      }).not.toThrow();
      expect(() => {
        mustBe(SafeNumber)("-2");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(SafeNumber)(-Infinity);
      }).toThrow();
      expect(() => {
        mustBe(SafeNumber)(null);
      }).toThrow();
      expect(() => {
        mustBe(SafeNumber)(Infinity);
      }).toThrow();

      expect(() => {
        mustBe(SafeNumber)(Number.MIN_SAFE_INTEGER - 1);
      }).toThrow();
      expect(() => {
        mustBe(SafeNumber)(999999999999999999999999999999999999999999999999);
      }).toThrow();
      expect(() => {
        mustBe(SafeNumber)(Number.MAX_SAFE_INTEGER + 1);
      }).toThrow();
    });
  });
  describe("contains()", () => {
    test("should work", () => {
      expect(() => {
        mustBe(contains("ipsum"))("lorem ipsum hello");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(contains("hi"))("lorem ipsum hello");
      }).toThrow();
    });
  });
  describe("insensitiveCase()", () => {
    test("should work", () => {
      expect(() => {
        mustBe(insensitiveCase("IPSUM"))("lorem ipsum hello");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(insensitiveCase("HI"))("lorem ipsum hello");
      }).toThrow();
    });
  });
  describe("Lowercase", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Lowercase)("lorem ipsum hello 33 & $  ?");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Lowercase)("Lorem ipsum hello 33 & $  ?");
      }).toThrow();
    });
  });
  describe("Uppercase", () => {
    test("should work", () => {
      expect(() => {
        mustBe(Uppercase)("LOREM IPSUM HELLO 33 & $  ?");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(Uppercase)("Lorem ipsum hello 33 & $  ?");
      }).toThrow();
    });
  });
  describe("startsWith", () => {
    test("should work", () => {
      expect(() => {
        mustBe(startsWith("LOREM"))("LOREM IPSUM HELLO 33 & $  ?");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(startsWith("lorem"))("Lorem ipsum hello 33 & $  ?");
      }).toThrow();
    });
  });
  describe("endsWith", () => {
    test("should work", () => {
      expect(() => {
        mustBe(endsWith("HELLO"))("LOREM IPSUM HELLO");
      }).not.toThrow();
    });
    // TODO: MAKE IT WORK WITH REGEX
    test.skip("should work with regex", () => {
      expect(() => {
        mustBe(endsWith(/HELLO/))("LOREM IPSUM HELLO");
      }).not.toThrow();
    });
    test("should throw", () => {
      expect(() => {
        mustBe(endsWith("HELLO"))("Lorem ipsum hello 33");
      }).toThrow();
    });
  });
  describe("Date", () => {
    describe("DateString", () => {
      test("should work", () => {
        expect(mustBe(DateString)("2020-01-02")).toBe("2020-01-02");
        expect(mustBe(DateString)("2020-01-02 10:02:03")).toBe(
          "2020-01-02 10:02:03"
        );
      });
      test("should throw", () => {
        expect(() => {
          mustBe(DateString)("2020-13-32");
        }).toThrow();
        expect(() => {
          mustBe(DateString)(new Date("2020-1-3"));
        }).toThrow();
        expect(() => {
          mustBe(DateString)("");
        }).toThrow();
        expect(() => {
          mustBe(DateString)(null);
        }).toThrow();
      });
    });
    describe("after() and before()", () => {
      test("should work with Date instance", () => {
        const date = new Date("2020-01-02");
        expect(mustBe(after(new Date("2020-01-01")))(date)).toEqual(date);
        expect(mustBe(before(new Date("2021-01-01")))(date)).toEqual(date);
      });
      test("should work with DateString", () => {
        const date = "2020-01-02";
        expect(mustBe(after("2020-01-01"))(date)).toEqual(date);
        expect(mustBe(before("2021-01-01"))(date)).toEqual(date);
      });
      test("should fail with DateString", () => {
        const date = "2019-01-02";
        expect(() => {
          mustBe(after("2020-01-01"))(date);
        }).toThrow();

        expect(() => {
          mustBe(before("2018-01-01"))(date);
        }).toThrow();
      });
      test("should fail with Date", () => {
        const date = "2019-01-02";
        expect(() => {
          mustBe(after(new Date("2020-01-01")))(date);
        }).toThrow();

        expect(() => {
          mustBe(before(new Date("2018-01-01")))(date);
        }).toThrow();
      });
    });
  });

  describe("casting", () => {
    describe("asNumber", () => {
      test("should work", () => {
        expect(mustBe(asNumber)(2)).toBe(2);
        expect(mustBe(asNumber)(2n)).toBe(2);
        expect(mustBe(asNumber)("2")).toBe(2);
      });
      test("should throw", () => {
        expect(() => {
          mustBe(asNumber)("a2");
        }).toThrow();
        expect(() => {
          mustBe(asNumber)(null);
        }).toThrow();
        expect(() => {
          mustBe(asNumber)("2n");
        }).toThrow();
        expect(() => {
          mustBe(asNumber)(new Date());
        }).toThrow();
        expect(() => {
          mustBe(asNumber)(NaN);
        }).toThrow();
      });
    });
    describe("asString", () => {
      test("should work", () => {
        expect(mustBe(asString)(1)).toBe("1");
        expect(mustBe(asString)(1n)).toBe("1");
        expect(mustBe(asString)(0b1)).toBe("1");
        expect(mustBe(asString)("1")).toBe("1");
        expect(mustBe(asString)(true)).toBe("true");
      });
      test("should throw", () => {
        expect(() => {
          mustBe(asString)([1, 2]);
        }).toThrow();
        expect(() => {
          mustBe(asString)({ a: 2 });
        }).toThrow();
        expect(() => {
          mustBe(asString)(function () {});
        }).toThrow();
        expect(() => {
          mustBe(asString)(Symbol());
        }).toThrow();
      });
    });
    describe("asDate", () => {
      test("should work", () => {
        let str = "2020-10-31";
        expect(mustBe(asDate)(str)).toEqual(new Date(str));
        expect(mustBe(asDate)(new Date(str))).toEqual(new Date(str));
      });
      test("should throw", () => {
        let str = "2020-10-32";
        expect(() => {
          mustBe(asDate)(str);
        }).toThrow();

        expect(() => {
          mustBe(asDate)(new Date(str));
        }).toThrow();
        expect(() => {
          mustBe(asDate)(null);
        }).toThrow();
      });
    });
    describe("asDateString", () => {
      test("should work", () => {
        let str = "2020-10-31";
        expect(mustBe(asDateString)(str)).toEqual(str);
        expect(mustBe(asDateString)(new Date(str))).toMatch(
          "Sat Oct 31 2020 01:00:00"
        );
      });
      test("should work nested", () => {
        let str = "2020-10-31";
        expect(mustBe({ date: asDateString })({ date: str })).toEqual({
          date: str,
        });
      });
      test("should throw", () => {
        let str = "2020-10-32";
        expect(() => {
          mustBe(asDateString)(str);
        }).toThrow();
        expect(() => {
          mustBe(asDateString)(new Date(str));
        }).toThrow();
        expect(() => {
          mustBe(asDateString)(null);
        }).toThrow();
      });
    });
  });
});
