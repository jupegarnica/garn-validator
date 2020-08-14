const validator = require('garn-validator');

describe('Should work using require commonjs',()=> {
  test('default export works', () => {
    const mustBe = validator.default;
    mustBe(Number)(2);

  });
  test('named exports should work', () => {
    const isValid = validator.isValid;
    expect(isValid(Number)(2)).toBe(true);

  });
})
