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


```jsx
import typed from 'typed-component';
import Component from './component';

// check constructor
const MyTypedComponent = typed({
     onClick: Function
})(Component)


```

```jsx
// check enums
const MyTypedComponent = typed({
     id: [Number, String]   // id could be a number or string
})(Component)

```

```jsx
// check enums
const MyTypedComponent = typed({
     id: [undefined, String]   // optional prop
})(Component)

```


```jsx
// check primitives
const MyTypedComponent = typed({
     genre: ['male', 'female']
})(Component)

```



```jsx
// check with custom logic
const MyTypedComponent = typed({
     age: age => age > 18
})(Component)
```


```jsx
// check string with regex
const MyTypedComponent = typed({
     url:  /^((https?):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
})(Component)
```



## Roadmap
- [x] check type by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] default props
- [x] optional prop ([undefined, String])
- [x] custom prop validation with a function (value, propName, allProps)
- [x] Check RegEx
- [x] Match prop name by RegEx
- [x] arrayOf & objectOf examples
- [ ] optional prop width ? { a?: Number}
- [ ] instanceof
- [ ] global and local settings to change how to warn invalid prop (throw error , log error or custom log)
- [ ] support to handle static propTypes and static defaultProps



## All it can do

```jsx
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

```