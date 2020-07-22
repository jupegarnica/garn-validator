import check,{isValid} from 'garn-validator'

describe('Should work using require commonjs',()=> {
  test('default export works', () => {
    expect(check(Number)(2)).toBe(true);

  });
  test('named exports should work', () => {
    expect(isValid(Number)(2)).toBe(true);

  });
})
