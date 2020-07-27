import {
  stringToRegExp,
  isType,
  isPrimitive,
  isConstructor,
  isCustomValidator,
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

const formatErrorMessage = (type, value, path = null) =>
  `${path ? `on path /${path.join("/")} ` : ""}value ${stringify(
    value
  )} do not match type ${stringify(type)}`;

const onErrorDefault = (err, type, value, path) => {
  if (err) throw err;
  throw new TypeError(formatErrorMessage(type, value, path));
};

const onFinishSuccessDefault = () => true;

const onFinishWithErrorsDefault = (errors) => {
  if (errors.length === 1) throw (errors[0]);
  throw new AggregateError(errors, "aggregateError");
};

const defaultConfiguration = {
  onError: onErrorDefault,
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
    return conf.onError(null, schema[keyName], object[keyNameStripped]);

  areAllValid = requiredKeys.every((keyName) =>
    isValidType(conf, schema[keyName], object[keyName], object, keyName)
  );

  if (!areAllValid) return conf.onError(null, schema, object);

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
  return conf.onError(null, schema, object);
};

const parseToArray = (errorOrErrors) => {
  if (Array.isArray(errorOrErrors)) {
    return errorOrErrors;
  } else {
    return [errorOrErrors];
  }
};
export const checkShapeCollectAllErrors = (conf, schema, object, path = []) => {
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  const optionalKeys = Object.keys(schema).filter(isOptionalKey);
  const regexKeys = Object.keys(schema).filter(isRegExp);
  const untestedKeys = Object.keys(object)
    .filter((key) => !requiredKeys.includes(key))
    .filter(
      (key) =>
        !optionalKeys.map((k) => k.replace(optionalRegex, "")).includes(key)
    );
  const optionalError = [];
  for (const keyName of optionalKeys) {
    try {
      const keyNameStripped = keyName.replace(optionalRegex, "");
      const currentPath = [...path, keyNameStripped];
      let valid = isValidType(
        conf,
        [undefined, schema[keyName]],
        object[keyNameStripped],
        object,
        keyNameStripped,
        currentPath
      );
      if (valid) continue;
      return conf.onError(
        null,
        schema[keyName],
        object[keyNameStripped],
        currentPath
      );
    } catch (error) {
      optionalError.push(...parseToArray(error));
    }
  }

  let requiredErrors = [];
  for (const keyName of requiredKeys) {
    try {
      const currentPath = [...path, keyName];
      let valid = isValidType(
        conf,
        schema[keyName],
        object[keyName],
        object,
        keyName,
        currentPath
      );
      if (valid) continue;
      return conf.onError(null, schema[keyName], object[keyName], currentPath);
    } catch (error) {
      requiredErrors.push(...parseToArray(error));
    }
  }

  let regexErrors = [];
  for (const regexpString of regexKeys) {
    let keys = untestedKeys.filter((keyName) =>
      stringToRegExp(regexpString).test(keyName)
    );
    for (const keyName of keys) {
      try {
        const currentPath = [...path, keyName];

        let valid = isValidType(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName,
          currentPath
        );
        if (valid) continue;
        return conf.onError(
          null,
          schema[regexpString],
          object[keyName],
          currentPath
        );
      } catch (error) {
        regexErrors.push(...parseToArray(error));
      }
    }
  }

  const errors = [...regexErrors, ...requiredErrors, ...optionalError];
  if (errors.length > 0) {
    throw errors;
  }
  return true;
};

const checkShape = (conf, ...args) =>
  conf.collectAllErrors
    ? checkShapeCollectAllErrors(conf, ...args)
    : checkShapeCollectOneError(conf, ...args);

const whatKindIs = (type) => {
  if (isType(Object)(type)) return "schema";
  if (isPrimitive(type)) return "primitive";
  if (isConstructor(type)) return "constructor";
  if (isCustomValidator(type)) return "function";
  if (isType(Array)(type)) return "enum";
  if (isType(RegExp)(type)) return "regex";
  throw new Error("Invalid type " + stringify(type));
};


export const isValidType = (
  conf = defaultConfiguration,
  type,
  value,
  rootValue,
  keyName,
  path
) => {
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
        isValidType(conf, _type, value, rootValue, keyName)
      );
    case "schema":
      return value && checkShape(conf, type, value, path);
    case "function":
      return type(value, rootValue, keyName);

    default:
      return false;
  }
};

const run = (conf) => (...types) => (value) => {
  const errors = [];
  for (const type of types) {
    try {
      const valid = isValidType(conf, type, value);
      if (valid) continue;
      throw conf.onError(null, type, value);
    } catch (error) {
      errors.push(...parseToArray(error));

      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    return conf.onFinishWithErrors(errors);
  }
  return conf.onFinishSuccess();
};

const config = ({
  onError = onErrorDefault,
  collectAllErrors = false,
  onFinishSuccess = onFinishSuccessDefault,
  onFinishWithErrors = onFinishWithErrorsDefault,
} = defaultConfiguration) =>
  run({ onError, collectAllErrors, onFinishSuccess, onFinishWithErrors });

export const isValid = config({
  onFinishWithErrors: () => false,
  // collectAllErrors: false, // default
});

export const isValidOrLog = config({
  onError: (err) => console.error(err) || false,
  // collectAllErrors: false, // default
});

export const hasErrors = config({
  onFinishWithErrors: (errors) => errors,
  onFinishSuccess: () => null,
  collectAllErrors: true,
});

export const isValidOrLogAllErrors = config({
  onFinishWithErrors: () => false,
  // onFinishSuccess: () => true, // default
  onError: (err, type, value, path) => console.error(err) || false,
  collectAllErrors: true,
});

export const isValidOrThrowAllErrors = config({
  // onFinishWithErrors: () => false,
  // onError: (err) => console.error(err) || false,
  collectAllErrors: true,
});

export const isValidOrThrow = config({});
export default isValidOrThrow;
