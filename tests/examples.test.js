import isValidOrThrow, { hasErrors, isValid } from "garn-validator";

describe("check with constructors", () => {
  test("should work", () => {
    expect(() => {
      isValidOrThrow(RegExp)(/\s/);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(Array)([]);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(RangeError)(new RangeError());
    }).not.toThrow();

    expect(() => {
      class MyClass {}
      isValidOrThrow(MyClass)(new MyClass());
    }).not.toThrow();
  });
});


describe("check with custom validator", () => {
  test("cyou can return true or false", () => {
    expect(() => {
      isValidOrThrow(() => true)(33);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("you can throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
describe("check with enums", () => {
  test("Should be used as OR operator", () => {
    expect(() => {
      isValidOrThrow([1, 0])(1);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow([Number, String])(0);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow([undefined, 0])(null);
    }).toThrow();
  });
});

describe("check objects against a schema", () => {
  test("check with constructor", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();

    expect(() => {
      isValidOrThrow({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      isValidOrThrow({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with custom function", () => {
    expect(() => {
      isValidOrThrow({ a: (val) => val < 0 })({
        a: 1,
      });
    }).toThrow();
  });
  test("check with custom function against the root object", () => {
    expect(() => {
      isValidOrThrow({ x: (val, rootObject, keyName) => rootObject.y === val })({
        x: "x",
        y: "x",
      });
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({
        max: (val, rootObject, keyName) => val > rootObject.min,
        min: (val, rootObject, keyName) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  describe("match key with regex", () => {
    test("should match all keys matching the regex", () => {
      expect(() => {
        isValidOrThrow({ [/[a-z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test("should throw", () => {
      expect(() => {
        isValidOrThrow({ [/[a-z]/]: 0 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });

    test("should throw only if the key is matched", () => {
      expect(() => {
        isValidOrThrow({ [/[A-Z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test("not throws, all lowercase keys are numbers", () => {
      expect(() => {
        isValidOrThrow({ [/[a-z]/]: Number, a: 1 })({
          a: 1,
          b: 2,
        }); //
      }).not.toThrow();
    });

    test("should throw (a is not 2) ", () => {
      expect(() => {
        isValidOrThrow({ [/[a-z]/]: Number, a: 2 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });
  });
});

describe("multiple validations in series", () => {
  test("should pass every validation as an AND operator", () => {
    expect(isValid(Number, String)(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(
      isValid(
        (val) => val > 0,
        Number,
        2,
        (val) => val === 2
      )(2)
    ).toBe(true);
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
describe("collect all Error", () => {
  test("should return null", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: 2, str: "str" })
    ).toBe(null);
  });
  test("should return array of errors", () => {
    expect(
      hasErrors({ num: Number, str: String })( { num: "2", str: "str" })
    ).toEqual([
      new TypeError('on path /num value "2" do not match type "Number"'),
    ]);
  });

});
describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      isValidOrThrow({ [/\d/]: Number })([1, 2]);
    }).not.toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      isValidOrThrow({ [/\w/]: Number })({ a: 1 });
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
  test("check big object", () => {
    expect(() => {
      isValidOrThrow(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
});

describe("composable", () => {
  test("with complex schema", () => {
    const isValidPassword = isValidOrThrow(
      String,
      (str) => str.length >= 8,
      /[a-z]/,
      /[A-Z]/,
      /[0-9]/,
      /[-_/!"·$%&/()]/
    );
    const isValidName = isValidOrThrow(String, (name) => name.length >= 3);
    const isValidAge = isValidOrThrow(
      Number,
      (age) => age > 18,
      (age) => age < 40
    );

    const validUser = isValidOrThrow({
      name: isValidName,
      age: isValidAge,
      password: isValidPassword,
    });

    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "12345aA-",
      });
    }).not.toThrow();
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "1234",
      });
    }).toThrow();
  });
});
