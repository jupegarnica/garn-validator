# garn-validator

Runtime type validator for vanilla JS without dependencies

<!-- [![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator) -->

## Get started

```bash
npm install garn-validator

# or

yarn add garn-validator

```

### Use


```js
import check from 'garn-validator';
const obj = {
  a: 1,
  b: 2
}

check({a:Number,b:Number})(obj);  // not throw, all ok

check({c:1})(obj);  // will throw

```

## Roadmap
- [x] check value by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] custom prop validation with a function (value, propName, allProps)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] arrayOf & objectOf examples
- [ ] global and local settings to change how to warn invalid prop (throw error , log error or custom log)



## All it can do

```jsx
import check from "./index";

describe("check strings", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)(``);
    }).not.toThrow();

    expect(() => {
      check(Number)("a string");
    }).toThrow();
  });
  test("check with primitives", () => {
    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("not")("a string");
    }).toThrow();
  });
  test("check with Regex", () => {
    expect(() => {
      check(/string/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/(string)$/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/^(string)/)("a string");
    }).toThrow();
  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val.length === 8)("a string");
    }).not.toThrow();

    expect(() => {
      check((val) => val.includes("str"))("a string");
    }).not.toThrow();
  });
});

describe("check numbers", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)(33);
    }).toThrow();

    expect(() => {
      check(Number)(33);
    }).not.toThrow();
    expect(() => {
      check(Number)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number)(Infinity);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(1);
    }).toThrow();
  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      check((val) => val < 0)(33);
    }).toThrow();
  });
});

describe("check with enums", () => {
  test("optional", () => {
    expect(() => {
      check([undefined, 0])(undefined);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(0);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(null);
    }).toThrow();
  });
  test("constructors", () => {
    expect(() => {
      check([String, Number])("12");
    }).not.toThrow();
    expect(() => {
      check([String, Number])(12);
    }).not.toThrow();
     expect(() => {
       check([String, Number])(true);
     }).toThrow();
  });
});
describe("check objects", () => {
  const value = {
    a: 1,
  };
  test("check with constructor", () => {
    expect(() => {
      check({ a: Number })(value); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      check({ a: Number, c: Number })(value);
    }).toThrow();
    expect(() => {
      check({ a: Number, c: undefined })(value);
    }).not.toThrow();
  });

  test("check with primitives", () => {
    expect(() => {
      check({ a: 2 })(value);
    }).toThrow();
    expect(() => {
      check({ a: 1 })(value);
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      check({ a: (val) => val < 0 })(value);
    }).toThrow();
    expect(() => {
      check({ a: (val) => val > 0 })(value);
    }).not.toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      check({ [/[a-z]/]: Number })(value);
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: 0 })(value);
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      check({ [/[A-Z]/]: Number })(value);
    }).not.toThrow();
  });
});

describe("check falsy", () => {
  test("check", () => {
    expect(() => {
      check(null)(null);
    }).not.toThrow();

    expect(() => {
      check(null)("null");
    }).toThrow();

    expect(() => {
      check(undefined)(undefined);
    }).not.toThrow();

    expect(() => {
      check(undefined)("undefined");
    }).toThrow();
  });
});

```