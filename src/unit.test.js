import {
  isType,
  isPrimitive,
  isConstructor,
  isValidType,
  isNormalFunction,
} from './index';

describe('test type by constructor', () => {
  test('should return true for basic JS types', () => {
    expect(isType(RegExp)(/regexp/)).toBe(true);
    expect(isType(RegExp)(new RegExp('foo'))).toBe(true);

    expect(isType(Object)({ a: 1 })).toBe(true);
    expect(isType(Object)(new Object({ b: 2 }))).toBe(true);

    expect(isType(Boolean)(true)).toBe(true);
    expect(isType(Boolean)(false)).toBe(true);

    expect(isType(String)('xs')).toBe(true);
    expect(isType(String)('')).toBe(true);
    expect(isType(String)('')).toBe(true);
    expect(isType(String)(``)).toBe(true);

    expect(isType(Number)(1)).toBe(true);
    expect(isType(Number)(NaN)).toBe(true);
    expect(isType(Number)(Infinity)).toBe(true);
    expect(isType(Number)(0.34)).toBe(true);
    expect(isType(Number)(3.1e12)).toBe(true);

    expect(isType(Array)([1, 2])).toBe(true);
    expect(isType(Array)(new Array(1, 2))).toBe(true);
    expect(isType(ArrayBuffer)(new ArrayBuffer(8))).toBe(true);

    expect(isType(Symbol)( Symbol())).toBe(true);

    expect(isType(Map)(new Map())).toBe(true);
    expect(isType(WeakMap)(new WeakMap())).toBe(true);
    expect(isType(Set)(new Set())).toBe(true);
    expect(isType(WeakSet)(new WeakSet())).toBe(true);

    // not yet supported in jsdom
    // expect(isType(BigInt)(new BigInt(2))).toBe(true);
    // expect(isType(BigInt)(2n)).toBe(true);
  });

  test('should return false for built-in types', () => {
    expect(isType(Object)('{ a: 1 }')).toBe(false);

    expect(isType(Boolean)('true')).toBe(false);

    expect(isType(String)(1)).toBe(false);
    expect(isType(String)([])).toBe(false);
    expect(isType(String)({})).toBe(false);
    expect(isType(String)()).toBe(false);

    expect(isType(Number)('1')).toBe(false);
  });

  test('should recognize instance of classes', () => {
    class Car { }
    expect(isType(Car)(new Car())).toBe(true);

    class Porsche extends Car { }

    expect(isType(Car)(new Porsche())).toBe(false);

    expect(isType(Object)(new Array())).toBe(false);
  });
});

describe('isPrimitive', () => {
  test(' should recognize primitive types', () => {
    expect(isPrimitive('hola')).toBe(true);
    expect(isPrimitive(1)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
    expect(isPrimitive(NaN)).toBe(true);

    expect(isPrimitive(undefined)).toBe(true);
    expect(isPrimitive(null)).toBe(true);

    expect(isPrimitive(Symbol())).toBe(true);

    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive(/regex/)).toBe(false);
    expect(isPrimitive(() => { })).toBe(false);
    expect(isPrimitive([])).toBe(false);
  });
});

describe('isConstructor', () => {
  test('should detect if a value can be instantiated with new', () => {
    expect(isConstructor(Object)).toBe(true);
    expect(isConstructor(Array)).toBe(true);
    expect(isConstructor(console)).toBe(false);
    expect(isConstructor(12)).toBe(false);
    expect(isConstructor(() => { })).toBe(false);
    expect(isConstructor(function name() { })).toBe(false);
    const fn = () => { };
    expect(isConstructor(fn)).toBe(false);
  });
});

describe('is normal function', () => {
  test('should detect if a function is anonymous or his name starts with lowercase (not a class)', () => {
    expect(isNormalFunction(Object)).toBe(false);
    expect(isNormalFunction(() => { })).toBe(true);
    expect(isNormalFunction(function name() { })).toBe(true);
    expect(isNormalFunction(function () { })).toBe(true);
    expect(isNormalFunction('asdasd')).toBe(false);
    expect(isNormalFunction(1)).toBe(false);
  });
});

describe('is Valid type', () => {
  test('should check RegExp', () => {
    expect(isValidType(/.ola/, 'hola')).toBe(true);
    expect(isValidType(/.ola/, 'sola')).toBe(true);
    expect(isValidType(/.ola/, 'ola')).toBe(false);

  })

  test('should work for constructors', () => {
    expect(isValidType(String, 'a')).toBe(true);
    expect(isValidType(String, 1)).toBe(false);
    expect(isValidType(RegExp, /12/)).toBe(true);
  });
  test('should work for primitives', () => {
    expect(isValidType('a', 'a')).toBe(true);
    expect(isValidType('a', `a${''}`)).toBe(true);

    expect(isValidType('a', 'b')).toBe(false);

    expect(isValidType(1.0, 1)).toBe(true);
    expect(isValidType(2, 1)).toBe(false);

    expect(isValidType(true, true)).toBe(true);
    expect(isValidType(undefined, undefined)).toBe(true);
    expect(isValidType(null, null)).toBe(true);
  });
  test('should work for enums of constructors', () => {
    expect(isValidType([String, Function], 'a')).toBe(true);
    expect(isValidType([String, Function], 1)).toBe(false);
    expect(isValidType([String, Object], [])).toBe(false);
  });
  test('should work for enums of primitives', () => {
    expect(isValidType(['b', 'a'], 'a')).toBe(true);
    expect(isValidType(['b', 'a'], 'c')).toBe(false);
    expect(isValidType([undefined, String], 'c')).toBe(true);
    expect(isValidType([undefined, String], undefined)).toBe(true);
    expect(isValidType([undefined, Number], 'c')).toBe(false);
  });
  test('should work for shapes', () => {
    expect(isValidType({ a: Number }, { a: 1 })).toBe(true);
    expect(isValidType({ a: Number }, { a: 'a' })).toBe(false);

    expect(isValidType({ a: [Number, String] }, { a: 'a' })).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, 'b'],
        },
        { a: 'a' },
      ),
    ).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, 'b'],
        },
        { a: 'a', b: 'b' },
      ),
    ).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, 'b'],
        },
        { a: 'a', b: 'c' },
      ),
    ).toBe(false);
  });
  test('should work for custom validators functions', () => {
    expect(isValidType(value => value > 5, 6)).toBe(true);
    expect(isValidType(value => value === 5, 6)).toBe(false);

    expect(
      isValidType(
        (value, propName, props) => propName === value,
        6,
        { a: 'a' },
        'a',
      ),
    ).toBe(false);
  });
  test('should use a camelCase function or anonymous', () => {
    function validator(v) {
      return true;
    }
    function Validator(v) {
      return true;
    }
    expect(isValidType(validator, 3)).toBe(true);
    expect(isValidType(Validator, 3)).toBe(false);
  });

  test('should throw', () => {
    expect(() => {
      isValidType(() => {
        throw 'asd';
      }, 6);
    }).toThrow();
  });
  test('should throw custom message', () => {
    expect(() => {
      isValidType(value => {
        if (value > 5) {
          throw 'must be greater than 5';
        }
      }, 6);
    }).toThrow('must be greater than 5');
  });

  test('should throw custom Error', () => {
    expect(() => {
      isValidType(value => {
        if (value > 5) {
          throw new Error('must be greater than 5');
        }
      }, 6);
    }).toThrow('must be greater than 5');
  });
});
