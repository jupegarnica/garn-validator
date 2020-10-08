"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.isConstructor=isConstructor;exports.deepClone=exports.notIsRegExp=exports.isRegExp=exports.stringToRegExp=exports.checkRegExp=exports.stringify=exports.isRequiredKey=exports.isOptionalKey=exports.optionalRegex=exports.isPrimitive=exports.whatTypeIs=exports.isInvalidType=exports.isCustomValidator=exports.isFunctionHacked=exports.isClass=exports.checkConstructor=exports.isNullish=exports.configurationSymbol=exports.validatorSymbol=void 0;require("./polyfills.js");var _constructors=require("./constructors.js");const isProxy=v=>globalThis.__isProxy?globalThis.__isProxy(v):false;const validatorSymbol=Symbol("validator mark");exports.validatorSymbol=validatorSymbol;const configurationSymbol=Symbol("rewrite configuration");exports.configurationSymbol=configurationSymbol;const isMainValidator=type=>type&&!!type[validatorSymbol];const isNullish=val=>val===undefined||val===null;exports.isNullish=isNullish;const checkConstructor=(type,val)=>{if(Proxy===type){return isProxy(val)}return!isNullish(val)&&val.constructor===type};exports.checkConstructor=checkConstructor;const isClass=fn=>typeof fn==="function"&&/^\bclass(?!\$)\b/.test(fn.toString())&&!isFunctionHacked(fn);exports.isClass=isClass;const isFunctionHacked=fn=>typeof fn==="function"&&fn.toString.toString()!=="function toString() { [native code] }";exports.isFunctionHacked=isFunctionHacked;const isCustomValidator=fn=>typeof fn==="function"&&!isClass(fn)&&!isInvalidType(fn)&&!isConstructor(fn);exports.isCustomValidator=isCustomValidator;const isInvalidType=fn=>fn instanceof _constructors.AsyncFunction||fn instanceof _constructors.GeneratorFunction;exports.isInvalidType=isInvalidType;function isConstructor(f){if(!f)return false;if(typeof f!=="function")return false;if(!f.name)return false;if(isClass(f))return true;return _constructors.constructors.some(c=>c===f)}const whatTypeIs=type=>{if(type&&type.constructor===Object)return"schema";if(isPrimitive(type))return"primitive";if(Array.isArray(type))return"enum";if(type instanceof RegExp)return"regex";if(isConstructor(type))return"constructor";if(isMainValidator(type))return"main-validator";if(isInvalidType(type))return"invalid";return"validator"};exports.whatTypeIs=whatTypeIs;const isPrimitive=value=>Object(value)!==value||value.constructor===Number||value.constructor===String;exports.isPrimitive=isPrimitive;const addStripMark=str=>`__strip__${str}__strip__`;const parser=()=>{const seen=new WeakMap;return(key,value)=>{if(typeof value==="object"&&value!==null){if(seen.has(value)){const oldKey=seen.get(value);return`[circular reference] -> ${oldKey||"rootObject"}`}seen.set(value,key)}if(value&&value.displayName){return addStripMark(value.displayName)}if(Number.isNaN(value)){return addStripMark(value)}if(value===Infinity||value===-Infinity){return addStripMark(value)}if(typeof value==="function"&&value[validatorSymbol]){return addStripMark(value.name)}if(typeof value==="bigint"){return addStripMark(Number(value)+"n")}if(typeof value==="function"&&isConstructor(value)){return addStripMark(value.name)}if(typeof value==="function"){return addStripMark(value.toString())}if(checkConstructor(RegExp,value)){return addStripMark(value.toString())}return value}};const optionalRegex=/[?$]$/;exports.optionalRegex=optionalRegex;const isOptionalKey=key=>optionalRegex.test(key);exports.isOptionalKey=isOptionalKey;const isRequiredKey=key=>notIsRegExp(key)&&!isOptionalKey(key);exports.isRequiredKey=isRequiredKey;const stringify=val=>{let str=JSON.stringify(val,parser());return str&&str.replace(/("__strip__)|(__strip__")/g,"")};exports.stringify=stringify;const checkRegExp=(regExp,value)=>regExp.test(value);exports.checkRegExp=checkRegExp;const matchExpAndFlags=/^\/([\d\D]*)\/([iugmy]*)$/g;const stringToRegExp=string=>{const matches=matchExpAndFlags.exec(string);const expression=matches&&matches[1]||undefined;const flags=matches&&matches[2]||undefined;return new RegExp(expression,flags)};exports.stringToRegExp=stringToRegExp;const isRegExp=value=>value&&/^\/.+(\/[iugmy]*)$/.test(value);exports.isRegExp=isRegExp;const notIsRegExp=value=>!isRegExp(value);exports.notIsRegExp=notIsRegExp;const isObjectOrArray=obj=>obj&&obj.constructor!==Date&&typeof obj==="object";const deepClone=obj=>{if(!isObjectOrArray(obj))return obj;let clone=Object.assign({},obj);Object.keys(clone).forEach(key=>clone[key]=typeof obj[key]==="object"?deepClone(obj[key]):obj[key]);return Array.isArray(obj)&&obj.length?(clone.length=obj.length)&&Array.from(clone):Array.isArray(obj)?Array.from(obj):clone};exports.deepClone=deepClone;