import {
  stringToRegExp,
  isType,
  isPrimitive,
  isConstructor,
  isNormalFunction,
  isError,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isOptionalKey,
  optionalRegex,
} from "./utils.js";

export const checkShapeCollectOneError = (schema, object) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);

  const optionalKeys = Object.keys(schema).filter(isOptionalKey);

  let areAllValid = optionalKeys.every((keyName) => {
    const keyNameStripped = keyName.replace(optionalRegex, "");
    return isValidType(
      [undefined, schema[keyName]],
      object[keyNameStripped],
      object,
      keyNameStripped
    );
  });

  if (!areAllValid) return areAllValid;

  areAllValid = requiredKeys.every((keyName) =>
    isValidType(schema[keyName], object[keyName], object, keyName)
  );

  if (!areAllValid) return areAllValid;

  const regexKeys = Object.keys(schema).filter(isRegExp);

  const untestedKeys = Object.keys(object).filter(
    (key) => !requiredKeys.includes(key)
  );

  areAllValid = regexKeys.every((regexpString) =>
    untestedKeys
      .filter((keyName) => stringToRegExp(regexpString).test(keyName))
      .every((keyName) =>
        isValidType(schema[regexpString], object[keyName], object, keyName)
      )
  );
  return areAllValid;
};

export const checkShapeCollectAllErrors = (schema, object) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  const optionalKeys = Object.keys(schema).filter(isOptionalKey);
  const regexKeys = Object.keys(schema).filter(isRegExp);
  const untestedKeys = Object.keys(object).filter(
    (key) => !requiredKeys.includes(key)
  );

  // let areAllValid = optionalKeys.every((keyName) => {
  //   const keyNameStripped = keyName.replace(optionalRegex, "");
  //   return isValidType(
  //     [undefined, schema[keyName]],
  //     object[keyNameStripped],
  //     object,
  //     keyNameStripped
  //   );
  // });
  // if (!areAllValid) return areAllValid;
  const optionalError = []
  for (const keyName of optionalKeys) {
    try {
      const keyNameStripped = keyName.replace(optionalRegex, "");
      let valid = isValidType(
        [undefined, schema[keyName]],
        object[keyNameStripped],
        object,
        keyNameStripped
      );
      if (valid) continue;
      throw {
        keyName,
        keyNameStripped,
        validator: schema[keyName],
        value:  object[keyNameStripped]
      }
    } catch (error) {
      optionalError.push(error)
    }
  }


  // areAllValid = requiredKeys.every((keyName) =>
  //   isValidType(schema[keyName], object[keyName], object, keyName)
  // );
  // if (!areAllValid) return areAllValid;
  let requiredErrors = []
  for (const keyName of requiredKeys) {
    try {
      let valid = isValidType(schema[keyName], object[keyName], object, keyName)
      if (valid) continue;
      throw {
        keyName,
        validator: schema[keyName],
        value:  object[keyName]
      }
    } catch (error) {
      requiredErrors.push(error)
    }
  }
  // areAllValid = regexKeys.every((regexpString) =>
  //   untestedKeys
  //     .filter((keyName) => stringToRegExp(regexpString).test(keyName))
  //     .every((keyName) =>
  //       isValidType(schema[regexpString], object[keyName], object, keyName)
  //     )
  // );
  let regexErrors = []
  for (const regexpString of regexKeys) {
    let keys =  untestedKeys.filter((keyName) => stringToRegExp(regexpString).test(keyName))
    for (const keyName of keys) {
      try {
        let valid = isValidType(schema[regexpString], object[keyName], object, keyName)
        if (valid) continue;
        throw {
          keyName,
          validator: schema[keyName],
          value:  object[keyName]
        }
      } catch (error) {
        regexErrors.push(error)
      }
    }
  }

  const errors = [...regexErrors, ...requiredErrors, ...optionalError];
  if (errors.length > 0) {
    throw errors
  }

};

const checkShape = checkShapeCollectOneError;

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

const check = (onError) => (...types) => (value) => {
  try {
    return types.every((type) => {
      const valid = isValidType(type, value);

      if (valid) return valid;

      throw `value ${stringify(value)} do not match type ${stringify(type)}`;
    });
  } catch (err) {
    return onError(err);
  }
};

if (typeof AggregateError === "undefined") {
  class MyAggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.errors = errors;
    }
  }
  var AggregateError = MyAggregateError;
}

export const collectAllErrors = (...types) => (value) => {
  const errors = [];
  for (const type of types) {
    try {
      const valid = isValidType(type, value);
      if (valid) return valid;

      throwOnError(
        `value ${stringify(value)} do not match type ${stringify(type)}`
      );
    } catch (error) {
      // console.error(error.message);
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, "aggregateError");
  }
  return true;
};

export const setOnError = (onError) => check(onError);

export const isValid = setOnError(() => false);

export const isValidOrLog = setOnError((err) => {
  console.error(err);
  return false;
});

export const isValidOrThrow = setOnError(throwOnError);

export default isValidOrThrow;
