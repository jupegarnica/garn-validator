export const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
  .constructor;

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

export class CastError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "CastError";
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

export const constructors = new Proxy([
  Proxy, // intercepted to return the ProxyIntercepted
  Object,
  Function,
  Array,
  Number,
  Boolean,
  String,
  Symbol,
  Date,
  Promise,
  RegExp,
  Map,
  BigInt,
  Set,
  WeakMap,
  WeakSet,

  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  ArrayBuffer,

  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray,
  BigUint64Array,
  BigInt64Array,
  SharedArrayBuffer,
  DataView,
  URL,
  URLSearchParams,
  GeneratorFunction,
  AsyncFunction,
  // TextEncoder, // in node 10 : ReferenceError: TextEncoder is not defined
  // TextDecoder, // in node 10 : ReferenceError: TextEncoder is not defined
], {
  get(target, key) {
    if (key == 0) {
      //  if the proxy is intercepted it will return ProxyIntercepted
      return Proxy;
      // return typeof __ProxyIntercepted === 'function' ? __ProxyIntercepted : Proxy;
    }
    return target[key];
  },
});
