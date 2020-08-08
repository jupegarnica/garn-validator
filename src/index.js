import {
  stringToRegExp,
  checkConstructor,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isOptionalKey,
  optionalRegex,
  isNullish,
  whatTypeIs,
  validatorSymbol,
  configurationSymbol,
} from "./helpers.js";

export { AsyncFunction, GeneratorFunction } from "./constants.js";

const formatErrorMessage = (data) => {
  const { type, value, path, kind } = data;

  let typeString = stringify(type);
  typeString =
    kind === "serie" ? typeString.replace(/[\[\]]/g, "") : typeString;
  return `${path.length ? `on path /${path.join("/")} ` : ""}value ${stringify(
    value
  )} do not match ${kind || whatTypeIs(type)} ${typeString}`;
};

const descriptor = (data) => ({
  value: data,
  writable: false,
  enumerable: false,
  configurable: false,
});
export class TypeValidationError extends TypeError {
  constructor(msg, data) {
    super(msg);
    this.name = "TypeValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}
export class EnumValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "EnumValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}
export class SchemaValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "SchemaValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}
export class SerieValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "SerieValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}

const createError = (data) => {
  data.$Error = data.$Error || TypeValidationError;
  data.path = data.path || [];
  data.message = formatErrorMessage(data);
  return new data.$Error(data.message, data);
};

const createAggregateError = (errors, data) => {
  data.$Error = data.$Error;
  data.path = data.path || [];
  data.message = formatErrorMessage(data);
  return new data.$Error(errors, data.message, data);
};
const throwError = (data) => {
  throw createError(data);
};
const throwErrors = (errors, data) => {
  if (errors.length === 1) throw errors[0];
  throw createAggregateError(errors, data);
};

const mapError = (error, data) => {
  if (!error.raw) return error;
  data.path = data.path || [];
  const overriddenPath = {
    ...error.raw,
    path: [...data.path, ...error.raw.path],
    $Error: error.constructor,
  };

  if (error instanceof AggregateError) {
    const errors = error.errors.map((e) => mapError(e, data));
    return createAggregateError(errors, overriddenPath);
  } else {
    return createError(overriddenPath);
  }
};

const reThrowError = (error, data) => {
  throw mapError(error, data);
};

const validOrThrow = (input, data) => {
  if (input) return true;
  throwError(data);
};

const onValidDefault = () => true;
const onInvalidDefault = (error) => {
  throw error;
};

const validSchemaOrThrow = (data) => {
  const { conf, type: schema, value: object, root = object, path = [] } = data;
  if (!(object instanceof Object || typeof object === "string")) {
    return throwError(data);
  }

  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  for (const keyName of requiredKeys) {
    try {
      const currentPath = [...path, keyName];
      isValidTypeOrThrow({
        conf,
        type: schema[keyName],
        value: object[keyName],
        root,
        keyName,
        path: currentPath,
      });
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
      let type = schema[keyName];
      let value = object[keyNameStripped];
      isNullish(value) ||
        isValidTypeOrThrow({
          conf,
          type,
          value,
          root,
          keyName: keyNameStripped,
          path: currentPath,
        });
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
        isValidTypeOrThrow({
          conf,
          type: schema[regexpString],
          value: object[keyName],
          root,
          keyName,
          path: currentPath,
        });
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
      ...data,
      $Error: SchemaValidationError,
      kind: "schema",
    });
  }
  return true;
};

const validMainValidatorOrThrow = (data) => {
  const { type: fn, value } = data;

  try {
    let newConf = {
      ...data.conf,
      // collectAllErrors: false,
      onValid: onValidDefault,
      onInvalid: onInvalidDefault,
    };
    return fn(value, { [configurationSymbol]: newConf });
  } catch (error) {
    if (error.raw) {
      reThrowError(error, data);
    }
    throw error;
  }
};
const validCustomValidatorOrThrow = (data) => {
  const { type: fn, value, root, keyName } = data;
  return validOrThrow(fn(value, root, keyName), data);
};

const validConstructorOrThrow = (data) =>
  validOrThrow(checkConstructor(data.type, data.value), data);
const validPrimitiveOrThrow = (data) =>
  validOrThrow(data.value === data.type, data);

const validRegExpOrThrow = (data) =>
  validOrThrow(
    data.value.constructor === String && checkRegExp(data.type, data.value),
    data
  );

const validSeriesOrThrow = (conf, types, value) => {
  const errors = [];
  for (const type of types) {
    try {
      isValidTypeOrThrow({ conf, type, value });
    } catch (error) {
      errors.push(error);
      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    throwErrors(errors, {
      type: types,
      value,
      $Error: SerieValidationError,
      kind: "serie",
    });
  }
  return true;
};
const validEnumOrThrow = (data) => {
  const { conf, type: types, value, root, keyName, path } = data;
  const errors = [];
  for (const type of types) {
    try {
      return isValidTypeOrThrow({ conf, type, value, root, keyName, path });
    } catch (error) {
      errors.push(error);
    }
  }
  throwErrors(errors, {
    ...data,
    $Error: EnumValidationError,
    kind: "enum",
  });
};

const isValidTypeOrThrow = (data) => {
  switch (whatTypeIs(data.type)) {
    case "regex":
      return validRegExpOrThrow(data);
    case "primitive":
      return validPrimitiveOrThrow(data);
    case "constructor":
      return validConstructorOrThrow(data);
    case "enum":
      return validEnumOrThrow(data);
    case "schema":
      return validSchemaOrThrow(data);
    case "validator":
      return validCustomValidatorOrThrow(data);
    case "main-validator":
      return validMainValidatorOrThrow(data);
    case "invalid":
      throw new SyntaxError(
        `checking with validator ${stringify(data.type)} not supported`
      );
  }
};

const run = (conf) => (...types) => {
  function validator(value, secret = {}) {
    let currentConf = conf;
    if (secret[configurationSymbol]) {
      currentConf = secret[configurationSymbol];
    }
    try {
      validSeriesOrThrow(currentConf, types, value);
    } catch (error) {
      return currentConf.onInvalid(error);
    }

    return currentConf.onValid(value);
  }
  validator[validatorSymbol] = true;

  return validator;
};

const config = ({
  collectAllErrors = false,
  onValid = onValidDefault,
  onInvalid = onInvalidDefault,
}) => run({ collectAllErrors, onValid, onInvalid });

const logErrorsAndReturnFalse = (error) => {
  const errors = flatAggregateError(error);
  errors.forEach((e) => console.error(e && e.message || e));
  return false;
};

export const isValid = config({
  onInvalid: () => false,
  // collectAllErrors: false, // default
});

export const isValidOrLog = config({
  onInvalid: logErrorsAndReturnFalse,
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
  onInvalid: (error) => flatAggregateError(error),
  onValid: () => null,
  collectAllErrors: true,
});

export const isValidOrLogAll = config({
  onInvalid: logErrorsAndReturnFalse,
  // onValid: () => true, // default
  collectAllErrors: true,
});
export const isValidOrLogAllErrors = isValidOrLogAll;

export const isValidOrThrowAll = config({
  collectAllErrors: true,
});
export const isValidOrThrowAllErrors = isValidOrThrowAll;

export const isValidOrThrow = config({});

export const arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValid(Object, { [/./]: type });

export default isValidOrThrow;
