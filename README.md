# Garn-validator

Runtime type validator for vanilla JS without dependencies

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

## Get started

```bash
npm install garn-validator

# or

yarn add garn-validator

```

### Use

```js
import check from 'garn-validator';

//check primitives with built-in constructors
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
### Composable

```js

const isValidNumber = check(Number)
isValidNumber(2);

const isPositive = check(v => v > 0);
isPositive(2)

```
### Custom behavior

```js
const isValidOrSendReport =  setOnError((err) => {
  fetch('//myReportServer.com/report', {
    method: 'POST',
    body: JSON.stringify(err),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  throw new TypeError(err)
});

isValidOrSendReport(Number)('3') // will send error

```

### built-in behaviors

There are 3 behaviors you can import

```js
export const isValid = setOnError(() => false);
export const isValidOrLog = setOnError((err) => console.error(err));
export const isValidOrThrow = setOnError(throwOnError);
export default isValidOrThrow;

```


## Roadmap
- [x] check value by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] custom type validation with a function (value, rootValue)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] setting to change behavior (throw error , log error or custom log)
- [ ] arrayOf & objectOf examples



## All it can do
```jsx
asdasda
```