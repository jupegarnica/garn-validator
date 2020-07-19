import check from './index';

describe('check strings', () => {
  test('check with constructor', () => {

    expect(() => {
      check(String)('a string');
    }).not.toThrow();

    expect(() => {
      check(String)('');
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)(``);
    }).not.toThrow();

    expect(() => {
      check(Number)('a string');
    }).toThrow();
  });
  test('check with Regex', () => {

    expect(() => {
      check(/string/)('a string');
    }).not.toThrow();

    expect(() => {
      check(/(string)$/)('a string');
    }).not.toThrow();

    expect(() => {
      check(/^(string)/)('a string');
    }).toThrow();

  });
  test('check with custom validator', () => {

    expect(() => {
      check(val => val.length === 8)('a string');
    }).not.toThrow();

    expect(() => {
      check(val => val.length === 5)('a string');
    }).toThrow();


  });
})

describe('check numbers', () => {
  test('check with constructor', () => {

    expect(() => {
      check(String)(33);
    }).toThrow();

    expect(() => {
      check(Number)(33);
    }).not.toThrow();
  });
  test('check with custom validator', () => {

    expect(() => {
      check(val => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      check(val => val < 0)(33);
    }).toThrow();
  });
})

describe('check falsy', () => {
  test('check', () => {

    expect(() => {
      check(null)(null);
    }).not.toThrow();

    expect(() => {
      check(null)('null');
    }).toThrow();

    expect(() => {
      check(undefined)(undefined);
    }).not.toThrow();

    expect(() => {
      check(undefined)('undefined');
    }).toThrow();
  });

})
