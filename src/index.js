export const isType = (type) => (val) =>
  ![undefined, null].includes(val) && val.constructor === type;


export const isNormalFunction = (f) => f &&  typeof f === "function" && (!f.name || f.name[0] === f.name[0].toLowerCase());

export function isConstructor(f) {
  // detect is a normal function (anonymous or its name starts with lowercase)
  if (isNormalFunction(f)) return false;
  // symbols are not created with new
  if (f && f.name === "Symbol") return true;
  try {
    new f();
    return true;
  } catch (err) {
    return false;
  }
}


export const isInstanceOf = (type) => (val) => val instanceof type;
export const isPrimitive = (value) => !isInstanceOf(Object)(value)
// export const isPrimitive = (value) => !(value instanceof Object);
// export const isPrimitive = value => Object(value) !== value;

const checkObject = (whatToDo, types, props) => {
  const propsTypes = Object.keys(types).filter(notIsRegExp);

  let areAllValid = propsTypes.every((propName) => {
    return whatToDo(types[propName], props[propName], props, propName);
  });
  if (!areAllValid) return areAllValid;

  const regExpToCheck = Object.keys(types).filter(isRegExp);
  const untestedReceivedProps = Object.keys(props).filter(
    (key) => !propsTypes.includes(key)
  );

  areAllValid = regExpToCheck.every((regexpString) =>
    untestedReceivedProps.every((propName) => {
      if (stringToRegExp(regexpString).test(propName)) {
        return whatToDo(types[regexpString], props[propName], props, propName);
      }
      return true;
    })
  );
  return areAllValid;
};

export const checkShape = (types, props) =>
  checkObject(isValidType, types, props);

const whatKindIs = (type) => {
  if (isType(Object)(type)) return "schema";
  if (isPrimitive(type)) return "primitive";
  if (isConstructor(type)) return "constructor";
  if (isNormalFunction(type)) return "function";
  if (isType(Array)(type)) return "enum";
  if (isType(RegExp)(type)) return "regex";
};
export const isValidType = (type, value, rootValue, keyName) => {
  const kind = whatKindIs(type);
  switch (kind) {
    case "regex":
      return checkRegExp(type, value);
    case "primitive":
      return value === type;
    case "constructor":
      return isType(type)(value);
    case "enum":
      return type.some((_type) =>
        isValidType(_type, value, rootValue, keyName)
      );
    case "schema":
      return  value && checkShape(type, value);
    case "function":
      return type(value, rootValue, keyName);

    default:
      return false;
  }
};

const parser = () => {
  const seen = new WeakMap();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        const oldKey = seen.get(value);
        return `[circular reference] -> ${oldKey || "rootObject"}`;
      }
      seen.set(value, key);
    }
    if (typeof value === "function") {
      return value.toString();
    }
    return value;
  };
};
export const stringify = (val) => JSON.stringify(val, parser());

const checkRegExp = (regExp, value) => regExp.test(value);
const stringToRegExp = (string) => new RegExp(eval(string));
const isRegExp = (value) => value && /^\/.+\/$/.test(value);
const notIsRegExp = (value) => !isRegExp(value);

const isError = (e) => e && e.stack && e.message;
const throwOnError = (err) => {
  if (isError(err)) throw err;
  throw new TypeError(err);
};
const check = (error) => (...types) => (value) => {
  try {
    return types.every((type) => {
      const valid = isValidType(type, value);
      if (valid) return valid;
      throw `value ${stringify(value)} do not match type ${stringify(type)}`;
    });
  } catch (err) {
    return error(err);
  }
};

export const setOnError = (onError) => check(onError);

export const isValid = setOnError(() => false);

export const isValidOrLog = setOnError((err) => {
  console.error(err);
  return false;
});

export const isValidOrThrow = setOnError(throwOnError);

export default isValidOrThrow;
