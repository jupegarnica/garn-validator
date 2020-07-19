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
// import(use.test.js)
```