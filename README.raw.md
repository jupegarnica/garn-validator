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

//check primitives with built in constructors
check(Number)(2)  // not throw, all ok
check(String)(2)  // will throw


// check with regex
check(/[a-z]/)('a')  // not throw, all ok
check(/[A-Z]/)('a')  // will throw

// check with custom function
check(val => val > 0)(33)  // not throw, all ok
check(val => val > 0)(-1)  // wil throw
check(Number.isNaN)(NaN)  // not throw, all ok

// check objects
const obj = {
  a: 1,
  b: 2
}
const schema = { a:Number, b:Number }
check(schema)(obj)  // not throw, all ok

check({a:1})(obj)  // not throw, all keys on the schema are valid
check({c:1})(obj) // will throw (c is missing)

check({[/[a-z]/]:Number})({x:1,y:2,z:3, CONSTANT: 'foo'})  // not throw, all lowercase keys are numbers


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
// import(use.test.js)
```