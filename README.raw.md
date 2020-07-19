# check-type

Runtime type validator for vanilla JS without dependencies

<!-- [![npm version](https://badge.fury.io/js/check-type.svg)](https://www.npmjs.com/package/check-type) -->

## Get started

```bash
npm install check-type

# or

yarn add check-type

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
// import(use.test.js)
```