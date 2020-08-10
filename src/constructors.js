

export const AsyncFunction = Object.getPrototypeOf(async function () {})
.constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
.constructor;

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
], {get(target, key) {
  if(key == 0) {
    return Proxy; //  if the proxy is intercepted it will return ProxyIntercepted
  }
  return target[key]
}});
