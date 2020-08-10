// only work in node
// import util from "util";
// const isProxy = util.types.isProxy;

// Proxy.isProxy  intercepts the creation of Proxy
// from: http://jsfiddle.net/Xotic750/ybhs5Lph/

if (typeof Proxy === "function" && typeof __isProxy !== "function") {
  const proxies = new WeakSet();
  const __Proxy = Proxy;
  function ProxyIntercepted(target, handler ={} ) {
    // console.log(typeof target);
    // console.count('proxy');
    let proxy = new __Proxy(target, handler);
    proxies.add(proxy);
    return proxy;
  }

  function isProxy(obj) {
    return proxies.has(obj);
  }

  globalThis.Proxy = ProxyIntercepted;
  // globalThis.__Proxy = __Proxy;
  globalThis.__isProxy = isProxy;
}
