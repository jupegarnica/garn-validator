// only work in node
// import util from "util";
// const isProxy = util.types.isProxy;

// Proxy.isProxy  intercepts the creation of Proxy
// from: http://jsfiddle.net/Xotic750/ybhs5Lph/
if (typeof Proxy.isProxy === "undefined") {
  let proxyDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Proxy");
  let $Proxy = proxyDescriptor.value;
  let revocableDescriptor = Object.getOwnPropertyDescriptor(
    $Proxy,
    "revocable"
  );
  let $revocable = revocableDescriptor.value;

  let proxySymbol = Symbol("proxy");

  proxyDescriptor.value = function Proxy(target, handler) {
    target[proxySymbol] = true;
    let proxy = new $Proxy(target, handler);
    return proxy;
  };

  revocableDescriptor.value = function revocable(target, handler) {
    target[proxySymbol] = true;
    let revocableProxy = $revocable(target, handler);
    return revocableProxy;
  };
  Object.defineProperty(
    proxyDescriptor.value,
    "revocable",
    revocableDescriptor
  );

  let isProxyDescriptor = {
    value: function isProxy(obj) {
      return obj[proxySymbol] || false;
    },
  };

  Object.defineProperty(proxyDescriptor.value, "isProxy", isProxyDescriptor);

  Object.defineProperty(globalThis, "Proxy", proxyDescriptor);
}


// globalThis polyfill
if (typeof globalThis === 'undefined') {
  let getGlobal = function () {
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
  };
  var globalThis = getGlobal()
}
// Custom AggregateError polyfill
// TODO test it
if (typeof AggregateError === "undefined") {
  class AggregateError extends Error {
    constructor(errors = [], message) {
      super(message);
      this.errors = errors;
      this.name = 'AggregateError';
    }

    push(err){
      this.errors.push(err)
    }

  }

  globalThis.AggregateError = AggregateError;
}
