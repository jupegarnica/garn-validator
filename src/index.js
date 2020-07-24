import {
  notIsRegExp,
  stringToRegExp,
  isType,
  isPrimitive,
  isConstructor,
  isNormalFunction,
  isError,
  isRegExp,
  checkRegExp,
  stringify,
} from "./utils.js";

const isOptionalKey = (key = "") => /[?$]$/.test(key);
const isRequiredKey = (key) => notIsRegExp(key) && !isOptionalKey(key);

const checkObject = (whatToDo, schema, object) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);

  const optionalKeys = Object.keys(schema).filter(isOptionalKey);

  let areAllValid = optionalKeys.every((keyName) => {
    const keyNameStripped = keyName.replace(/[?$]$/,'')
    return whatToDo(
      [undefined, schema[keyName]],
      object[keyNameStripped],
      object,
      keyNameStripped
    );
  });

  if (!areAllValid) return areAllValid;

  areAllValid = requiredKeys.every((keyName) =>
    whatToDo(schema[keyName], object[keyName], object, keyName)
  );

  if (!areAllValid) return areAllValid;

  const regexKeys = Object.keys(schema).filter(isRegExp);

  const untestedKeys = Object.keys(object).filter(
    (key) => !requiredKeys.includes(key)
  );

  areAllValid = regexKeys.every((regexpString) =>
    untestedKeys.every((keyName) => {
      if (stringToRegExp(regexpString).test(keyName)) {
        return whatToDo(schema[regexpString], object[keyName], object, keyName);
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
      return value && checkShape(type, value);
    case "function":
      return type(value, rootValue, keyName);

    default:
      return false;
  }
};
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
