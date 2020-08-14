import mustBe,{isValid} from 'garn-validator'


describe('Should work using require commonjs',()=> {
  test('default export works', () => {
    expect(mustBe(Number)(2)).toBe(2);

  });
  test('named exports should work', () => {
    expect(isValid(Number)(2)).toBe(true);

  });
})
