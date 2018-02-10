/*!
 * network.js - bitcoin networks for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * @module protocol/networks
 */

const BN = require('../crypto/bn');

const network = exports;

/**
 * Network type list.
 * @memberof module:protocol/networks
 * @const {String[]}
 * @default
 */

network.types = ['main', 'testnet', 'regtest', 'simnet'];

/**
 * Mainnet
 * @static
 * @lends module:protocol/networks
 * @type {Object}
 */

const main = {};

/**
 * Symbolic network type.
 * @const {String}
 * @default
 */

main.type = 'main';

/**
 * Default DNS seeds.
 * @const {String[]}
 * @default
 */

main.seeds = [
  'vrmdns.vericoin.info'
];

/**
 * Packet magic number.
 * @const {Number}
 * @default
 */

main.magic = 0xdbb6c0fb;

/**
 * Default network port.
 * @const {Number}
 * @default
 */

main.port = 36988;

/**
 * Checkpoint block list.
 * @const {Object}
 */

main.checkpointMap = {
};

/**
 * Last checkpoint height.
 * @const {Number}
 * @default
 */

main.lastCheckpoint = 0;

/**
 * @const {Number}
 * @default
 */

main.halvingInterval = 0;

/**
 * Genesis block header.
 * @const {NakedBlock}
 */

main.genesis = {
  version: 1,
  hash: '3f2566fc0abcc9b2e26c737d905ff3e639a49d44cd5d11d260df3cfb62663012',
  prevBlock: '8232c0cf3bd7e05546e3d7aaaaf89fed8bc97c4df1a8c95e9249e13a2734932b',
  merkleRoot: '8431c8730b86fec4c27aad1d31c932158d814b99fcfcdf0b5893d776cf8059bc',
  time: 1472688287,
  bits: 522190847, 
  nonce: 121,
  height: 1
};

/**
 * The network's genesis block in a hex string.
 * @const {String}
 */

main.genesisBlock =
  '0100000000000000000000000000000000000000000000000000000000000000000000'
  + '00d9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97b9aa'
  + '8e4ef0ff0f1ecd513f7c01010000000100000000000000000000000000000000000000'
  + '00000000000000000000000000ffffffff4804ffff001d0104404e592054696d657320'
  + '30352f4f63742f32303131205374657665204a6f62732c204170706c65e28099732056'
  + '6973696f6e6172792c2044696573206174203536ffffffff0100f2052a010000004341'
  + '040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3eb4b10f4'
  + 'd4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9ac00000000';

/**
 * POW-related constants.
 * @enum {Number}
 * @default
 */

main.pow = {
  /**
   * Default target.
   * @const {BN}
   */

  limit: new BN(
    '00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    'hex'
  ),

  /**
   * Compact pow limit.
   * @const {Number}
   * @default
   */

  bits: 504365055,

  /**
   * Minimum chainwork for best chain.
   * @const {BN}
   */

  chainwork: new BN(
    '00000000000000000000000000000000000000000000000ba50a60f8b56c7fe0',
    'hex'
  ),

  /**
   * Desired retarget period in seconds.
   * @const {Number}
   * @default
   */

  targetTimespan: 3.85 * 24 * 60 * 60,

  /**
   * Average block time.
   * @const {Number}
   * @default
   */

  targetSpacing: 3.85 * 60,

  /**
   * Retarget interval in blocks.
   * @const {Number}
   * @default
   */

  retargetInterval: 2016,

  /**
   * Whether to reset target if a block
   * has not been mined recently.
   * @const {Boolean}
   * @default
   */

  targetReset: false,

  /**
   * Do not allow retargetting.
   * @const {Boolean}
   * @default
   */

  noRetargeting: false
};

/**
 * Block constants.
 * @enum {Number}
 * @default
 */

main.block = {
  /**
   * Height at which bip34 was activated.
   * Used for avoiding bip30 checks.
   */

  bip34height: 710000,

  /**
   * Hash of the block that activated bip34.
   */

  bip34hash: 'cf519deb9a32b4c72612ff0c42bf3a04f262fa41d4c8a7d58e763aa804d209fa',

  /**
   * Height at which bip65 was activated.
   */

  bip65height: 918684,

  /**
   * Hash of the block that activated bip65.
   */

  bip65hash: '1a31cc64827cc248b2afefd849d41dde2bb907e73ff6ef3edce077891e04b3ba',

  /**
   * Height at which bip66 was activated.
   */

  bip66height: 811879,

  /**
   * Hash of the block that activated bip66.
   */

  bip66hash: '941849dc7bbdd271a727db8fb06acd33e23a1b8b5d83f85289fa332801eece7a',

  /**
   * Safe height to start pruning.
   */

  pruneAfterHeight: 1000,

  /**
   * Safe number of blocks to keep.
   */

  keepBlocks: 288,

  /**
   * Age used for the time delta to
   * determine whether the chain is synced.
   */

  maxTipAge: 24 * 60 * 60,

  /**
   * Height at which block processing is
   * slow enough that we can output
   * logs without spamming.
   */

  slowHeight: 900000
};

/**
 * Map of historical blocks which create duplicate transactions hashes.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki
 * @const {Object}
 * @default
 */

main.bip30 = {};

/**
 * For versionbits.
 * @const {Number}
 * @default
 */

main.activationThreshold = 6048; // 75% of 8064

/**
 * Confirmation window for versionbits.
 * @const {Number}
 * @default
 */

main.minerWindow = 8064; // nPowTargetTimespan / nPowTargetSpacing * 4

/**
 * Deployments for versionbits.
 * @const {Object}
 * @default
 */

main.deployments = {
  csv: {
    name: 'csv',
    bit: 0,
    startTime: 1485561600, // January 28, 2017
    timeout: 1517356801, // January 31st, 2018
    threshold: -1,
    window: -1,
    required: false,
    force: true
  },
  segwit: {
    name: 'segwit',
    bit: 1,
    startTime: 1485561600, // January 28, 2017
    timeout: 1517356801, // January 31st, 2018
    threshold: -1,
    window: -1,
    required: true,
    force: false
  },
  testdummy: {
    name: 'testdummy',
    bit: 28,
    startTime: 1199145601, // January 1, 2008
    timeout: 1230767999, // December 31, 2008
    threshold: -1,
    window: -1,
    required: false,
    force: true
  }
};

/**
 * Deployments for versionbits (array form, sorted).
 * @const {Array}
 * @default
 */

main.deploys = [
  main.deployments.csv,
  main.deployments.segwit,
  main.deployments.testdummy
];

/**
 * Key prefixes.
 * @enum {Number}
 * @default
 */

main.keyPrefix = {
  privkey: 0xb0,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  xprivkey58: 'xprv',
  xpubkey58: 'xpub',
  coinType: 0
};

/**
 * {@link Address} prefixes.
 * @enum {Number}
 */

main.addressPrefix = {
  pubkeyhash: 0x30,
  scripthash: 0x05,
  scripthash2: 0x32,
  witnesspubkeyhash: 0x06,
  witnessscripthash: 0x0a,
  bech32: 'v'
};

/**
 * Default value for whether the mempool
 * accepts non-standard transactions.
 * @const {Boolean}
 * @default
 */

main.requireStandard = true;

/**
 * Default http port.
 * @const {Number}
 * @default
 */

main.rpcPort = 33987;

/**
 * Default min relay rate.
 * @const {Rate}
 * @default
 */

main.minRelay = 1000;

/**
 * Default normal relay rate.
 * @const {Rate}
 * @default
 */

main.feeRate = 20000000;

/**
 * Maximum normal relay rate.
 * @const {Rate}
 * @default
 */

main.maxFeeRate = 100000000;

/**
 * Whether to allow self-connection.
 * @const {Boolean}
 */

main.selfConnect = false;

/**
 * Whether to request mempool on sync.
 * @const {Boolean}
 */

main.requestMempool = false;

/*
 * Testnet (v3)
 * https://en.bitcoin.it/wiki/Testnet
 */

const testnet = {};

testnet.type = 'testnet';

testnet.seeds = [
  'testnet-seed.litecointools.com',
  'seed-b.litecoin.loshan.co.uk',
  'dnsseed-testnet.thrasher.io'
];

testnet.magic = 0xf1c8d2fd;

testnet.port = 19335;

testnet.checkpointMap = {
  2056: '8932a8789c96c516d8a1080a29c7e7e387d2397a83864f9adcaf97ba318a7417',
};

testnet.lastCheckpoint = 2056;

testnet.halvingInterval = 840000;

testnet.genesis = {
  version: 1,
  hash: 'a0293e4eeb3da6e6f56f81ed595f57880d1a21569e13eefdd951284b5a626649',
  prevBlock: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: 'd9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97',
  time: 1486949366,
  bits: 504365040,
  nonce: 293345,
  height: 0
};

testnet.genesisBlock =
  '010000000000000000000000000000000000000000000000000000000000000000000'
  + '000d9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97f6'
  + '0ba158f0ff0f1ee179040001010000000100000000000000000000000000000000000'
  + '00000000000000000000000000000ffffffff4804ffff001d0104404e592054696d65'
  + '732030352f4f63742f32303131205374657665204a6f62732c204170706c65e280997'
  + '320566973696f6e6172792c2044696573206174203536ffffffff0100f2052a010000'
  + '004341040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3e'
  + 'b4b10f4d4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9ac'
  + '00000000';

testnet.pow = {
  limit: new BN(
    '00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    'hex'
  ),
  bits: 504365055,
  chainwork: new BN(
    '0000000000000000000000000000000000000000000000000000364b0cbc3568',
    'hex'
  ),
  targetTimespan: 3.5 * 24 * 60 * 60,
  targetSpacing: 2.5 * 60,
  retargetInterval: 2016,
  targetReset: true,
  noRetargeting: false
};

testnet.block = {
  bip34height: 76,
  bip34hash: '73058ccc33da8b5479e3548c3cce4fb32a705fa9803994fd5f498bed71c77580',
  bip65height: 76,
  bip65hash: '73058ccc33da8b5479e3548c3cce4fb32a705fa9803994fd5f498bed71c77580',
  bip66height: 76,
  bip66hash: '73058ccc33da8b5479e3548c3cce4fb32a705fa9803994fd5f498bed71c77580',
  pruneAfterHeight: 1000,
  keepBlocks: 10000,
  maxTipAge: 24 * 60 * 60,
  slowHeight: 950000
};

testnet.bip30 = {};

testnet.activationThreshold = 1512; // 75% for testchains

testnet.minerWindow = 2016; // nPowTargetTimespan / nPowTargetSpacing

testnet.deployments = {
  csv: {
    name: 'csv',
    bit: 0,
    startTime: 1483228800, // March 1st, 2016
    timeout: 1517356801, // May 1st, 2017
    threshold: -1,
    window: -1,
    required: false,
    force: true
  },
  segwit: {
    name: 'segwit',
    bit: 1,
    startTime: 1483228800, // May 1st 2016
    timeout: 1517356801, // May 1st 2017
    threshold: -1,
    window: -1,
    required: true,
    force: false
  },
  testdummy: {
    name: 'testdummy',
    bit: 28,
    startTime: 1199145601, // January 1, 2008
    timeout: 1230767999, // December 31, 2008
    threshold: -1,
    window: -1,
    required: false,
    force: true
  }
};

testnet.deploys = [
  testnet.deployments.csv,
  testnet.deployments.segwit,
  testnet.deployments.testdummy
];

testnet.keyPrefix = {
  privkey: 0xef,
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
  xpubkey58: 'xpub',
  xprivkey58: 'xprv',
  coinType: 1
};

testnet.addressPrefix = {
  pubkeyhash: 0x6f,
  scripthash: 0xc4,
  scripthash2: 0x3a,
  witnesspubkeyhash: 0x03,
  witnessscripthash: 0x28,
  bech32: 'tb'
};

testnet.requireStandard = false;

testnet.rpcPort = 19332;

testnet.minRelay = 1000;

testnet.feeRate = 20000;

testnet.maxFeeRate = 60000;

testnet.selfConnect = false;

testnet.requestMempool = false;

/*
 * Regtest
 */

const regtest = {};

regtest.type = 'regtest';

regtest.seeds = [
  '127.0.0.1'
];

regtest.magic = 0xdab5bffa;

regtest.port = 19444;

regtest.checkpointMap = {};
regtest.lastCheckpoint = 0;

regtest.halvingInterval = 150;

regtest.genesis = {
  version: 1,
  hash: 'f916c456fc51df627885d7d674ed02dc88a225adb3f02ad13eb4938ff3270853',
  prevBlock: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: 'd9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97',
  time: 1296688602,
  bits: 545259519,
  nonce: 0,
  height: 0
};

regtest.genesisBlock =
  '010000000000000000000000000000000000000000000000000000000000000000000'
  + '000d9ced4ed1130f7b7faad9be25323ffafa33232a17c3edf6cfd97bee6bafbdd97da'
  + 'e5494dffff7f200000000001010000000100000000000000000000000000000000000'
  + '00000000000000000000000000000ffffffff4804ffff001d0104404e592054696d65'
  + '732030352f4f63742f32303131205374657665204a6f62732c204170706c65e280997'
  + '320566973696f6e6172792c2044696573206174203536ffffffff0100f2052a010000'
  + '004341040184710fa689ad5023690c80f3a49c8f13f8d45b8c857fbcbc8bc4a8e4d3e'
  + 'b4b10f4d4604fa08dce601aaf0f470216fe1b51850b4acf21b179c45070ac7b03a9ac'
  + '00000000';

regtest.pow = {
  limit: new BN(
    '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    'hex'
  ),
  bits: 545259519,
  chainwork: new BN(
    '0000000000000000000000000000000000000000000000000000000000000000',
    'hex'
  ),
  targetTimespan: 3.5 * 24 * 60 * 60,
  targetSpacing: 2.5 * 60,
  retargetInterval: 2016,
  targetReset: true,
  noRetargeting: true
};

regtest.block = {
  bip34height: 0xffffffff,
  bip34hash: null,
  bip65height: 1351,
  bip65hash: null,
  bip66height: 1251,
  bip66hash: null,
  pruneAfterHeight: 1000,
  keepBlocks: 10000,
  maxTipAge: 0xffffffff,
  slowHeight: 0
};

regtest.bip30 = {};

regtest.activationThreshold = 108; // 75% for testchains

regtest.minerWindow = 144; // Faster than normal for regtest

regtest.deployments = {
  csv: {
    name: 'csv',
    bit: 0,
    startTime: 0,
    timeout: 0xffffffff,
    threshold: -1,
    window: -1,
    required: false,
    force: true
  },
  segwit: {
    name: 'segwit',
    bit: 1,
    startTime: 0,
    timeout: 0xffffffff,
    threshold: -1,
    window: -1,
    required: true,
    force: false
  },
  testdummy: {
    name: 'testdummy',
    bit: 28,
    startTime: 0,
    timeout: 0xffffffff,
    threshold: -1,
    window: -1,
    required: false,
    force: true
  }
};

regtest.deploys = [
  regtest.deployments.csv,
  regtest.deployments.segwit,
  regtest.deployments.testdummy
];

regtest.keyPrefix = {
  privkey: 0xef,
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
  xpubkey58: 'xpub',
  xprivkey58: 'xprv',
  coinType: 1
};

regtest.addressPrefix = {
  pubkeyhash: 0x6f,
  scripthash: 0xc4,
  scripthash2: 0x3a,
  witnesspubkeyhash: 0x03,
  witnessscripthash: 0x28,
  bech32: 'tb'
};

regtest.requireStandard = false;

regtest.rpcPort = 19445;

regtest.minRelay = 1000;

regtest.feeRate = 20000;

regtest.maxFeeRate = 60000;

regtest.selfConnect = true;

regtest.requestMempool = true;

/*
 * Simnet (btcd)
 */

const simnet = {};

simnet.type = 'simnet';

simnet.seeds = [
  '127.0.0.1'
];

simnet.magic = 0x12141c16;

simnet.port = 18555;

simnet.checkpointMap = {};

simnet.lastCheckpoint = 0;

simnet.halvingInterval = 210000;

simnet.genesis = {
  version: 1,
  hash: 'f67ad7695d9b662a72ff3d8edbbb2de0bfa67b13974bb9910d116d5cbd863e68',
  prevBlock: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot:
    '3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a',
  time: 1401292357,
  bits: 545259519,
  nonce: 2,
  height: 0
};

simnet.genesisBlock =
  '0100000000000000000000000000000000000000000000000000000000000000000000'
  + '003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a4506'
  + '8653ffff7f200200000001010000000100000000000000000000000000000000000000'
  + '00000000000000000000000000ffffffff4d04ffff001d0104455468652054696d6573'
  + '2030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66'
  + '207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01'
  + '000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f'
  + '61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f'
  + 'ac00000000';

simnet.pow = {
  limit: new BN(
    // High target of 0x207fffff (545259519)
    '7fffff0000000000000000000000000000000000000000000000000000000000',
    'hex'
  ),
  bits: 545259519,
  chainwork: new BN(
    '0000000000000000000000000000000000000000000000000000000000000002',
    'hex'
  ),
  targetTimespan: 3.5 * 24 * 60 * 60,
  targetSpacing: 2.5 * 60,
  retargetInterval: 2016,
  targetReset: true,
  noRetargeting: false
};

simnet.block = {
  bip34height: 0,
  bip34hash: 'f67ad7695d9b662a72ff3d8edbbb2de0bfa67b13974bb9910d116d5cbd863e68',
  bip65height: 0,
  bip65hash: 'f67ad7695d9b662a72ff3d8edbbb2de0bfa67b13974bb9910d116d5cbd863e68',
  bip66height: 0,
  bip66hash: 'f67ad7695d9b662a72ff3d8edbbb2de0bfa67b13974bb9910d116d5cbd863e68',
  pruneAfterHeight: 1000,
  keepBlocks: 10000,
  maxTipAge: 0xffffffff,
  slowHeight: 0
};

simnet.bip30 = {};

simnet.activationThreshold = 75; // 75% for testchains

simnet.minerWindow = 100; // nPowTargetTimespan / nPowTargetSpacing

simnet.deployments = {
  csv: {
    name: 'csv',
    bit: 0,
    startTime: 0, // March 1st, 2016
    timeout: 0xffffffff, // May 1st, 2017
    threshold: -1,
    window: -1,
    required: false,
    force: true
  },
  segwit: {
    name: 'segwit',
    bit: 1,
    startTime: 0, // May 1st 2016
    timeout: 0xffffffff, // May 1st 2017
    threshold: -1,
    window: -1,
    required: true,
    force: false
  },
  segsignal: {
    name: 'segsignal',
    bit: 4,
    startTime: 0xffffffff,
    timeout: 0xffffffff,
    threshold: 269,
    window: 336,
    required: false,
    force: false
  },
  testdummy: {
    name: 'testdummy',
    bit: 28,
    startTime: 1199145601, // January 1, 2008
    timeout: 1230767999, // December 31, 2008
    threshold: -1,
    window: -1,
    required: false,
    force: true
  }
};

simnet.deploys = [
  simnet.deployments.csv,
  simnet.deployments.segwit,
  simnet.deployments.segsignal,
  simnet.deployments.testdummy
];

simnet.keyPrefix = {
  privkey: 0x64,
  xpubkey: 0x0420bd3a,
  xprivkey: 0x0420b900,
  xpubkey58: 'spub',
  xprivkey58: 'sprv',
  coinType: 115
};

simnet.addressPrefix = {
  pubkeyhash: 0x3f,
  scripthash: 0x7b,
  witnesspubkeyhash: 0x19,
  witnessscripthash: 0x28,
  bech32: 'sc'
};

simnet.requireStandard = false;

simnet.rpcPort = 18556;

simnet.minRelay = 1000;

simnet.feeRate = 20000;

simnet.maxFeeRate = 60000;

simnet.selfConnect = false;

simnet.requestMempool = false;

/*
 * Expose
 */

network.main = main;
network.testnet = testnet;
network.regtest = regtest;
network.simnet = simnet;
