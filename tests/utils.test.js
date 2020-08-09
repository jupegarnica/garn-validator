import {
  isValidOrThrow,
  arrayOf,
  objectOf,
  not,
  isValidOrThrowAll,
  hasErrors,
} from "garn-validator";
import { or, and } from "../src/utils";

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

  describe('or()', () => {
    test('should work', () => {
      expect(() => {
        isValidOrThrow(or(Number, String))(2)
      }).not.toThrow();
    });
    test('should throw', () => {
      expect(() => {
        isValidOrThrow(or(Number, String))(null)
      }).toThrow();
    });
  });
  describe('and()', () => {
    test('should work', () => {
      expect(() => {
        isValidOrThrow(and(v => v > 0, v => v < 10))(2)
      }).not.toThrow();
    });
    test('should throw', () => {
      expect(() => {
        isValidOrThrow(and(v => v > 0, v => v < 10))(20)
      }).toThrow();
    });
  });
});
