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

import {
  TypeValidationError,
  SerieValidationError,
  EnumValidationError,
  SchemaValidationError,
} from "./constructors.js";

const onValidDefault = () => true;
const onInvalidDefault = (error) => {
  throw error;
};

const formatErrorMessage = (data) => {
  const { type, value, path, kind } = data;
  let _value = stringify(value);
  let _type = stringify(type);
  let _kind = kind || whatTypeIs(type);
  let _path = path.length ? `At path /${path.join("/")} ` : "";
  let _typeString = kind === "serie" ? _type.replace(/[\[\]]/g, "") : _type;

  return `${_path}${_value} do not match ${_kind} ${_typeString}`;
};

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

const truthyOrThrow = (input, data) => {
  if (input) return input;
  throwError(data);
};

const validSchemaOrThrow = (data) => {
  const { conf, type: schema, value: object, root = object, path = [] } = data;
  if (!(object instanceof Object || typeof object === "string")) {
    return throwError(data);
  }
  let valueTransformed = data.value;
  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  for (const keyName of requiredKeys) {
    try {
      valueTransformed = isValidTypeOrThrow({
        conf,
        type: schema[keyName],
        value: object[keyName],
        root,
        keyName,
        path: [...path, keyName],
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
      let value = object[keyNameStripped];

      if (isNullish(value)) {
        valueTransformed = value;
      } else {
        let type = schema[keyName];
        valueTransformed = isValidTypeOrThrow({
          conf,
          type,
          value,
          root,
          keyName: keyNameStripped,
          path: [...path, keyNameStripped],
        });
      }
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
        valueTransformed = isValidTypeOrThrow({
          conf,
          type: schema[regexpString],
          value: object[keyName],
          root,
          keyName,
          path: [...path, keyName],
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
  return valueTransformed;
};

const validMainValidatorOrThrow = (data) => {
  const { type: fn, value } = data;
  // console.log("validMainValidatorOrThrow");
  try {
    let newConf = {
      ...data.conf,
      onValid: onValidDefault,
      onInvalid: onInvalidDefault,
    };
    // console.log('newConf :>> ', newConf);
    // console.log('data.conf :>> ', data.conf);
    // console.log("value :>> ", value);

    // if (data.conf.applyOr) {
    //   newConf = {
    //     ...newConf,
    //     onValid: (v) => v,
    //   };

    //   console.log("newConf :>> ", newConf);
    // }

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
  return truthyOrThrow(fn(value, root, keyName), data);
};

const validConstructorOrThrow = (data) =>
  truthyOrThrow(checkConstructor(data.type, data.value), data);
const validPrimitiveOrThrow = (data) =>
  truthyOrThrow(data.value === data.type, data);

const validRegExpOrThrow = (data) =>
  truthyOrThrow(
    data.value.constructor === String && checkRegExp(data.type, data.value),
    data
  );

const validSeriesOrThrow = (conf, types, value) => {
  const errors = [];
  let valueTransformed = value;
  for (const type of types) {
    try {
      valueTransformed = isValidTypeOrThrow({ conf, type, value });
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
  return valueTransformed;
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
  const kind = whatTypeIs(data.type);
  // console.log('kind',kind);
  switch (kind) {
    case "regex":
      validRegExpOrThrow(data);
      return data.value;
    case "primitive":
      validPrimitiveOrThrow(data);
      return data.value;

    case "constructor":
      validConstructorOrThrow(data);
      return data.value;
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

function createValidator (types, conf) {
  function validatorFrom(value, secretArg) {
    let currentConf = conf;
    if (secretArg && secretArg[configurationSymbol]) {
      currentConf = secretArg[configurationSymbol];
    }
    let valueTransformed = value;
    try {
      valueTransformed = validSeriesOrThrow(currentConf, types, value);
    } catch (error) {
      if (currentConf.applyOr) {
        return currentConf.applyOr(error, valueTransformed);
      }
      return currentConf.onInvalid(error, valueTransformed);
    }

    return currentConf.transform(currentConf.onValid(valueTransformed));
  }
  validatorFrom[validatorSymbol] = true;
  validatorFrom.displayName = `${validatorFrom.name}(${[...arguments].map(
    stringify
  )})`;
  validatorFrom.or = createOr(types, conf);
  validatorFrom.transform = createTransform(types, conf);

  return validatorFrom;
};

const createOr = (types, conf) => (defaultValue) =>
  createValidator(types, {
    ...conf,
    onValid: (value) => value,
    applyOr: (error, value) => {
      if (defaultValue instanceof Function) return defaultValue(value, error);
      // console.warn("defaultValue", defaultValue);
      return defaultValue;
    },
  });

const createTransform = (types, conf) => (transformer) =>
  createValidator(types, {
    ...conf,
    transform: transformer,
  });

const run = (conf) => (...types) => {
  let validatorFrom = createValidator(types, conf);


  return validatorFrom;
};

const config = ({
  collectAllErrors = false,
  onValid = onValidDefault,
  onInvalid = onInvalidDefault,
  transform = (v) => v,
  applyOr = false,
}) => run({ collectAllErrors, onValid, onInvalid, transform, applyOr });

const logErrorsAndReturnFalse = (error) => {
  if (error instanceof AggregateError) {
    console.group(error.name + ":");
    error.errors.forEach(logErrorsAndReturnFalse);
    console.groupEnd(error.name + ":");
  } else {
    console.error((error && error.message) || error);
  }
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

export const mustBe = config({
  onValid: (value) => value,
});

export default isValidOrThrow;
