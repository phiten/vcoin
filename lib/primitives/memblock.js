/*!
 * memblock.js - memblock block object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const AbstractBlock = require('./abstractblock');
const Block = require('./block');
const Headers = require('./headers');
const Script = require('../script/script');
const BufferReader = require('../utils/reader');
const DUMMY = Buffer.alloc(0);

/**
 * A block object which is essentially a "placeholder"
 * for a full {@link Block} object. The v8 garbage
 * collector's head will explode if there is too much
 * data on the javascript heap. Blocks can currently
 * be up to 1mb in size. In the future, they may be
 * 2mb, 8mb, or maybe 20mb, who knows? A MemBlock
 * is an optimization in Bcoin which defers parsing of
 * the serialized transactions (the block Buffer) until
 * the block has passed through the chain queue and
 * is about to enter the chain. This keeps a lot data
 * off of the javascript heap for most of the time a
 * block even exists in memory, and manages to keep a
 * lot of strain off of the garbage collector. Having
 * 500mb of blocks on the js heap would not be a good
 * thing.
 * @alias module:primitives.MemBlock
 * @constructor
 * @param {NakedBlock} options
 */

function MemBlock() {
  if (!(this instanceof MemBlock))
    return new MemBlock();

  AbstractBlock.call(this);

  this._raw = DUMMY;
}

Object.setPrototypeOf(MemBlock.prototype, AbstractBlock.prototype);

/**
 * Test whether the block is a memblock.
 * @returns {Boolean}
 */

MemBlock.prototype.isMemory = function isMemory() {
  return true;
};

/**
 * Serialize the block headers.
 * @returns {Buffer}
 */

MemBlock.prototype.toHead = function toHead() {
  return this._raw.slice(0, 80);
};

/**
 * Get the full block size.
 * @returns {Number}
 */

MemBlock.prototype.getSize = function getSize() {
  return this._raw.length;
};

/**
 * Verify the block.
 * @returns {Boolean}
 */

MemBlock.prototype.verifyBody = function verifyBody() {
  return true;
};

/**
 * Retrieve the coinbase height
 * from the coinbase input script.
 * @returns {Number} height (-1 if not present).
 */

MemBlock.prototype.getCoinbaseHeight = function getCoinbaseHeight() {
  if (this.version < 2)
    return -1;

  try {
    return this.parseCoinbaseHeight();
  } catch (e) {
    return -1;
  }
};

/**
 * Parse the coinbase height
 * from the coinbase input script.
 * @private
 * @returns {Number} height (-1 if not present).
 */

MemBlock.prototype.parseCoinbaseHeight = function parseCoinbaseHeight() {
  const br = new BufferReader(this._raw, true);

  br.seek(80);

  const txCount = br.readVarint();

  if (txCount === 0)
    return -1;

  br.seek(4);

  let inCount = br.readVarint();

  if (inCount === 0) {
    if (br.readU8() !== 0)
      inCount = br.readVarint();
  }

  if (inCount === 0)
    return -1;

  br.seek(36);

  const script = br.readVarBytes();

  return Script.getCoinbaseHeight(script);
};

/**
 * Inject properties from serialized data.
 * @private
 * @param {Buffer} data
 */

MemBlock.prototype.fromRaw = function fromRaw(data) {
  const br = new BufferReader(data, true);

  this.readHead(br);

  this._raw = br.data;

  return this;
};

/**
 * Insantiate a memblock from serialized data.
 * @param {Buffer} data
 * @returns {MemBlock}
 */

MemBlock.fromRaw = function fromRaw(data) {
  return new MemBlock().fromRaw(data);
};

/**
 * Return serialized block data.
 * @returns {Buffer}
 */

MemBlock.prototype.toRaw = function toRaw() {
  return this._raw;
};

/**
 * Return serialized block data.
 * @returns {Buffer}
 */

MemBlock.prototype.toNormal = function toNormal() {
  return this._raw;
};

/**
 * Parse the serialized block data
 * and create an actual {@link Block}.
 * @returns {Block}
 * @throws Parse error
 */

MemBlock.prototype.toBlock = function toBlock() {
  const block = Block.fromRaw(this._raw);

  block._hash = this._hash;
  block._hhash = this._hhash;

  return block;
};

/**
 * Convert the block to a headers object.
 * @returns {Headers}
 */

MemBlock.prototype.toHeaders = function toHeaders() {
  return Headers.fromBlock(this);
};

/**
 * Test whether an object is a MemBlock.
 * @param {Object} obj
 * @returns {Boolean}
 */

MemBlock.isMemBlock = function isMemBlock(obj) {
  return obj instanceof MemBlock;
};

/*
 * Expose
 */

module.exports = MemBlock;
