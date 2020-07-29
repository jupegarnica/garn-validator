const validator = require('garn-validator/commonjs');

describe('Should work using require commonjs',()=> {
  test('default export works', () => {
    const isValidOrThrow = validator.default;
    isValidOrThrow(Number)(2);

  });
  test('named exports should work', () => {
    const isValid = validator.isValid;
    expect(isValid(Number)(2)).toBe(true);

  });
})
