import {
  stringToRegExp,
  checkConstructor,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isOptionalKey,
  optionalRegex,
  // isNullish,
  whatTypeIs,
} from "./utils.js";

export { AsyncFunction, GeneratorFunction } from "./utils.js";

export class EnumValidationError extends AggregateError {
  name = "EnumValidationError";
}
export class SchemaValidationError extends AggregateError {
  name = "SchemaValidationError";
}

export class SeriesValidationError extends AggregateError {
  name = "SeriesValidationError";
}

const formatErrorMessage = (type, value, path = []) =>
  `${path.length ? `on path /${path.join("/")} ` : ""}value ${stringify(
    value
  )} do not match type ${stringify(type)}`;

const throwError = ({ type, value, path, _Error = TypeError }) => {
  throw new _Error(formatErrorMessage(type, value, path));
};
const throwErrors = (
  errors,
  { type, value, path, _Error = AggregateError }
) => {
  if (errors.length === 1) throw errors[0];
  throw new _Error(errors, formatErrorMessage(type, value, path));
};

const validOrThrow = (input, data) => {
  if (input) return true;
  throwError(data);
};

const onFinishSuccessDefault = () => true;
const onFinishWithErrorDefault = (error) => {
  throw error;
};

const defaultConfiguration = {
  collectAllErrors: false,
  onFinishSuccess: onFinishSuccessDefault,
  onFinishWithError: onFinishWithErrorDefault,
};

export const validSchemaOrThrow = ({
  conf,
  type: schema,
  value: object,
  path = [],
}) => {
  if (!(object instanceof Object || typeof object === "string")) {
    return throwError({ type: schema, value: object });
  }

  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  for (const keyName of requiredKeys) {
    try {
      const currentPath = [...path, keyName];
      isValidTypeOrThrow(
        conf,
        schema[keyName],
        object[keyName],
        object,
        keyName,
        currentPath
      );
    } catch (error) {
      if (!conf.collectAllErrors) {
        throw error;
      }
      requiredErrors.push(error);
    }
  }
  const optionalError = [];
  const optionalKeys = Object.keys(schema)
    .filter(isOptionalKey)
    .filter((key) => !requiredKeys.includes(key.replace(optionalRegex, "")));
  for (const keyName of optionalKeys) {
    try {
      const keyNameStripped = keyName.replace(optionalRegex, "");
      const currentPath = [...path, keyNameStripped];
      // TODO do not validate with enum
      // isNullish(schema[keyName]) ||
      isValidTypeOrThrow(
        conf,
        [undefined, schema[keyName]],
        object[keyNameStripped],
        object,
        keyNameStripped,
        currentPath
      );
    } catch (error) {
      if (!conf.collectAllErrors) {
        throw error;
      }
      optionalError.push(error);
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
        isValidTypeOrThrow(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName,
          currentPath
        );
      } catch (error) {
        if (!conf.collectAllErrors) {
          throw error;
        }
        regexErrors.push(error);
      }
    }
  }
  const errors = [...regexErrors, ...requiredErrors, ...optionalError];
  if (errors.length > 0) {
    throwErrors(errors, {
      type: schema,
      value: object,
      _Error: SchemaValidationError,
    });
  }
  return true;
};

const validCustomValidatorOrThrow = (fn, value, root, keyName, path) =>
  validOrThrow(fn(value, root, keyName), {
    type: fn,
    value,
    root,
    keyName,
    path,
  });
const validConstructorOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(checkConstructor(type, value), {
    type,
    value,
    root,
    keyName,
    path,
  });
const validPrimitiveOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(value === type, { type, value, root, keyName, path });

const validRegExpOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(value.constructor === String && checkRegExp(type, value), {
    type,
    value,
    root,
    keyName,
    path,
  });

const validSeriesOrThrow = (conf, types, value) => {
  const errors = [];
  for (const type of types) {
    try {
      isValidTypeOrThrow(conf, type, value);
    } catch (error) {
      errors.push(error);
      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    throwErrors(errors, { type: types, value, _Error: SeriesValidationError });
  }
  return true;
};
const validEnumOrThrow = (conf, types, value, root, keyName, path) => {
  const errors = [];
  debugger;
  for (const type of types) {
    try {
      if (isValidTypeOrThrow(conf, type, value, root, keyName, path))
        return true;
    } catch (error) {
      errors.push(error);
      // if (!conf.collectAllErrors) break;
    }
  }
  throwErrors(errors, {
    type: types,
    value,
    path,
    _Error: EnumValidationError,
  });
  // if (errors.length > 0) {
  // }
  // return true;
};
const isValidTypeOrThrow = (conf, type, value, root, keyName, path) => {
  switch (whatTypeIs(type)) {
    case "regex":
      return validRegExpOrThrow(type, value, root, keyName, path);
    case "primitive":
      return validPrimitiveOrThrow(type, value, root, keyName, path);
    case "constructor":
      return validConstructorOrThrow(type, value, root, keyName, path);
    case "enum":
      return validEnumOrThrow(conf, type, value, root, keyName, path);
    case "schema":
      return validSchemaOrThrow({ conf, type, value, root, keyName, path });
    case "validator":
      return validCustomValidatorOrThrow(type, value, root, keyName, path);

    case "invalid":
      throw new Error("Invalid type " + stringify(type));
  }
};

const run = (conf) => (...types) => (value) => {
  try {
    validSeriesOrThrow(conf, types, value);
  } catch (error) {
    return conf.onFinishWithError(error);
  }

  return conf.onFinishSuccess();
};

const config = ({
  collectAllErrors = false,
  onFinishSuccess = onFinishSuccessDefault,
  onFinishWithError = onFinishWithErrorDefault,
} = defaultConfiguration) =>
  run({ collectAllErrors, onFinishSuccess, onFinishWithError });

const logErrorsAndReturnFalse = (error) => {
  const errors = flatAggregateError(error);
  errors.forEach((e) => console.error(e));
  return false;
};

export const isValid = config({
  onFinishWithError: () => false,
  // collectAllErrors: false, // default
});

export const isValidOrLog = config({
  onFinishWithError: logErrorsAndReturnFalse,
  // collectAllErrors: false, // default
});

const flatAggregateError = (error) => {
  if (error instanceof AggregateError) {
    let errors = error.errors.flatMap(flatAggregateError);
    return errors;
  } else {
    return [error];
  }
};

export const hasErrors = config({
  onFinishWithError: (error) => flatAggregateError(error),
  onFinishSuccess: () => null,
  collectAllErrors: true,
});

export const isValidOrLogAllErrors = config({
  onFinishWithError: logErrorsAndReturnFalse,
  // onFinishSuccess: () => true, // default
  collectAllErrors: true,
});

export const isValidOrThrowAllErrors = config({
  collectAllErrors: true,
});

export const isValidOrThrow = config();

export const arrayOf = (type) => isValidOrThrow(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValidOrThrow(Object, { [/./]: type });

export default isValidOrThrow;
