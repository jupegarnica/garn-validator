import {
  stringToRegExp,
  isType,
  isPrimitive,
  isConstructor,
  isCustomValidator,
  isError,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isOptionalKey,
  optionalRegex,
} from "./utils.js";

// AggregateError polyfill
if (typeof AggregateError === "undefined") {
  class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.errors = errors;
    }
  }
  global.AggregateError = AggregateError;
}

const formatErrorMessage = (type, value) =>
  `value ${stringify(value)} do not match type ${stringify(type)}`;

const throwOnError = (err) => {
  if (isError(err)) throw err;
  throw new TypeError(err);
};

const onFinishSuccessDefault = () => true;

const onFinishWithErrorsDefault = (errors) => {
  if (errors.length === 1) throwOnError(errors[0]);
  throw new AggregateError(errors, "aggregateError");
};

const defaultConfiguration = {
  onError: throwOnError,
  collectAllErrors: false,
  onFinishSuccess: onFinishSuccessDefault,
  onFinishWithErrors: onFinishWithErrorsDefault,
};

export const checkShapeCollectOneError = (conf, schema, object) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);

  const optionalKeys = Object.keys(schema).filter(isOptionalKey);

  let areAllValid = optionalKeys.every((keyName) => {
    const keyNameStripped = keyName.replace(optionalRegex, "");
    return isValidType(
      conf,
      [undefined, schema[keyName]],
      object[keyNameStripped],
      object,
      keyNameStripped
    );
  });

  if (!areAllValid)
    return conf.onError(
      formatErrorMessage(schema[keyName], object[keyNameStripped])
    );

  areAllValid = requiredKeys.every((keyName) =>
    isValidType(conf, schema[keyName], object[keyName], object, keyName)
  );

  if (!areAllValid) return conf.onError(formatErrorMessage(schema, object));

  const regexKeys = Object.keys(schema).filter(isRegExp);

  const untestedKeys = Object.keys(object).filter(
    (key) => !requiredKeys.includes(key)
  );

  areAllValid = regexKeys.every((regexpString) =>
    untestedKeys
      .filter((keyName) => stringToRegExp(regexpString).test(keyName))
      .every((keyName) =>
        isValidType(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName
        )
      )
  );
  if (areAllValid) return true;
  return conf.onError(formatErrorMessage(schema, object));
};

export const checkShapeCollectAllErrors = (conf, schema, object) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  const optionalKeys = Object.keys(schema).filter(isOptionalKey);
  const regexKeys = Object.keys(schema).filter(isRegExp);
  const untestedKeys = Object.keys(object).filter(
    (key) => !requiredKeys.includes(key)
  );

  const optionalError = [];
  for (const keyName of optionalKeys) {
    try {
      const keyNameStripped = keyName.replace(optionalRegex, "");
      let valid = isValidType(
        conf,
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
        value: object[keyNameStripped],
      };
    } catch (error) {
      optionalError.push(error);
    }
  }

  let requiredErrors = [];
  for (const keyName of requiredKeys) {
    try {
      let valid = isValidType(
        conf,
        schema[keyName],
        object[keyName],
        object,
        keyName
      );
      if (valid) continue;
      throw {
        keyName,
        validator: schema[keyName],
        value: object[keyName],
      };
    } catch (error) {
      requiredErrors.push(error);
    }
  }

  let regexErrors = [];
  for (const regexpString of regexKeys) {
    let keys = untestedKeys.filter((keyName) =>
      stringToRegExp(regexpString).test(keyName)
    );
    for (const keyName of keys) {
      try {
        let valid = isValidType(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName
        );
        if (valid) continue;
        throw {
          keyName,
          validator: schema[keyName],
          value: object[keyName],
        };
      } catch (error) {
        regexErrors.push(error);
      }
    }
  }

  const errors = [...regexErrors, ...requiredErrors, ...optionalError];
  if (errors.length > 0) {
    throw errors;
  }
  return true;
};

const checkShape = checkShapeCollectOneError;

const whatKindIs = (type) => {
  if (isType(Object)(type)) return "schema";
  if (isPrimitive(type)) return "primitive";
  if (isConstructor(type)) return "constructor";
  if (isCustomValidator(type)) return "function";
  if (isType(Array)(type)) return "enum";
  if (isType(RegExp)(type)) return "regex";
  throw new Error("Invalid type " + stringify(type));
};

/*
  return true or false
  throw error
*/
export const isValidType = (
  conf = defaultConfiguration,
  type,
  value,
  rootValue,
  keyName
) => {
  const kind = whatKindIs(type);
 try {
  switch (kind) {
    case "regex":
      return checkRegExp(type, value);
    case "primitive":
      return value === type;
    case "constructor":
      return isType(type)(value);
    case "enum":
      return type.some((_type) =>
        isValidType(conf, _type, value, rootValue, keyName)
      );
    case "schema":
      return value && checkShape(conf, type, value);
    case "function":
      return type(value, rootValue, keyName);

    default:
      return false;
  }
 } catch (error) {
   return conf.onError(error)
 }
};



const run = (conf) => (...types) => (value) => {
  const errors = [];
  for (const type of types) {
    try {
      const valid = isValidType(conf, type, value);
      if (valid) continue;

      throw conf.onError(formatErrorMessage(type, value));
    } catch (error) {
      errors.push(error);
      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    return conf.onFinishWithErrors(errors);
  }
  return conf.onFinishSuccess();
};

export const config = ({
  onError = throwOnError,
  collectAllErrors = false,
  onFinishSuccess = onFinishSuccessDefault,
  onFinishWithErrors = onFinishWithErrorsDefault,
} = defaultConfiguration) =>
  run({ onError, collectAllErrors, onFinishSuccess, onFinishWithErrors });

export const setOnError = (onError) => config({ onError });

export const isValid = config({
  onFinishWithErrors: () => false,
  onError: () => false,
  collectAllErrors: false,
});

export const isValidOrLog = config({
  onError: (err) => console.error(err) || false,
  collectAllErrors: false,
});

export const hasErrors = config({
  onFinishWithErrors: (errors) => errors,
  onFinishSuccess: () => null,
  collectAllErrors: true,
});

export const isValidOrThrow = config({
  // onFinishWithErrors: throwOnError,
  // onError: throwOnError,
  // collectAllErrors: false,
});
export default isValidOrThrow;
