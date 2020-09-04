import "./polyfills.js";

import {
  constructors,
  AsyncFunction,
  GeneratorFunction,
} from "./constructors.js";

const isProxy = (v) => (globalThis.__isProxy ? globalThis.__isProxy(v) : false);

export const validatorSymbol = Symbol("validator mark");
export const configurationSymbol = Symbol("rewrite configuration");

const isMainValidator = (type) => type && !!type[validatorSymbol];

export const isNullish = (val) => val === undefined || val === null;

export const checkConstructor = (type, val) => {
  if (Proxy === type) {
    return isProxy(val);
  }
  return !isNullish(val) && val.constructor === type;
};

export const isClass = (fn) =>
  typeof fn === "function" &&
  /^\bclass(?!\$)\b/.test(fn.toString()) &&
  !isFunctionHacked(fn);

export const isFunctionHacked = (fn) =>
  typeof fn === "function" &&
  fn.toString.toString() !== "function toString() { [native code] }";

export const isCustomValidator = (fn) =>
  typeof fn === "function" &&
  !isClass(fn) &&
  !isInvalidType(fn) &&
  !isConstructor(fn);

export const isInvalidType = (fn) =>
  fn instanceof AsyncFunction || fn instanceof GeneratorFunction;

export function isConstructor(f) {
  if (!f) return false;
  // if (!f.constructor) return false;
  if (typeof f !== "function") return false;
  if (!f.name) return false;
  if (isClass(f)) return true;
  return constructors.some((c) => c === f);
}
export const whatTypeIs = (type) => {
  if (type && type.constructor === Object) return "schema";
  if (isPrimitive(type)) return "primitive";
  if (Array.isArray(type)) return "enum";
  if (type instanceof RegExp) return "regex";
  if (isConstructor(type)) return "constructor";
  if (isMainValidator(type)) return "main-validator";
  // if (isCustomValidator(type)) return "validator";
  return "validator";
};

// export const whatTypeIs = (type) => {

//   if (isPrimitive(type)) return "primitive";
//   if (Array.isArray(type)) return "enum";
//   if (type && type.constructor === Object) return "schema";
//   if (type instanceof RegExp) return "regex";
//   if (isCustomValidator(type)) return "validator";
//   if (isConstructor(type)) return "constructor";
//   if (isMainValidator(type)) return "main-validator";
//   return "invalid";
// };

// fails in ArrayBuffer
// export const isPrimitive = (value) => !(value instanceof Object) || (value.constructor === Number || value.constructor === String);
export const isPrimitive = (value) =>
  Object(value) !== value ||
  value.constructor === Number ||
  value.constructor === String;

const addStripMark = (str) => `__strip__${str}__strip__`;

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
    if (value && value.displayName) {
      return addStripMark(value.displayName);
    }
    if (Number.isNaN(value)) {
      return addStripMark(value);
    }
    if (value === Infinity || value === -Infinity) {
      return addStripMark(value);
    }
    if (typeof value === "function" && value[validatorSymbol]) {
      return addStripMark(value.name);
    }
    if (typeof value === "bigint") {
      return addStripMark(Number(value) + "n");
    }
    if (typeof value === "function" && isConstructor(value)) {
      return addStripMark(value.name);
    }
    if (typeof value === "function") {
      return addStripMark(value.toString());
    }
    if (checkConstructor(RegExp, value)) {
      return addStripMark(value.toString());
    }
    return value;
  };
};

export const optionalRegex = /[?$]$/;
export const isOptionalKey = (key) => optionalRegex.test(key);
export const isRequiredKey = (key) => notIsRegExp(key) && !isOptionalKey(key);

export const stringify = (val) => {
  let str = JSON.stringify(val, parser());
  return str && str.replace(/("__strip__)|(__strip__")/g, "");
};

export const checkRegExp = (regExp, value) => regExp.test(value);

const matchExpAndFlags = /^\/([\d\D]*)\/([iugmy]*)$/g
export const stringToRegExp = (string) => {
  const matches = matchExpAndFlags.exec(string);
  const expression = matches && matches[1] || undefined;
  const flags = matches && matches[2] || undefined
  return new RegExp(expression,flags)
};
export const isRegExp = (value) => value && /^\/.+(\/[iugmy]*)$/.test(value);
export const notIsRegExp = (value) => !isRegExp(value);

// export const isError = (e) => e && e.stack && e.message;
// export const isError = (e) => e instanceof Error
const isObjectOrArray = (obj) =>
  obj && obj.constructor !== Date && typeof obj === "object";

export const deepClone = (obj) => {
  if (!isObjectOrArray(obj)) return obj;
  let clone = Object.assign({}, obj);
  Object.keys(clone).forEach(
    (
      key,
    ) => (clone[key] = typeof obj[key] === "object"
      ? deepClone(obj[key])
      : obj[key]),
  );
  return Array.isArray(obj) && obj.length
    ? (clone.length = obj.length) && Array.from(clone)
    : Array.isArray(obj)
    ? Array.from(obj)
    : clone;
};
