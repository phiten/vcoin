/*!
 * x509.js - x509 handling for bcoin
 * Copyright (c) 2016-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const assert = require('assert');
const ASN1 = require('../utils/asn1');
const PEM = require('../utils/pem');
const util = require('../utils/util');
const digest = require('../crypto/digest');
const pk = require('./pk');
const certs = require('./certs');

/**
 * @exports bip70/x509
 */

const x509 = exports;

/**
 * Map of trusted root certs.
 * @type {Set}
 */

x509.trusted = new Set();

/**
 * Whether to allow untrusted root
 * certs during verification.
 * @type {Boolean}
 */

x509.allowUntrusted = false;

/**
 * OID to algorithm map for PKI.
 * @const {Object}
 * @see https://www.ietf.org/rfc/rfc2459.txt
 * @see https://tools.ietf.org/html/rfc3279
 * @see http://oid-info.com/get/1.2.840.10040.4
 * @see http://oid-info.com/get/1.2.840.113549.1.1
 * @see http://oid-info.com/get/1.2.840.10045.4.3
 */

x509.oid = {
  '1.2.840.10040.4.1'    : { key: 'dsa',   hash: null     },
  '1.2.840.10040.4.2'    : { key: 'dsa',   hash: null     },
  '1.2.840.10040.4.3'    : { key: 'dsa',   hash: 'sha1'   },
  '1.2.840.113549.1.1.1' : { key: 'rsa',   hash: null     },
  '1.2.840.113549.1.1.2' : { key: 'rsa',   hash: 'md2'    },
  '1.2.840.113549.1.1.3' : { key: 'rsa',   hash: 'md4'    },
  '1.2.840.113549.1.1.4' : { key: 'rsa',   hash: 'md5'    },
  '1.2.840.113549.1.1.5' : { key: 'rsa',   hash: 'sha1'   },
  '1.2.840.113549.1.1.11': { key: 'rsa',   hash: 'sha256' },
  '1.2.840.113549.1.1.12': { key: 'rsa',   hash: 'sha384' },
  '1.2.840.113549.1.1.13': { key: 'rsa',   hash: 'sha512' },
  '1.2.840.113549.1.1.14': { key: 'rsa',   hash: 'sha224' },
  '1.2.840.10045.2.1'    : { key: 'ecdsa', hash: null     },
  '1.2.840.10045.4.1'    : { key: 'ecdsa', hash: 'sha1'   },
  '1.2.840.10045.4.3.1'  : { key: 'ecdsa', hash: 'sha224' },
  '1.2.840.10045.4.3.2'  : { key: 'ecdsa', hash: 'sha256' },
  '1.2.840.10045.4.3.3'  : { key: 'ecdsa', hash: 'sha384' },
  '1.2.840.10045.4.3.4'  : { key: 'ecdsa', hash: 'sha512' }
};

/**
 * OID to curve name map for ECDSA.
 * @type {Object}
 */

x509.curves = {
  '1.3.132.0.33': 'p224',
  '1.2.840.10045.3.1.7': 'p256',
  '1.3.132.0.34': 'p384',
  '1.3.132.0.35': 'p521'
};

/**
 * Retrieve cert value by OID.
 * @param {Object} cert
 * @param {String} oid
 * @returns {String}
 */

x509.getSubjectOID = function getSubjectOID(cert, oid) {
  const subject = cert.tbs.subject;

  for (const entry of subject) {
    if (entry.type === oid)
      return entry.value;
  }

  return null;
};

/**
 * Try to retrieve CA name by checking
 * for a few different OIDs.
 * @param {Object} cert
 * @returns {String}
 */

x509.getCAName = function getCAName(cert) {
  // This seems to work the best in practice
  // for getting a human-readable and
  // descriptive name for the CA.
  // See:
  //   http://oid-info.com/get/2.5.4
  // Precedence:
  //   (3) commonName
  //   (11) organizationUnitName
  //   (10) organizationName
  return x509.getSubjectOID(cert, '2.5.4.3')
    || x509.getSubjectOID(cert, '2.5.4.11')
    || x509.getSubjectOID(cert, '2.5.4.10')
    || 'Unknown';
};

/**
 * Test whether a cert is trusted by hashing
 * and looking it up in the trusted map.
 * @param {Object} cert
 * @returns {Buffer}
 */

x509.isTrusted = function isTrusted(cert) {
  const fingerprint = digest.sha256(cert.raw);
  const hash = fingerprint.toString('hex');
  return x509.trusted.has(hash);
};

/**
 * Add root certificates to the trusted map.
 * @param {Buffer[]} certs
 */

x509.setTrust = function setTrust(certs) {
  assert(Array.isArray(certs), 'Certs must be an array.');

  for (let cert of certs) {
    if (typeof cert === 'string') {
      const pem = PEM.decode(cert);
      assert(pem.type === 'certificate', 'Must add certificates to trust.');
      cert = pem.data;
    }

    assert(Buffer.isBuffer(cert), 'Certificates must be PEM or DER.');

    cert = x509.parse(cert);

    const hash = digest.sha256(cert.raw);
    const fingerprint = hash.toString('hex');

    x509.trusted.add(fingerprint);
  }
};

/**
 * Add root certificate fingerprints to the trusted map.
 * @param {Hash[]} hashes
 */

x509.setFingerprints = function setFingerprints(hashes) {
  assert(Array.isArray(hashes), 'Certs must be an array.');

  for (let hash of hashes) {
    if (typeof hash === 'string')
      hash = Buffer.from(hash, 'hex');

    assert(Buffer.isBuffer(hash), 'Fingerprint must be a buffer.');
    assert(hash.length === 32, 'Fingerprint must be a sha256 hash.');

    hash = hash.toString('hex');
    x509.trusted.add(hash);
  }
};

/**
 * Retrieve key algorithm from cert.
 * @param {Object} cert
 * @returns {Object}
 */

x509.getKeyAlgorithm = function getKeyAlgorithm(cert) {
  const oid = cert.tbs.pubkey.alg.alg;
  const alg = x509.oid[oid];

  if (!alg)
    throw new Error(`Unknown key algorithm: ${oid}.`);

  return alg;
};

/**
 * Retrieve signature algorithm from cert.
 * @param {Object} cert
 * @returns {Object}
 */

x509.getSigAlgorithm = function getSigAlgorithm(cert) {
  const oid = cert.sigAlg.alg;
  const alg = x509.oid[oid];

  if (!alg || !alg.hash)
    throw new Error(`Unknown signature algorithm: ${oid}.`);

  return alg;
};

/**
 * Lookup curve based on key parameters.
 * @param {Buffer} params
 * @returns {Object}
 */

x509.getCurve = function getCurve(params) {
  let oid;

  try {
    oid = ASN1.parseOID(params);
  } catch (e) {
    throw new Error('Could not parse curve OID.');
  }

  const curve = x509.curves[oid];

  if (!curve)
    throw new Error(`Unknown ECDSA curve: ${oid}.`);

  return curve;
};

/**
 * Parse a DER formatted cert.
 * @param {Buffer} der
 * @returns {Object|null}
 */

x509.parse = function parse(der) {
  try {
    return ASN1.parseCert(der);
  } catch (e) {
    throw new Error('Could not parse DER certificate.');
  }
};

/**
 * Get cert public key.
 * @param {Object} cert
 * @returns {Object|null}
 */

x509.getPublicKey = function getPublicKey(cert) {
  const alg = x509.getKeyAlgorithm(cert);
  const key = cert.tbs.pubkey.pubkey;
  const params = cert.tbs.pubkey.alg.params;
  let curve = null;

  if (alg.key === 'ecdsa') {
    if (!params)
      throw new Error('No curve selected for ECDSA (cert).');

    curve = x509.getCurve(params);
  }

  return {
    alg: alg.key,
    data: key,
    params: params,
    curve: curve
  };
};

/**
 * Verify cert expiration time.
 * @param {Object} cert
 * @returns {Boolean}
 */

x509.verifyTime = function verifyTime(cert) {
  const time = cert.tbs.validity;
  const now = util.now();
  return now > time.notBefore && now < time.notAfter;
};

/**
 * Get signature key info from cert chain.
 * @param {Buffer} key
 * @param {Buffer[]} chain
 * @returns {Object}
 */

x509.getSigningKey = function getSigningKey(key, chain) {
  assert(chain.length !== 0, 'No chain available.');

  if (typeof key === 'string') {
    let curve = null;

    key = PEM.decode(key);

    if (key.alg === 'ecdsa') {
      if (!key.params)
        throw new Error('No curve selected for ECDSA (key).');

      curve = x509.getCurve(key.params);
    }

    key = {
      alg: key.alg,
      data: key.data,
      params: key.params,
      curve: curve
    };
  } else {
    const cert = x509.parse(chain[0]);
    const pub = x509.getPublicKey(cert);

    key = {
      alg: pub.alg,
      data: key,
      params: pub.params,
      curve: pub.curve
    };
  }

  return key;
};

/**
 * Sign a hash with the chain signing key.
 * @param {String} hash
 * @param {Buffer} msg
 * @param {Buffer} key
 * @param {Buffer[]} chain
 * @returns {Buffer}
 */

x509.signSubject = function signSubject(hash, msg, key, chain) {
  const priv = x509.getSigningKey(key, chain);
  return pk.sign(hash, msg, priv);
};

/**
 * Get chain verification key.
 * @param {Buffer[]} chain
 * @returns {Object|null}
 */

x509.getVerifyKey = function getVerifyKey(chain) {
  if (chain.length === 0)
    throw new Error('No verify key available (cert chain).');

  const cert = x509.parse(chain[0]);

  return x509.getPublicKey(cert);
};

/**
 * Verify a sighash against chain verification key.
 * @param {String} hash
 * @param {Buffer} msg
 * @param {Buffer} sig
 * @param {Buffer[]} chain
 * @returns {Boolean}
 */

x509.verifySubject = function verifySubject(hash, msg, sig, chain) {
  const key = x509.getVerifyKey(chain);
  return pk.verify(hash, msg, sig, key);
};

/**
 * Parse certificate chain.
 * @param {Buffer[]} chain
 * @returns {Object[]}
 */

x509.parseChain = function parseChain(chain) {
  const certs = [];

  for (const item of chain) {
    const cert = x509.parse(item);
    certs.push(cert);
  }

  return certs;
};

/**
 * Verify all expiration times in a certificate chain.
 * @param {Object[]} chain
 * @returns {Boolean}
 */

x509.verifyTimes = function verifyTimes(chain) {
  for (const cert of chain) {
    if (!x509.verifyTime(cert))
      return false;
  }

  return true;
};

/**
 * Verify that at least one parent
 * cert in the chain is trusted.
 * @param {Object[]} chain
 * @returns {Boolean}
 */

x509.verifyTrust = function verifyTrust(chain) {
  // If trust hasn't been
  // setup, just return.
  if (x509.allowUntrusted)
    return true;

  // Make sure we trust one
  // of the certs in the chain.
  for (const cert of chain) {
    // If any certificate in the chain
    // is trusted, assume we also trust
    // the parent.
    if (x509.isTrusted(cert))
      return true;
  }

  // No trusted certs present.
  return false;
};

/**
 * Verify certificate chain.
 * @param {Object[]} certs
 */

x509.verifyChain = function verifyChain(certs) {
  const chain = x509.parseChain(certs);

  // Parse certificates and
  // check validity time.
  if (!x509.verifyTimes(chain))
    throw new Error('Invalid certificate times.');

  // Verify signatures.
  for (let i = 1; i < chain.length; i++) {
    const child = chain[i - 1];
    const parent = chain[i];
    const alg = x509.getSigAlgorithm(child);
    const key = x509.getPublicKey(parent);
    const msg = child.tbs.raw;
    const sig = child.sig;

    if (!pk.verify(alg.hash, msg, sig, key))
      throw new Error(`${alg.key} verification failed for chain.`);
  }

  // Make sure we trust one
  // of the certs in the chain.
  if (!x509.verifyTrust(chain))
    throw new Error('Certificate chain is untrusted.');

  return true;
};

/*
 * Load trusted certs.
 */

x509.setFingerprints(certs);
