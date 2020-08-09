import { isValid } from "./lib.js";

export const arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValid(Object, { [/./]: type });

// LOGICAL

// TODO Rethink to collect all errors if posible
export const not = (...args) => (val) => !isValid(...args)(val);
export const or = (...args) => args;
export const and = (...args) => isValid(...args);

// NUMBERS
export const gt = (limit) => (value) => value > limit;
export const ge = (limit) => (value) => value >= limit;

export const lt = (limit) => (value) => value < limit;
export const le = (limit) => (value) => value <= limit;

// TODO TEST IT
export const between = (min, max) => and(ge(min), le(max));

export const Integer = and(Number, Number.isInteger);
export const Numeric = and(
  [Number, String, BigInt],
  (num) => num == Number(num)
);
export const hasDecimals = and(
  Numeric,
  (num) => num != Number.parseInt(String(num))
);

export const Odd = (num) => Math.abs(Number(num) % 2) === 1;
export const Even = (num) => Math.abs(Number(num) % 2) === 0;

export const Finite = and(Numeric, (num) => Number.isFinite(Number(num)));

export const Positive = and(Numeric, gt(0));
export const Negative = and(Numeric, lt(0));

export const SafeInteger = Number.isSafeInteger;
export const SafeNumber = and(
  Numeric,
  between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
);

export const min = gte;
export const max = lte;

// TODO STRINGS
// export const match = null;
// export const contains = null;
// export const startWith = null;
// export const endsWith = null;
// export const isLowercase = null;
// export const isUppercase = null;

// TODO REGEX
// export const insensitiveCase = null;
// export const insensitiveAccents = null;



// not

// numbers:

// is.number (value)
// is.infinite (value)
// is.decimal (value)
// is.divisibleBy (value, n)
// is.integer (value)
// is.maximum (value, others)
// is.minimum (value, others)
// is.even (value)
// is.odd (value)
// is.ge (value, other)
// is.gt (value, other)
// is.le (value, other)
// is.lt (value, other)
// is.within (value, start, finish)

// is.error (value)

// isDateString

// contains(str, seed [, options ])
// equals(str, comparison)
// isAfter(str [, date])
// isAlpha(str [, locale])
// isAlphanumeric(str [, locale])
// isAscii(str)
// isBase32(str)
// isBase64(str [, options])
// isBefore(str [, date])
// isBIC(str)
// isBoolean(str)
// isBtcAddress(str)
// isByteLength(str [, options])
// isCreditCard(str)
// isCurrency(str [, options])
// isDataURI(str)
// isDate(input [, format])
// isDecimal(str [, options])
// isDivisibleBy(str, number)
// isEAN(str)
// isEmail(str [, options])
// isEmpty(str [, options])
// isEthereumAddress(str)
// isFloat(str [, options])
// isFQDN(str [, options])
// isFullWidth(str)
// isHalfWidth(str)
// isHash(str, algorithm)
// isHexadecimal(str)
// isHexColor(str)
// isHSL(str)
// isIBAN(str)
// isIdentityCard(str [, locale])
// isIMEI(str [, options]))
// isIn(str, values)
// isInt(str [, options])
// isIP(str [, version])
// isIPRange(str)
// isISBN(str [, version])
// isISIN(str)
// isISO8601(str)
// isISO31661Alpha2(str)
// isISO31661Alpha3(str)
// isISRC(str)
// isISSN(str [, options])
// isJSON(str [, options])
// isJWT(str)
// isLatLong(str [, options])
// isLength(str [, options])
// isLocale(str)
// isLowercase(str)
// isMACAddress(str)
// isMagnetURI(str)
// isMD5(str)
// isMimeType(str)
// isMobilePhone(str [, locale [, options]])
// isMongoId(str)
// isMultibyte(str)
// isNumeric(str [, options])
// isOctal(str)
// isPassportNumber(str, countryCode)
// isPort(str)
// isPostalCode(str, locale)
// isRFC3339(str)
// isRgbColor(str [, includePercentValues])
// isSemVer(str)
// isSurrogatePair(str)
// isUppercase(str)
// isSlug
// isTaxID(str, locale)
// isURL(str [, options])
// isUUID(str [, version])
// isVariableWidth(str)
// isWhitelisted(str, chars)
// matches(str, pattern [, modifie
