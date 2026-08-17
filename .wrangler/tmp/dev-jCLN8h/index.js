var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/dist/index.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
async function onRequestPost({ request, env, data }) {
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cursos_config (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
  if (body.id) {
    await env.DB.prepare(`
      INSERT INTO cursos_config (id, data, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')
    `).bind(body.id, JSON.stringify(body)).run();
  }
  return Response.json({ success: true, course: body });
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestGet({ env, data }) {
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS perfiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();
  const { results: perfiles } = await env.DB.prepare(
    "SELECT id, email, full_name, avatar_url, role, created_at FROM perfiles ORDER BY created_at DESC"
  ).all();
  const { results: grupos } = await env.DB.prepare(
    "SELECT id, course_id, name, teacher FROM grupos ORDER BY id DESC"
  ).all();
  const { results: grupos_usuario } = await env.DB.prepare(
    "SELECT user_id, group_id FROM grupos_usuario"
  ).all();
  return Response.json({
    perfiles: perfiles || [],
    cursos: [],
    grupos: grupos || [],
    grupos_usuario: grupos_usuario || []
  });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");
__name2(concat, "concat");
function encode(string) {
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127) {
      throw new TypeError("non-ASCII string encountered in encode()");
    }
    bytes[i] = code;
  }
  return bytes;
}
__name(encode, "encode");
__name2(encode, "encode");
var unusable = /* @__PURE__ */ __name2((name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`), "unusable");
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
__name(checkUsage, "checkUsage");
__name2(checkUsage, "checkUsage");
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength !== "number" || modulusLength < 2048) {
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
  }
}
__name(checkModulusLength, "checkModulusLength");
__name2(checkModulusLength, "checkModulusLength");
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name) {
    throw unusable(expected.name);
  }
  if (expected.hash && algorithm.hash?.name !== expected.hash) {
    throw unusable(expected.hash, "algorithm.hash");
  }
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve) {
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  }
  if (expected.length !== void 0 && algorithm.length !== expected.length) {
    throw unusable(expected.length, "algorithm.length");
  }
  checkUsage(key, usage);
}
__name(checkCryptoKey, "checkCryptoKey");
__name2(checkCryptoKey, "checkCryptoKey");
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
__name2(message, "message");
var withAlg = /* @__PURE__ */ __name2((alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types), "withAlg");
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  static {
    __name2(this, "JOSEError");
  }
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
  static {
    __name(this, "JWTClaimValidationFailed");
  }
  static {
    __name2(this, "JWTClaimValidationFailed");
  }
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
var JWTExpired = class extends JOSEError {
  static {
    __name(this, "JWTExpired");
  }
  static {
    __name2(this, "JWTExpired");
  }
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
var JOSEAlgNotAllowed = class extends JOSEError {
  static {
    __name(this, "JOSEAlgNotAllowed");
  }
  static {
    __name2(this, "JOSEAlgNotAllowed");
  }
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  static {
    __name2(this, "JOSENotSupported");
  }
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  static {
    __name2(this, "JWSInvalid");
  }
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  static {
    __name2(this, "JWTInvalid");
  }
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static {
    __name(this, "JWSSignatureVerificationFailed");
  }
  static {
    __name2(this, "JWSSignatureVerificationFailed");
  }
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};
var isCryptoKey = /* @__PURE__ */ __name2((key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
}, "isCryptoKey");
var isKeyObject = /* @__PURE__ */ __name2((key) => key?.[Symbol.toStringTag] === "KeyObject", "isKeyObject");
var isKeyLike = /* @__PURE__ */ __name2((key) => isCryptoKey(key) || isKeyObject(key), "isKeyLike");
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
__name(encodeBase64, "encodeBase64");
__name2(encodeBase64, "encodeBase64");
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(decodeBase64, "decodeBase64");
__name2(decodeBase64, "decodeBase64");
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  if (Uint8Array.fromBase64) {
    try {
      return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
        alphabet: "base64url"
      });
    } catch (cause) {
      throw new TypeError(invalid, { cause });
    }
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  if (encoded.includes("+") || encoded.includes("/")) {
    throw new TypeError(invalid);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError(invalid);
  }
}
__name(decode, "decode");
__name2(decode, "decode");
function encode2(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(encode2, "encode2");
__name2(encode2, "encode");
function isObject(input) {
  if (typeof input !== "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype === null) {
    return true;
  }
  let proto = prototype;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return prototype === proto;
}
__name(isObject, "isObject");
__name2(isObject, "isObject");
function isDisjoint(...headers) {
  const parameters = /* @__PURE__ */ new Set();
  for (const header of headers) {
    if (!header)
      continue;
    for (const parameter of Object.keys(header)) {
      if (parameters.has(parameter)) {
        return false;
      }
      parameters.add(parameter);
    }
  }
  return true;
}
__name(isDisjoint, "isDisjoint");
__name2(isDisjoint, "isDisjoint");
var isJWK = /* @__PURE__ */ __name2((key) => isObject(key) && typeof key.kty === "string", "isJWK");
var isPrivateJWK = /* @__PURE__ */ __name2((key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string"), "isPrivateJWK");
var isPublicJWK = /* @__PURE__ */ __name2((key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0, "isPublicJWK");
var isSecretJWK = /* @__PURE__ */ __name2((key) => key.kty === "oct" && typeof key.k === "string", "isSecretJWK");
function assertNotSet(value, name) {
  if (value) {
    throw new TypeError(`${name} can only be called once`);
  }
}
__name(assertNotSet, "assertNotSet");
__name2(assertNotSet, "assertNotSet");
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
__name(decodeBase64url, "decodeBase64url");
__name2(decodeBase64url, "decodeBase64url");
function encodeBase64url(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch {
    throw new ErrorClass(`The ${label} is not a valid base64url string`);
  }
}
__name(encodeBase64url, "encodeBase64url");
__name2(encodeBase64url, "encodeBase64url");
function parseJoseHeader(b64, ErrorClass, message2) {
  let parsed;
  try {
    parsed = JSON.parse(strictDecoder.decode(decode(b64)));
  } catch {
    throw new ErrorClass(message2);
  }
  if (!isObject(parsed)) {
    throw new ErrorClass(message2);
  }
  return parsed;
}
__name(parseJoseHeader, "parseJoseHeader");
__name2(parseJoseHeader, "parseJoseHeader");
async function jwkToKey(entry, jwk) {
  if (jwk.kty === "RSA" && "oth" in jwk && jwk.oth !== void 0) {
    throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
  }
  if (!entry.kty.includes(jwk.kty)) {
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  }
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle;
  const isPrivate = !!(jwk.d || jwk.priv);
  const keyData = { ...jwk };
  if (keyData.kty !== "AKP") {
    delete keyData.alg;
  }
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
__name(jwkToKey, "jwkToKey");
__name2(jwkToKey, "jwkToKey");
var tag = /* @__PURE__ */ __name2((key) => key[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name2((entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== void 0) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected) {
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
    }
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  }
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp)) {
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
    }
  }
}, "jwkMatchesOp");
function checkKeyType(entry, key, usage) {
  const { alg, secret } = entry;
  const privateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return [BYTES, key];
  if (isJWK(key)) {
    if (secret ? !isSecretJWK(key) : !(privateKey ? isPrivateJWK(key) : isPublicJWK(key))) {
      throw new TypeError(secret ? `JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present` : `JSON Web Key for this operation must be a ${privateKey ? "private" : "public"} JWK`);
    }
    jwkMatchesOp(entry, key, usage);
    return [JWK, key];
  }
  if (!isKeyLike(key)) {
    throw new TypeError(secret ? withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array") : withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
  }
  if (secret) {
    if (key.type !== "secret") {
      throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
  } else {
    if (key.type === "secret") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    const expectedType = privateKey ? "private" : "public";
    if ((key.type === "public" || key.type === "private") && key.type !== expectedType) {
      const operation = usage === "sign" ? "signing" : usage === "verify" ? "verifying" : `${usage.slice(0, -1)}tion`;
      throw new TypeError(`${tag(key)} instances for asymmetric algorithm ${operation} must be of type "${expectedType}"`);
    }
  }
  return isCryptoKey(key) ? [CRYPTO, key] : [KEYOBJECT, key];
}
__name(checkKeyType, "checkKeyType");
__name2(checkKeyType, "checkKeyType");
var BYTES = 0;
var CRYPTO = 1;
var KEYOBJECT = 2;
var JWK = 3;
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
function cached(key, alg, value) {
  cache ||= /* @__PURE__ */ new WeakMap();
  const entry = cache.get(key);
  if (value) {
    if (entry) {
      entry[alg] = value;
    } else {
      cache.set(key, { [alg]: value });
    }
  }
  return value ?? entry?.[alg];
}
__name(cached, "cached");
__name2(cached, "cached");
var handleJWK = /* @__PURE__ */ __name2(async (key, jwk, entry) => cached(key, entry.alg) ?? cached(key, entry.alg, await jwkToKey(entry, { ...jwk, alg: entry.alg })), "handleJWK");
var handleKeyObject = /* @__PURE__ */ __name2((keyObject, entry) => {
  const hit = cached(keyObject, entry.alg);
  if (hit)
    return hit;
  const isPublic = keyObject.type === "public";
  const usages = entry.usages[isPublic ? 0 : 1];
  const { asymmetricKeyType } = keyObject;
  const crv = nist[keyObject.asymmetricKeyDetails?.namedCurve];
  const params = entry.resolve?.({ crv, asymmetricKeyType }) ?? entry.subtle;
  return cached(keyObject, entry.alg, keyObject.toCryptoKey(params, isPublic, usages));
}, "handleKeyObject");
async function prepareKey(entry, key, usage) {
  const tagged = checkKeyType(entry, key, usage);
  switch (tagged[0]) {
    case BYTES:
    case CRYPTO:
      return tagged[1];
    case JWK: {
      const key2 = tagged[1];
      if (key2.k) {
        return decode(key2.k);
      }
      if (!Object.isFrozen(key2)) {
        const { key_ops } = key2;
        if (Array.isArray(key_ops))
          Object.freeze(key_ops);
        Object.freeze(key2);
      }
      return handleJWK(key2, key2, entry);
    }
    case KEYOBJECT: {
      const keyObject = tagged[1];
      if (keyObject.type === "secret") {
        return keyObject.export();
      }
      if ("toCryptoKey" in keyObject && typeof keyObject.toCryptoKey === "function") {
        return handleKeyObject(keyObject, entry);
      }
      return handleJWK(keyObject, keyObject.export({ format: "jwk" }), entry);
    }
  }
}
__name(prepareKey, "prepareKey");
__name2(prepareKey, "prepareKey");
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries) {
    out[alg] = { ...entries[alg], alg };
  }
  return out;
}
__name(table, "table");
__name2(table, "table");
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}
__name(validateAlgorithms, "validateAlgorithms");
__name2(validateAlgorithms, "validateAlgorithms");
function validateCritDuplicates(Err, protectedHeader) {
  const { crit } = protectedHeader ?? {};
  if (Array.isArray(crit) && new Set(crit).size !== crit.length) {
    throw new Err('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
  }
}
__name(validateCritDuplicates, "validateCritDuplicates");
__name2(validateCritDuplicates, "validateCritDuplicates");
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return [];
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  const recognized = recognizedOption === void 0 ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === void 0)) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return protectedHeader.crit;
}
__name(validateCrit, "validateCrit");
__name2(validateCrit, "validateCrit");
async function getSigKey(entry, key, usage) {
  if (key instanceof Uint8Array) {
    return crypto.subtle.importKey("raw", key, entry.subtle, false, [
      usage
    ]);
  }
  checkCryptoKey(key, entry.subtle, usage);
  if (entry.minRsaBits)
    checkModulusLength(entry.alg, key);
  return key;
}
__name(getSigKey, "getSigKey");
__name2(getSigKey, "getSigKey");
async function sign(entry, key, data) {
  const cryptoKey = await getSigKey(entry, key, "sign");
  const signature = await crypto.subtle.sign(entry.signing, cryptoKey, data);
  return new Uint8Array(signature);
}
__name(sign, "sign");
__name2(sign, "sign");
async function verify(entry, key, signature, data) {
  const cryptoKey = await getSigKey(entry, key, "verify");
  try {
    return await crypto.subtle.verify(entry.signing, cryptoKey, signature, data);
  } catch {
    return false;
  }
}
__name(verify, "verify");
__name2(verify, "verify");
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
__name(hmac, "hmac");
__name2(hmac, "hmac");
function rsa(bits, saltLength) {
  const name = saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5";
  const subtle = { name, hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
__name(rsa, "rsa");
__name2(rsa, "rsa");
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
__name(ecdsa, "ecdsa");
__name2(ecdsa, "ecdsa");
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
__name(eddsa, "eddsa");
__name2(eddsa, "eddsa");
function mldsa(bits) {
  const name = `ML-DSA-${bits}`;
  const subtle = { name };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
__name(mldsa, "mldsa");
__name2(mldsa, "mldsa");
var JWS = table({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = JWS[alg];
  if (!entry) {
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
  return entry;
}
__name(jwsAlgorithm, "jwsAlgorithm");
__name2(jwsAlgorithm, "jwsAlgorithm");
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
__name(prepareVerify, "prepareVerify");
__name2(prepareVerify, "prepareVerify");
async function verifySignature(jws, shared, key) {
  const { protected: encodedProtected, header, payload: inputPayload } = jws;
  let parsedProt = {};
  if (encodedProtected) {
    parsedProt = parseJoseHeader(encodedProtected, JWSInvalid, "JWS Protected Header is invalid");
  }
  let joseHeader;
  if (header !== void 0) {
    if (!isDisjoint(parsedProt, header)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    joseHeader = { ...parsedProt, ...header };
  } else {
    joseHeader = parsedProt;
  }
  const extensions = validateCrit(JWSInvalid, JWS_RECOGNIZED, shared[1], parsedProt, joseHeader);
  let b64 = true;
  if (extensions.includes("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  if (shared[0] && !shared[0].has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof inputPayload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof inputPayload !== "string" && !(inputPayload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  const entry = jwsAlgorithm(alg);
  const data = concat(encodedProtected !== void 0 ? encode(encodedProtected) : new Uint8Array(), encode("."), typeof inputPayload === "string" ? b64 ? shared[2] ??= encodeBase64url(inputPayload, "payload", JWSInvalid) : encoder.encode(inputPayload) : inputPayload);
  const signature = decodeBase64url(jws.signature, "signature", JWSInvalid);
  const k = await prepareKey(entry, key, "verify");
  const verified = await verify(entry, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    payload = decodeBase64url(inputPayload, "payload", JWSInvalid);
  } else if (typeof inputPayload === "string") {
    payload = encoder.encode(inputPayload);
  } else {
    payload = inputPayload;
  }
  return [payload, parsedProt, b64, k, resolvedKey];
}
__name(verifySignature, "verifySignature");
__name2(verifySignature, "verifySignature");
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key);
}
__name(verifyCompact, "verifyCompact");
__name2(verifyCompact, "verifyCompact");
var epoch = /* @__PURE__ */ __name2((date) => Math.floor(date.getTime() / 1e3), "epoch");
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var checkFailed = "check_failed";
function secs(str) {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const numericDate2 = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate2;
  }
  return numericDate2;
}
__name(secs, "secs");
__name2(secs, "secs");
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
__name2(validateInput, "validateInput");
function numericDate(value, label) {
  if (typeof value === "number")
    return validateInput(label, value);
  if (value instanceof Date)
    return validateInput(label, epoch(value));
  return epoch(/* @__PURE__ */ new Date()) + secs(value);
}
__name(numericDate, "numericDate");
__name2(numericDate, "numericDate");
var normalizeTyp = /* @__PURE__ */ __name2((value) => {
  if (value.includes("/")) {
    return value.toLowerCase();
  }
  return `application/${value.toLowerCase()}`;
}, "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name2((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some((aud) => audPayload.includes(aud));
  }
  return false;
}, "checkAudiencePresence");
function validateNumericDate(payload, claim, required = false) {
  const value = payload[claim];
  if (value === void 0 && !required)
    return void 0;
  if (typeof value !== "number") {
    throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, payload, claim, "invalid");
  }
  return value;
}
__name(validateNumericDate, "validateNumericDate");
__name2(validateNumericDate, "validateNumericDate");
function unexpectedClaim(payload, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, payload, claim, checkFailed);
}
__name(unexpectedClaim, "unexpectedClaim");
__name2(unexpectedClaim, "unexpectedClaim");
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(strictDecoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", checkFailed);
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!Object.hasOwn(payload, claim)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer !== void 0 && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    unexpectedClaim(payload, "iss");
  }
  if (subject !== void 0 && payload.sub !== subject) {
    unexpectedClaim(payload, "sub");
  }
  if (audience !== void 0 && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    unexpectedClaim(payload, "aud");
  }
  const { clockTolerance } = options;
  let tolerance = 0;
  if (typeof clockTolerance === "string") {
    tolerance = secs(clockTolerance);
  } else if (clockTolerance !== void 0) {
    if (typeof clockTolerance !== "number") {
      throw new TypeError("Invalid clockTolerance option type");
    }
    tolerance = clockTolerance;
  }
  validateInput("clockTolerance option", tolerance);
  const { currentDate } = options;
  const now = validateInput("currentDate option", epoch(currentDate || /* @__PURE__ */ new Date()));
  const iat = validateNumericDate(payload, "iat", maxTokenAge !== void 0);
  const nbf = validateNumericDate(payload, "nbf");
  if (nbf !== void 0) {
    if (nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", checkFailed);
    }
  }
  const exp = validateNumericDate(payload, "exp");
  if (exp !== void 0) {
    if (exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", checkFailed);
    }
  }
  if (maxTokenAge !== void 0) {
    const age = now - iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", checkFailed);
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", checkFailed);
    }
  }
  return payload;
}
__name(validateClaimsSet, "validateClaimsSet");
__name2(validateClaimsSet, "validateClaimsSet");
var JWTClaimsBuilder = class {
  static {
    __name(this, "JWTClaimsBuilder");
  }
  static {
    __name2(this, "JWTClaimsBuilder");
  }
  #payload;
  constructor(payload) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this.#payload = structuredClone(payload);
  }
  data() {
    return encoder.encode(JSON.stringify(this.#payload));
  }
  get iss() {
    return this.#payload.iss;
  }
  set iss(value) {
    this.#payload.iss = value;
  }
  get sub() {
    return this.#payload.sub;
  }
  set sub(value) {
    this.#payload.sub = value;
  }
  get aud() {
    return this.#payload.aud;
  }
  set aud(value) {
    this.#payload.aud = value;
  }
  set jti(value) {
    this.#payload.jti = value;
  }
  set nbf(value) {
    this.#payload.nbf = numericDate(value, "setNotBefore");
  }
  set exp(value) {
    this.#payload.exp = numericDate(value, "setExpirationTime");
  }
  set iat(value) {
    if (value === void 0) {
      this.#payload.iat = epoch(/* @__PURE__ */ new Date());
    } else if (typeof value === "string") {
      this.#payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value));
    } else {
      this.#payload.iat = numericDate(value, "setIssuedAt");
    }
  }
};
async function jwtVerify(jwt, key, options) {
  const verified = await verifyCompact(jwt, prepareVerify(options), key);
  if (!verified[2]) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified[1], verified[0], options);
  const result = { payload, protectedHeader: verified[1] };
  if (typeof key === "function") {
    return { ...result, key: verified[3] };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");
__name2(jwtVerify, "jwtVerify");
function unencodedPayload(protectedHeader) {
  return protectedHeader?.b64 === false && Array.isArray(protectedHeader.crit) && protectedHeader.crit.includes("b64");
}
__name(unencodedPayload, "unencodedPayload");
__name2(unencodedPayload, "unencodedPayload");
async function createSignature(input, key) {
  const { protectedHeader, unprotectedHeader } = input;
  if (!protectedHeader && !unprotectedHeader) {
    throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
  }
  if (!isDisjoint(protectedHeader, unprotectedHeader)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = { ...protectedHeader, ...unprotectedHeader };
  validateCritDuplicates(JWSInvalid, protectedHeader);
  const extensions = validateCrit(JWSInvalid, JWS_RECOGNIZED, input.crit, protectedHeader, joseHeader);
  let b64 = true;
  if (extensions.includes("b64")) {
    b64 = protectedHeader.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const entry = jwsAlgorithm(alg);
  let payloadS;
  let payloadB;
  if (b64) {
    const encoded = input.encoded ??= [];
    encoded[0] ??= encode2(input.payload);
    encoded[1] ??= encode(encoded[0]);
    payloadS = encoded[0];
    payloadB = encoded[1];
  } else {
    payloadB = input.payload;
    payloadS = "";
  }
  let protectedHeaderString;
  let protectedHeaderBytes;
  if (protectedHeader) {
    protectedHeaderString = encode2(JSON.stringify(protectedHeader));
    protectedHeaderBytes = encode(protectedHeaderString);
  } else {
    protectedHeaderString = "";
    protectedHeaderBytes = new Uint8Array();
  }
  const data = concat(protectedHeaderBytes, encode("."), payloadB);
  const k = await prepareKey(entry, key, "sign");
  const signature = await sign(entry, k, data);
  const jws = {
    signature: encode2(signature),
    payload: payloadS
  };
  if (protectedHeader) {
    jws.protected = protectedHeaderString;
  }
  if (unprotectedHeader) {
    jws.header = unprotectedHeader;
  }
  return jws;
}
__name(createSignature, "createSignature");
__name2(createSignature, "createSignature");
var FlattenedSign = class {
  static {
    __name(this, "FlattenedSign");
  }
  static {
    __name2(this, "FlattenedSign");
  }
  #payload;
  #protectedHeader;
  #unprotectedHeader;
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this.#payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    assertNotSet(this.#protectedHeader, "setProtectedHeader");
    this.#protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
    this.#unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    return createSignature({
      payload: this.#payload,
      protectedHeader: this.#protectedHeader,
      unprotectedHeader: this.#unprotectedHeader,
      crit: options?.crit
    }, key);
  }
};
var CompactSign = class {
  static {
    __name(this, "CompactSign");
  }
  static {
    __name2(this, "CompactSign");
  }
  #flattened;
  #protectedHeader;
  constructor(payload) {
    this.#flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this.#flattened.setProtectedHeader(protectedHeader);
    this.#protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    if (unencodedPayload(this.#protectedHeader)) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    const jws = await this.#flattened.sign(key, options);
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};
var SignJWT = class {
  static {
    __name(this, "SignJWT");
  }
  static {
    __name2(this, "SignJWT");
  }
  #protectedHeader;
  #jwt;
  constructor(payload = {}) {
    this.#jwt = new JWTClaimsBuilder(payload);
  }
  setIssuer(issuer) {
    this.#jwt.iss = issuer;
    return this;
  }
  setSubject(subject) {
    this.#jwt.sub = subject;
    return this;
  }
  setAudience(audience) {
    this.#jwt.aud = audience;
    return this;
  }
  setJti(jwtId) {
    this.#jwt.jti = jwtId;
    return this;
  }
  setNotBefore(input) {
    this.#jwt.nbf = input;
    return this;
  }
  setExpirationTime(input) {
    this.#jwt.exp = input;
    return this;
  }
  setIssuedAt(input) {
    this.#jwt.iat = input;
    return this;
  }
  setProtectedHeader(protectedHeader) {
    this.#protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig2 = new CompactSign(this.#jwt.data());
    sig2.setProtectedHeader(this.#protectedHeader);
    if (unencodedPayload(this.#protectedHeader)) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig2.sign(key, options);
  }
};
function getSecretKey(env) {
  return new TextEncoder().encode(env.JWT_SECRET);
}
__name(getSecretKey, "getSecretKey");
__name2(getSecretKey, "getSecretKey");
async function createSessionToken(user, env) {
  return await new SignJWT({ email: user.email, role: user.role ?? "student" }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("7d").setIssuer("saberlab").sign(getSecretKey(env));
}
__name(createSessionToken, "createSessionToken");
__name2(createSessionToken, "createSessionToken");
async function verifySession(request, env) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), getSecretKey(env), {
      issuer: "saberlab"
    });
    return { id: payload.sub, email: payload.email, role: payload.role ?? null };
  } catch {
    return null;
  }
}
__name(verifySession, "verifySession");
__name2(verifySession, "verifySession");
async function onRequestGet2({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl = env.APP_URL || request.headers.get("origin") || "http://localhost:5173";
  const redirectUri = new URL("/api/auth/callback", appUrl).toString();
  if (error) {
    return Response.redirect(`${appUrl}/login?error=${error}`, 302);
  }
  if (!code) {
    return Response.redirect(`${appUrl}/login?error=missing_code`, 302);
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      const errorMessage = tokens.error_description || tokens.error || "Token exchange failed";
      return new Response(`OAuth token exchange failed: ${errorMessage}`, { status: 500 });
    }
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!userRes.ok) {
      const errorText = await userRes.text();
      return new Response(`Google userinfo fetch failed: ${userRes.status} ${userRes.statusText} - ${errorText}`, { status: 500 });
    }
    const googleUser = await userRes.json();
    const email = (googleUser.email || "").toLowerCase();
    if (!email) {
      return Response.redirect(`${appUrl}/login?error=no_email`, 302);
    }
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS perfiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();
    const userId = googleUser.id || email;
    let profile = await env.DB.prepare(
      "SELECT id, email, full_name, avatar_url, role FROM perfiles WHERE id = ?"
    ).bind(userId).first();
    if (!profile) {
      const role = email === (env.ADMIN_EMAIL || "").toLowerCase() ? "admin" : "student";
      await env.DB.prepare(
        `INSERT INTO perfiles (id, email, full_name, avatar_url, role, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      ).bind(userId, email, googleUser.name || null, googleUser.picture || null, role).run();
      profile = { id: userId, email, full_name: googleUser.name || null, avatar_url: googleUser.picture || null, role };
    } else if (email === (env.ADMIN_EMAIL || "").toLowerCase() && profile.role !== "admin") {
      await env.DB.prepare("UPDATE perfiles SET role = 'admin' WHERE id = ?").bind(userId).run();
      profile.role = "admin";
    }
    const token = await createSessionToken(profile, env);
    return Response.redirect(`${appUrl}/dashboard#token=${encodeURIComponent(token)}`, 302);
  } catch (err) {
    return new Response(`Auth callback error: ${err.message || err}`, { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestGet3({ env, data }) {
  const userId = data.user.id;
  const profile = await env.DB.prepare(
    "SELECT id, email, full_name, avatar_url, role FROM perfiles WHERE id = ?"
  ).bind(userId).first();
  if (!profile) {
    return Response.json({ error: "Perfil no encontrado" }, { status: 404 });
  }
  return Response.json({ profile });
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestGet4({ request, env }) {
  const origin = request.headers.get("origin") || env.APP_URL || "http://localhost:5173";
  const appUrl = new URL(origin).origin;
  const redirectUri = new URL("/api/auth/callback", appUrl).toString();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    include_granted_scopes: "true",
    prompt: "select_account"
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestGet5() {
  return Response.json([]);
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
async function onRequestGet6({ request, env, data }) {
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get("evaluation_key");
  if (evaluationKey) {
    const { results: results2 } = await env.DB.prepare(
      "SELECT * FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? ORDER BY created_at DESC"
    ).bind(data.user.id, evaluationKey).all();
    return Response.json(results2);
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM intentos_evaluacion WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(data.user.id).all();
  return Response.json(results);
}
__name(onRequestGet6, "onRequestGet6");
__name2(onRequestGet6, "onRequestGet");
async function onRequestPost2({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { evaluation_key, answers, score, passed, completed_at } = body;
  if (!evaluation_key) {
    return Response.json({ error: "Falta evaluation_key" }, { status: 400 });
  }
  const answersJson = answers !== void 0 ? JSON.stringify(answers) : null;
  const isFinal = completed_at != null;
  let existing;
  if (isFinal) {
    existing = await env.DB.prepare(
      "SELECT id FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? ORDER BY id DESC LIMIT 1"
    ).bind(data.user.id, evaluation_key).first();
  } else {
    existing = await env.DB.prepare(
      "SELECT id FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? AND completed_at IS NULL ORDER BY id DESC LIMIT 1"
    ).bind(data.user.id, evaluation_key).first();
  }
  let row;
  if (existing) {
    await env.DB.prepare(
      `UPDATE intentos_evaluacion SET
         answers = COALESCE(?, answers),
         score = COALESCE(?, score),
         passed = COALESCE(?, passed),
         completed_at = COALESCE(?, completed_at)
       WHERE id = ?`
    ).bind(
      answersJson ?? null,
      typeof score === "number" ? score : null,
      typeof passed === "boolean" ? passed ? 1 : 0 : null,
      completed_at ?? null,
      existing.id
    ).run();
    row = await env.DB.prepare("SELECT * FROM intentos_evaluacion WHERE id = ?").bind(existing.id).first();
  } else {
    const { meta } = await env.DB.prepare(
      `INSERT INTO intentos_evaluacion (user_id, evaluation_key, answers, score, passed, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      data.user.id,
      evaluation_key,
      answersJson,
      typeof score === "number" ? score : 0,
      passed ? 1 : 0,
      completed_at ?? null
    ).run();
    row = await env.DB.prepare("SELECT * FROM intentos_evaluacion WHERE id = ?").bind(meta.last_row_id).first();
  }
  return Response.json(row);
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestGet7({ request, env, data }) {
  await ensureCodesSchema(env);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const row = await env.DB.prepare("SELECT * FROM codigos_grupo WHERE id = ?").bind(id).first();
    return Response.json(row || null);
  }
  const { results } = await env.DB.prepare("SELECT * FROM codigos_grupo ORDER BY created_at DESC").all();
  return Response.json(results);
}
__name(onRequestGet7, "onRequestGet7");
__name2(onRequestGet7, "onRequestGet");
async function onRequestPost3({ request, env, data }) {
  await ensureCodesSchema(env);
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { group_id, code, expires_at } = body;
  if (!group_id || !code) {
    return Response.json({ error: "Falta group_id o code" }, { status: 400 });
  }
  const { meta } = await env.DB.prepare(
    `INSERT INTO codigos_grupo (group_id, code, expires_at)
     VALUES (?, ?, ?)`
  ).bind(group_id, code, expires_at ?? null).run();
  const row = await env.DB.prepare("SELECT * FROM codigos_grupo WHERE id = ?").bind(meta.last_row_id).first();
  return Response.json(row);
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestDelete({ request, env, data }) {
  await ensureCodesSchema(env);
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Falta el id" }, { status: 400 });
  }
  await env.DB.prepare("DELETE FROM codigos_grupo WHERE id = ?").bind(id).run();
  return Response.json({ success: true });
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
async function ensureCodesSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS codigos_grupo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      code TEXT UNIQUE NOT NULL,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
}
__name(ensureCodesSchema, "ensureCodesSchema");
__name2(ensureCodesSchema, "ensureCodesSchema");
async function onRequestGet8({ request, env }) {
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get("key");
  const id = url.searchParams.get("id");
  await ensureEvaluationsSchema(env);
  if (evaluationKey) {
    const row = await env.DB.prepare(
      "SELECT * FROM evaluaciones WHERE evaluation_key = ? LIMIT 1"
    ).bind(evaluationKey).first();
    if (!row) return Response.json(null);
    return Response.json(parseEvaluationRow(row));
  }
  if (id) {
    const row = await env.DB.prepare("SELECT * FROM evaluaciones WHERE id = ? LIMIT 1").bind(id).first();
    if (!row) return Response.json(null);
    return Response.json(parseEvaluationRow(row));
  }
  const { results } = await env.DB.prepare("SELECT * FROM evaluaciones ORDER BY created_at DESC").all();
  return Response.json(results.map(parseEvaluationRow));
}
__name(onRequestGet8, "onRequestGet8");
__name2(onRequestGet8, "onRequestGet");
async function onRequestPost4({ request, env }) {
  await ensureEvaluationsSchema(env);
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { id, course_id, module_id, evaluation_key, title, description, instructions, questions, time_limit, passing_score, points, is_published, type } = body;
  const questionsText = questions ? JSON.stringify(questions) : null;
  if (id) {
    await env.DB.prepare(
      `UPDATE evaluaciones SET
         course_id = COALESCE(?, course_id),
         module_id = COALESCE(?, module_id),
         evaluation_key = COALESCE(?, evaluation_key),
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         instructions = COALESCE(?, instructions),
         questions = COALESCE(?, questions),
         time_limit = COALESCE(?, time_limit),
         passing_score = COALESCE(?, passing_score),
         points = COALESCE(?, points),
         is_published = COALESCE(?, is_published),
         type = COALESCE(?, type)
       WHERE id = ?`
    ).bind(
      course_id ?? null,
      module_id ?? null,
      evaluation_key ?? null,
      title ?? null,
      description ?? null,
      instructions ?? null,
      questionsText,
      time_limit ?? null,
      passing_score ?? null,
      points ?? null,
      is_published ?? null,
      type ?? null,
      id
    ).run();
    const row2 = await env.DB.prepare("SELECT * FROM evaluaciones WHERE id = ?").bind(id).first();
    return Response.json(parseEvaluationRow(row2));
  }
  const { meta } = await env.DB.prepare(
    `INSERT INTO evaluaciones (
       course_id, module_id, evaluation_key, title, description, instructions,
       questions, time_limit, passing_score, points, is_published, type, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    course_id ?? null,
    module_id ?? null,
    evaluation_key ?? null,
    title ?? null,
    description ?? null,
    instructions ?? null,
    questionsText,
    time_limit ?? null,
    passing_score ?? null,
    points ?? null,
    is_published ? 1 : 0,
    type ?? null
  ).run();
  const row = await env.DB.prepare("SELECT * FROM evaluaciones WHERE id = ?").bind(meta.last_row_id).first();
  return Response.json(parseEvaluationRow(row));
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestDelete2({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Falta el id" }, { status: 400 });
  }
  await env.DB.prepare("DELETE FROM evaluaciones WHERE id = ?").bind(id).run();
  return Response.json({ success: true });
}
__name(onRequestDelete2, "onRequestDelete2");
__name2(onRequestDelete2, "onRequestDelete");
function parseEvaluationRow(row) {
  if (!row) return null;
  return {
    ...row,
    questions: typeof row.questions === "string" && row.questions ? safeParseJSON(row.questions) : row.questions,
    is_published: row.is_published === 1 || row.is_published === true
  };
}
__name(parseEvaluationRow, "parseEvaluationRow");
__name2(parseEvaluationRow, "parseEvaluationRow");
function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
__name(safeParseJSON, "safeParseJSON");
__name2(safeParseJSON, "safeParseJSON");
async function ensureEvaluationsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS evaluaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      module_id INTEGER,
      evaluation_key TEXT,
      title TEXT,
      description TEXT,
      instructions TEXT,
      questions TEXT,
      time_limit INTEGER,
      passing_score INTEGER,
      points INTEGER,
      is_published INTEGER NOT NULL DEFAULT 0,
      type TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
  for (const column of ["evaluation_key", "module_id", "passing_score", "points", "type"]) {
    try {
      await env.DB.prepare(`ALTER TABLE evaluaciones ADD COLUMN ${column} TEXT`).run();
    } catch {
    }
  }
}
__name(ensureEvaluationsSchema, "ensureEvaluationsSchema");
__name2(ensureEvaluationsSchema, "ensureEvaluationsSchema");
async function onRequestGet9({ request, env, data }) {
  await ensureGroupsSchema(env);
  const url = new URL(request.url);
  const courseId = url.searchParams.get("course_id");
  const groupId = url.searchParams.get("group_id");
  if (groupId) {
    const { results: results2 } = await env.DB.prepare(
      `SELECT p.id, p.email, p.full_name
       FROM grupos_usuario gu
       JOIN perfiles p ON p.id = gu.user_id
       WHERE gu.group_id = ?`
    ).bind(groupId).all();
    return Response.json(results2);
  }
  if (courseId) {
    const numId = parseInt(courseId, 10);
    const { results: results2 } = await env.DB.prepare(
      `SELECT g.id, g.course_id, g.name, g.teacher, COUNT(gu.user_id) AS studentCount
       FROM grupos g
       LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
       WHERE g.course_id = ? OR g.course_id = ? OR CAST(g.course_id AS TEXT) = ?
       GROUP BY g.id`
    ).bind(isNaN(numId) ? courseId : numId, courseId, courseId).all();
    return Response.json(results2);
  }
  const { results } = await env.DB.prepare(
    `SELECT g.id, g.course_id, g.name, g.teacher, COUNT(gu.user_id) AS total
     FROM grupos g
     LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
     GROUP BY g.id`
  ).all();
  return Response.json(results);
}
__name(onRequestGet9, "onRequestGet9");
__name2(onRequestGet9, "onRequestGet");
async function onRequestPost5({ request, env, data }) {
  await ensureGroupsSchema(env);
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { id, course_id, name, teacher } = body;
  if (!name) {
    return Response.json({ error: "Falta el nombre del grupo" }, { status: 400 });
  }
  if (id) {
    await env.DB.prepare(
      `UPDATE grupos SET
         name = COALESCE(?, name),
         teacher = COALESCE(?, teacher)
       WHERE id = ?`
    ).bind(name, teacher ?? null, id).run();
    const row2 = await env.DB.prepare("SELECT * FROM grupos WHERE id = ?").bind(id).first();
    return Response.json(row2);
  }
  if (!course_id) {
    return Response.json({ error: "Falta el course_id" }, { status: 400 });
  }
  const { meta } = await env.DB.prepare(
    `INSERT INTO grupos (course_id, name, teacher)
     VALUES (?, ?, ?)`
  ).bind(course_id, name, teacher ?? null).run();
  const row = await env.DB.prepare("SELECT * FROM grupos WHERE id = ?").bind(meta.last_row_id).first();
  return Response.json(row);
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
async function onRequestPatch({ request, env, data }) {
  await ensureGroupsSchema(env);
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { group_id, user_id } = body;
  if (!group_id || !user_id) {
    return Response.json({ error: "Faltan group_id o user_id" }, { status: 400 });
  }
  const numGroupId = parseInt(group_id, 10);
  await env.DB.prepare(
    `DELETE FROM grupos_usuario WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
  ).bind(isNaN(numGroupId) ? group_id : numGroupId, group_id, group_id, user_id).run();
  return Response.json({ success: true });
}
__name(onRequestPatch, "onRequestPatch");
__name2(onRequestPatch, "onRequestPatch");
async function onRequestDelete3({ request, env, data }) {
  await ensureGroupsSchema(env);
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Falta el id" }, { status: 400 });
  }
  const numId = parseInt(id, 10);
  await env.DB.prepare(
    "DELETE FROM grupos_usuario WHERE group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?"
  ).bind(isNaN(numId) ? id : numId, id, id).run();
  await env.DB.prepare(
    "DELETE FROM grupos WHERE id = ? OR id = ? OR CAST(id AS TEXT) = ?"
  ).bind(isNaN(numId) ? id : numId, id, id).run();
  return Response.json({ success: true, deleted_id: id });
}
__name(onRequestDelete3, "onRequestDelete3");
__name2(onRequestDelete3, "onRequestDelete");
async function ensureGroupsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT
    )
  `).run();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();
}
__name(ensureGroupsSchema, "ensureGroupsSchema");
__name2(ensureGroupsSchema, "ensureGroupsSchema");
async function onRequestGet10({ request, env, data }) {
  await ensureLessonProgressSchema(env);
  const url = new URL(request.url);
  const lessonId = url.searchParams.get("lesson_id");
  if (lessonId) {
    const row = await env.DB.prepare(
      "SELECT * FROM progreso_lecciones WHERE user_id = ? AND lesson_id = ? LIMIT 1"
    ).bind(data.user.id, lessonId).first();
    if (!row) return Response.json(null);
    return Response.json(parseLessonProgressRow(row));
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM progreso_lecciones WHERE user_id = ? ORDER BY updated_at DESC"
  ).bind(data.user.id).all();
  return Response.json((results || []).map(parseLessonProgressRow));
}
__name(onRequestGet10, "onRequestGet10");
__name2(onRequestGet10, "onRequestGet");
async function onRequestPost6({ request, env, data }) {
  await ensureLessonProgressSchema(env);
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const lessonId = body.lesson_id;
  const status = body.status || "completed";
  const progress = typeof body.progress === "number" ? body.progress : 100;
  const completedAt = body.completed_at || (status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null);
  if (!lessonId) {
    return Response.json({ error: "Falta lesson_id" }, { status: 400 });
  }
  const userId = data.user.id;
  await env.DB.prepare(`
    INSERT INTO progreso_lecciones (user_id, lesson_id, status, progress, completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      status = excluded.status,
      progress = excluded.progress,
      completed_at = COALESCE(excluded.completed_at, progreso_lecciones.completed_at),
      updated_at = datetime('now')
  `).bind(userId, lessonId, status, progress, completedAt).run();
  try {
    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM progreso_lecciones WHERE user_id = ? AND status = 'completed'"
    ).bind(userId).first();
    const completedCount = countRow?.count || 0;
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_usuario (
        user_id TEXT PRIMARY KEY,
        data TEXT
      )
    `).run();
    const userProgRow = await env.DB.prepare(
      "SELECT data FROM progreso_usuario WHERE user_id = ?"
    ).bind(userId).first();
    let progData = { overall_progress: 0, streak_days: 1, total_hours: 0, lessons_completed: 0 };
    if (userProgRow?.data) {
      try {
        progData = { ...progData, ...JSON.parse(userProgRow.data) };
      } catch {
      }
    }
    progData.lessons_completed = completedCount;
    progData.overall_progress = Math.min(100, Math.round(completedCount / 30 * 100));
    await env.DB.prepare(`
      INSERT INTO progreso_usuario (user_id, data)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
    `).bind(userId, JSON.stringify(progData)).run();
  } catch (err) {
    console.error("Error updating progreso_usuario:", err);
  }
  return Response.json({
    success: true,
    user_id: userId,
    lesson_id: lessonId,
    status,
    progress,
    completed_at: completedAt
  });
}
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
async function ensureLessonProgressSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_lecciones (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      status TEXT DEFAULT 'in_progress',
      progress INTEGER DEFAULT 0,
      completed_at TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_id)
    )
  `).run();
}
__name(ensureLessonProgressSchema, "ensureLessonProgressSchema");
__name2(ensureLessonProgressSchema, "ensureLessonProgressSchema");
function parseLessonProgressRow(row) {
  return {
    user_id: row.user_id,
    lesson_id: row.lesson_id,
    status: row.status,
    progress: row.progress,
    completed_at: row.completed_at,
    updated_at: row.updated_at
  };
}
__name(parseLessonProgressRow, "parseLessonProgressRow");
__name2(parseLessonProgressRow, "parseLessonProgressRow");
async function onRequestGet11({ env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT,
      message TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
  const { results } = await env.DB.prepare(
    "SELECT * FROM notificaciones WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(data.user.id).all();
  return Response.json(results);
}
__name(onRequestGet11, "onRequestGet11");
__name2(onRequestGet11, "onRequestGet");
async function onRequestPost7({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  if (body.all) {
    await env.DB.prepare("UPDATE notificaciones SET read = 1 WHERE user_id = ?").bind(data.user.id).run();
    return Response.json({ success: true });
  }
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: "Faltan ids" }, { status: 400 });
  }
  const placeholders = body.ids.map(() => "?").join(",");
  await env.DB.prepare(
    `UPDATE notificaciones SET read = 1 WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();
  return Response.json({ success: true });
}
__name(onRequestPost7, "onRequestPost7");
__name2(onRequestPost7, "onRequestPost");
async function onRequestDelete4({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  if (body.all) {
    await env.DB.prepare("DELETE FROM notificaciones WHERE user_id = ?").bind(data.user.id).run();
    return Response.json({ success: true });
  }
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: "Faltan ids" }, { status: 400 });
  }
  const placeholders = body.ids.map(() => "?").join(",");
  await env.DB.prepare(
    `DELETE FROM notificaciones WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();
  return Response.json({ success: true });
}
__name(onRequestDelete4, "onRequestDelete4");
__name2(onRequestDelete4, "onRequestDelete");
async function onRequestGet12({ env, data }) {
  const userId = data.user.id;
  const profile = await env.DB.prepare(
    `SELECT id, email, full_name, avatar_url, role
     FROM perfiles WHERE id = ?`
  ).bind(userId).first();
  if (!profile) {
    return Response.json({ error: "Perfil no encontrado" }, { status: 404 });
  }
  const { results: courses } = await env.DB.prepare(
    `SELECT c.id, c.name, c.abbr, c.slug
     FROM inscripciones i
     JOIN cursos c ON c.id = i.course_id
     WHERE i.user_id = ?`
  ).bind(userId).all();
  return Response.json({ profile, courses });
}
__name(onRequestGet12, "onRequestGet12");
__name2(onRequestGet12, "onRequestGet");
async function onRequestGet13({ env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_usuario (
      user_id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();
  const row = await env.DB.prepare(
    "SELECT data FROM progreso_usuario WHERE user_id = ?"
  ).bind(data.user.id).first();
  try {
    const parsed = JSON.parse(row.data || "{}");
    return Response.json(parsed);
  } catch {
    return Response.json({ overall_progress: 0, streak_days: 0, total_hours: 0, lessons_completed: 0 });
  }
}
__name(onRequestGet13, "onRequestGet13");
__name2(onRequestGet13, "onRequestGet");
async function onRequestPost8({ request, env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_usuario (
      user_id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const userId = data.user.id;
  const current = await env.DB.prepare(
    "SELECT data FROM progreso_usuario WHERE user_id = ?"
  ).bind(userId).first();
  let existing = {};
  if (current?.data) {
    try {
      existing = JSON.parse(current.data);
    } catch {
    }
  }
  const merged = { ...existing, ...body };
  await env.DB.prepare(`
    INSERT INTO progreso_usuario (user_id, data)
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
  `).bind(userId, JSON.stringify(merged)).run();
  return Response.json(merged);
}
__name(onRequestPost8, "onRequestPost8");
__name2(onRequestPost8, "onRequestPost");
async function onRequestGet14({ request, env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS solicitudes_acceso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (data.user.role !== "admin" && normalizedEmail !== data.user.email?.toLowerCase()) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }
    const row = await env.DB.prepare(
      "SELECT * FROM solicitudes_acceso WHERE lower(email) = ? ORDER BY created_at DESC"
    ).bind(normalizedEmail).first();
    return Response.json(row || null);
  }
  if (data.user.role !== "admin") {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM solicitudes_acceso ORDER BY created_at DESC"
  ).all();
  return Response.json(results);
}
__name(onRequestGet14, "onRequestGet14");
__name2(onRequestGet14, "onRequestGet");
async function onRequestPost9({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { name, email, status = "pending" } = body;
  if (!email) {
    return Response.json({ error: "Falta el email" }, { status: 400 });
  }
  await env.DB.prepare(
    `INSERT INTO solicitudes_acceso (name, email, status, created_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).bind(name || null, email.trim().toLowerCase(), status).run();
  return Response.json({ success: true });
}
__name(onRequestPost9, "onRequestPost9");
__name2(onRequestPost9, "onRequestPost");
async function onRequestPatch2({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { id, name, email, status } = body;
  if (!id) {
    return Response.json({ error: "Falta el id" }, { status: 400 });
  }
  const row = await env.DB.prepare("SELECT * FROM solicitudes_acceso WHERE id = ?").bind(id).first();
  if (!row) {
    return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  const normalizedEmail = email?.trim().toLowerCase();
  const isOwner = data.user.role === "admin" || normalizedEmail === data.user.email?.toLowerCase() || row.email.toLowerCase() === data.user.email?.toLowerCase();
  if (!isOwner) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }
  await env.DB.prepare(
    `UPDATE solicitudes_acceso SET
       name = COALESCE(?, name),
       email = COALESCE(?, email),
       status = COALESCE(?, status)
     WHERE id = ?`
  ).bind(name || null, normalizedEmail || null, status || null, id).run();
  return Response.json({ success: true });
}
__name(onRequestPatch2, "onRequestPatch2");
__name2(onRequestPatch2, "onRequestPatch");
async function onRequestGet15({ env }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS visibilidad_curso (
      course_id INTEGER PRIMARY KEY,
      lecciones TEXT
    )
  `).run();
  const { results } = await env.DB.prepare(
    "SELECT course_id, lecciones FROM visibilidad_curso"
  ).all();
  const visibilityMap = {};
  results.forEach((row) => {
    try {
      visibilityMap[row.course_id] = JSON.parse(row.lecciones) || {};
    } catch {
      visibilityMap[row.course_id] = {};
    }
  });
  return Response.json(visibilityMap);
}
__name(onRequestGet15, "onRequestGet15");
__name2(onRequestGet15, "onRequestGet");
async function onRequestPost10({ request, env, data }) {
  if (data.user.role !== "admin") {
    return Response.json({ error: "Solo administradores" }, { status: 403 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inv\xE1lido" }, { status: 400 });
  }
  const { course_id, lecciones } = body;
  if (!course_id) {
    return Response.json({ error: "Falta course_id" }, { status: 400 });
  }
  await env.DB.prepare(
    `INSERT INTO visibilidad_curso (course_id, lecciones)
     VALUES (?, ?)
     ON CONFLICT (course_id) DO UPDATE SET lecciones = excluded.lecciones`
  ).bind(course_id, JSON.stringify(lecciones ?? {})).run();
  return Response.json({ success: true });
}
__name(onRequestPost10, "onRequestPost10");
__name2(onRequestPost10, "onRequestPost");
var PUBLIC_PATHS = ["/api/auth/start", "/api/auth/callback"];
async function onRequest(context) {
  const url = new URL(context.request.url);
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return context.next();
  }
  const user = await verifySession(context.request, context.env);
  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const profile = await context.env.DB.prepare(
      "SELECT id, email, full_name, role FROM perfiles WHERE id = ? OR email = ?"
    ).bind(user.id, user.email).first();
    context.data.user = {
      ...user,
      id: profile?.id || user.id,
      email: profile?.email || user.email,
      role: profile?.role || user.role || (context.env.ADMIN_EMAIL && user.email?.toLowerCase() === context.env.ADMIN_EMAIL.toLowerCase() ? "admin" : "student")
    };
  } catch {
    context.data.user = user;
  }
  return context.next();
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
var routes = [
  {
    routePath: "/api/admin/courses",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/plataforma",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/auth/callback",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/auth/me",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/auth/start",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/achievements",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/attempts",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/attempts",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/codes",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/codes",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/codes",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/evaluations",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/evaluations",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/evaluations",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/groups",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete3]
  },
  {
    routePath: "/api/groups",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/groups",
    mountPath: "/api",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/groups",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/lesson-progress",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/lesson-progress",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/notifications",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete4]
  },
  {
    routePath: "/api/notifications",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/notifications",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/profile",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/progress",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/progress",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/requests",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/requests",
    mountPath: "/api",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch2]
  },
  {
    routePath: "/api/requests",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/visibility",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/visibility",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api",
    mountPath: "/api",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode2 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode2(value, key);
        });
      } else {
        params[key.name] = decode2(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode3 = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode3(token));
    } else {
      var prefix = escapeString(encode3(token.prefix));
      var suffix = escapeString(encode3(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-bnwxMQ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-bnwxMQ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
