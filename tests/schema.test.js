import mustBe, { isValid, objectOf, arrayOf } from "garn-validator";


describe("check schema", () => {
  test("check with constructor", () => {
    expect(() => {
      mustBe({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      mustBe({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      mustBe({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      mustBe({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      mustBe({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with primitives", () => {
    expect(() => {
      mustBe({ a: 2 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      mustBe({ a: 1 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      mustBe({ a: (val) => val < 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      mustBe({ a: (val) => val > 0 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    let obj = { x: "x", y: "x" };
    expect(() => {
      mustBe({ x: (val, rootObject) => rootObject.y === val })(obj);
    }).not.toThrow();

    expect(() => {
      mustBe({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();
    expect(() => {
      mustBe({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: 10,
      });
    }).toThrow();

    expect(() => {
      mustBe({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();
    expect(() => {
      mustBe({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      mustBe({ [/[a-z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      mustBe({ [/[a-z]/]: 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      mustBe({ [/[A-Z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      mustBe({ [/[a-z]/]: Number, a: 1 })({
        a: 1,
        b: 2,
      }); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      mustBe({ [/[a-z]/]: Number, a: 2 })({
        a: 1,
        b: 2,
      }); // will throw (a is not 2)
    }).toThrow();
  });
  test("match key with complex regex", () => {
    expect(() => {
      mustBe({
        [/\d/]:String
      })({
        a: 1,
        '2': '2',
      });
    }).not.toThrow();
    const colorHex = /#(?:[a-f\d]{3}){1,2}\b|rgb\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){2}\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)|\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%(?:\s*,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%){2})\s*\)|hsl\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2}\)|(?:rgba\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){3}|(?:\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*,){3})|hsla\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2},)\s*0*(?:1|0(?:\.\d+)?)\s*\)/ig

    expect(() => {
      mustBe({
        [colorHex]:String,
      })({
        '#ff22AA': 2,
      });
    }).toThrow();
    expect(() => {
      mustBe({
        [colorHex]:Number,
      })({
        '#ff22aa': 2,
        '#ff22AA': 2,
        '#ffaaZZ': '2',
      });
    }).not.toThrow();

  });
});

describe("check objects recursively", () => {
  const obj = {
    a: 1,
    deep: {
      x: "x",
      deeper: {
        y: "y",
        method: (v) => console.log(v),
        user: {
          name: "garn",
          city: {
            name: "narnia",
            cp: 46001,
            country: "ESP",
          },
        },
      },
    },
  };
  const schema = {
    a: Number,
    deep: {
      x: (val, root, key) => key === val,
      deeper: {
        y: "y",
        method: Function,
        user: {
          name: String,
          city: {
            name: (v) => v.length > 3,
            cp: [Number, String],
            country: ["ESP", "UK"],
          },
        },
      },
    },
  };
  test("should work", () => {
    expect(() => {
      mustBe(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      mustBe({ ...schema, a: String })(obj);
    }).toThrow();
  });
});

describe("optional keys", () => {
  test("if the key exists should be check", () => {
    expect(isValid({ a$: Number })({ a: 1 })).toBe(true);
    expect(isValid({ a$: String })({ a: 1 })).toBe(false);
  });

  test("if the key doesn't exists should be valid", () => {
    expect(isValid({ a$: Number })({})).toBe(true);
  });
  test("if the key is null or undefined should be valid", () => {
    expect(isValid({ a$: Number })({a:undefined})).toBe(true);
    expect(isValid({ a$: Number })({a:null})).toBe(true);
  });
  test("should work ending with $ or ?", () => {
    expect(isValid({ "a?": Number })({ a: 1 })).toBe(true);
    expect(isValid({ "a?": String })({ a: 1 })).toBe(false);
  });

  test("complex example should work", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: 1,
        b: 2,
        c: true,
      })
    ).toBe(true);
  });
  test("complex example should fail", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: true,
        b: 2,
        c: true,
      })
    ).toBe(false);
  });
});
describe("special cases", () => {
  test("required keys are more important than optional", () => {
    expect(() => {
      mustBe({
        a: String,
        a$: Number,
      })({
        a: "2",
      });
    }).not.toThrow();
  });
  test("required regExp keys do not check optional or required", () => {
    expect(() => {
      mustBe({
        a: String,
        a$: Number,
        [/a/]: Boolean,
      })({
        a: "2",
      });
    }).not.toThrow();
    expect(() => {
      mustBe({
        a: String,
        a$: Number,
        [/a/]: Boolean,
      })({
        a: "2",
        aa: 12,
      });
    }).toThrow();
  });
});
describe('check Array against an schema', () => {
  test("should check an Array as an object", () => {
    expect(() => {
      mustBe({
        0: Number,
        1: Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      mustBe({
        "/d/": Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      mustBe({
        0: String,
      })([1, 2]);
    }).toThrow();
  });
});
describe("check String against an schema", () => {
  test("should check an string as an object", () => {
    expect(() => {
      mustBe({
        0: /[lL]/,
        1: (char) => char === "o",
      })("Lorem");
    }).not.toThrow();
    expect(() => {
      mustBe({
        0: /[lL]/,
        1: (char) => char === "o",
        2: "R",
      })("Lorem");
    }).toThrow();
    expect(() => {
      mustBe({
        99: "a",
      })("Lorem");
    }).toThrow();
  });

});

describe("check a function against an schema", () => {
  test("should check an function as an object", () => {
    let fn = function () {};
    expect(() => {
      mustBe({
        toString: Function,
      })(fn);
    }).not.toThrow();
    expect(() => {
      mustBe({
        toString: Boolean,
      })(fn);
    }).toThrow();
  });

});

describe("arrayOf", () => {
  test("should work", () => {
    expect(() => {
      mustBe(arrayOf(Number))([1, 2, 3]);
    }).not.toThrow();
    expect(() => {
      mustBe(arrayOf((n) => n > 0))([1, 2, 3]);
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      mustBe(arrayOf(Number))([1, 2, "3"]);
    }).toThrow();
    expect(() => {
      mustBe(arrayOf((n) => n > 0))([1, 2, -3]);
    }).toThrow();

    expect(() => {
      mustBe(arrayOf(Number))({ 0: 1, 1: 2 });
    }).toThrow();
  });
});

describe("objectOf", () => {
  test("should work", () => {
    expect(() => {
      mustBe(objectOf(Number))({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      mustBe(objectOf((n) => n > 0))({ a: 1, b: 2 });
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      mustBe(objectOf(Number))({ a: 1, b: "2" });
    }).toThrow();
    expect(() => {
      mustBe(objectOf((n) => n > 0))({ a: 1, b: -2 });
    }).toThrow();
  });
});

describe("should check instances", () => {
  class MyClass {
    constructor() {
      this.date = new Date();
      this.name = "Garn";
      this.valid = false;
    }
  }
  test("should work", () => {
    expect(() => {
      mustBe({
        date: Date,
        name: String,
        valid: Boolean,
      })(new MyClass());
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      mustBe({
        date: Date,
        name: String,
        valid: Number,
      })(new MyClass());
    }).toThrow();
    expect(() => {
      mustBe(Object, {
        date: Date,
        name: String,
        valid: Boolean,
      })(new MyClass());
    }).toThrow();
  });
});
