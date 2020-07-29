import {
  stringToRegExp,
  checkConstructor,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isNotRequiredKey,
  isOptionalKey,
  optionalRegex,
  parseToArray,
  whatTypeIs,
} from "./utils.js";

import "./polyfills.js";

export const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
  .constructor;

const formatErrorMessage = (type, value, path = null) =>
  `${path ? `on path /${path.join("/")} ` : ""}value ${stringify(
    value
  )} do not match type ${stringify(type)}`;

const onErrorDefault = (err, { type, value, path }) => {
  if (err) throw err;
  throw new TypeError(formatErrorMessage(type, value, path));
};

const onFinishSuccessDefault = () => true;

const onFinishWithErrorsDefault = (errors) => {
  if (errors.length === 1) throw errors[0];
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

  let areAllValid = requiredKeys.every((keyName) =>
    isValidType(conf, schema[keyName], object[keyName], object, keyName)
  );

  if (!areAllValid) return conf.onError(null, { type: schema, value: object });

  areAllValid = optionalKeys.every((keyName) => {
    const keyNameStripped = keyName.replace(optionalRegex, "");
    return isValidType(
      conf,
      [undefined, schema[keyName]],
      object[keyNameStripped],
      object,
      keyNameStripped
    );
  });

  if (!areAllValid) return conf.onError(null, { type: schema, value: object });

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
  return conf.onError(null, { type: schema, value: object });
};

export const checkShapeCollectAllErrors = (conf, schema, object, path = []) => {

  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
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
      return conf.onError(null, {
        type: schema[keyName],
        value: object[keyName],
        path: currentPath,
      });
    } catch (error) {
      requiredErrors.push(...parseToArray(error));
    }
  }
  const optionalError = [];
  const optionalKeys = Object.keys(schema)
    .filter(isOptionalKey)
    .filter(
      (key) => !requiredKeys.includes(key.replace(optionalRegex, ""))
    );
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
      return conf.onError(null, {
        type: schema[keyName],
        value: object[keyNameStripped],
        path: currentPath,
      });
    } catch (error) {
      optionalError.push(...parseToArray(error));
    }
  }
  let regexErrors = [];
  const regexKeys = Object.keys(schema).filter(isRegExp);
  const untestedKeys = Object.keys(object)
    .filter((key) => !requiredKeys.includes(key))
    .filter(
      (key) =>
        !optionalKeys.map((k) => k.replace(optionalRegex, "")).includes(key)
    );
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
        return conf.onError(null, {
          type: schema[regexpString],
          value: object[keyName],
          path: currentPath,
        });
      } catch (error) {
        regexErrors.push(...parseToArray(error));
      }
    }
  }
  console.log(requiredKeys,optionalKeys,regexKeys);
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

const isValidType = (
  conf = defaultConfiguration,
  type,
  value,
  rootValue,
  keyName,
  path
) => {
  const kind = whatTypeIs(type);
  switch (kind) {
    case "regex":
      return checkRegExp(type, value);
    case "primitive":
      return value === type;
    case "constructor":
      return checkConstructor(type, value);
    case "enum":
      return type.some((_type) =>
        isValidType(conf, _type, value, rootValue, keyName)
      );
    case "schema":
      checkShape(conf, type, value, path);
      // checkSchema will throw if invalid in each each key
      return true;
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
      throw conf.onError(null, { type, value });
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

const logOnErrorAndReturnFalse = (err, { type, value, path }) =>
  console.error(err || formatErrorMessage(type, value, path)) || false;

export const isValid = config({
  onFinishWithErrors: () => false,
  // collectAllErrors: false, // default
});

export const isValidOrLog = config({
  onError: logOnErrorAndReturnFalse,
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
  onError: logOnErrorAndReturnFalse,
  collectAllErrors: true,
});

export const isValidOrThrowAllErrors = config({
  collectAllErrors: true,
});

export const isValidOrThrow = config({});
export default isValidOrThrow;
