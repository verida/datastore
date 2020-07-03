"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _tweetnacl = require("tweetnacl");

var _tweetnaclUtil = require("tweetnacl-util");

var _ethers = require("ethers");

var _encryption = _interopRequireDefault(require("./helpers/encryption"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BASE_PATH = "m/6696500'/0'/0'";
var DB_PATH = "m/42"; //const ETH_PATH = "m/44'/60'/0'/0"

/**
 * Container for user's encryption keys for an application.
 */

var Keyring = /*#__PURE__*/function () {
  /**
   * Create a new Keyring for an application.
   *
   * @ignore
   * @param signature
   */
  function Keyring(signature) {
    _classCallCheck(this, Keyring);

    this.signature = signature;

    var entropy = _ethers.utils.sha256('0x' + signature.slice(2));

    var mnemonic = _ethers.ethers.utils.HDNode.entropyToMnemonic(entropy);

    var seed = _ethers.ethers.utils.HDNode.mnemonicToSeed(mnemonic);

    var seedNode = _ethers.ethers.utils.HDNode.fromSeed(seed);

    this.baseNode = seedNode.derivePath(BASE_PATH); // Build symmetric key

    var symKey = this.baseNode.derivePath("0");
    this.symKey = Buffer.from(symKey.privateKey.slice(2), 'hex'); // Build asymmetric keys

    var asymKey = this.baseNode.derivePath("1");
    this.asymKey = this._generateKeyPair(asymKey, "box"); // Build signing keys

    var signKey = this.baseNode.derivePath("2");
    this.signKey = this._generateKeyPair(signKey, "sign");
    var dbNode = this.baseNode.derivePath("3");
    this.dbSignKey = this._generateKeyPair(dbNode, "sign");
    this.dbSymKeys = {}; //this.ethKey = seedNode.derivePath(ETH_PATH);
  }

  _createClass(Keyring, [{
    key: "getDbKey",
    value: function getDbKey(dbName) {
      if (this.dbSymKeys[dbName]) {
        return this.dbSymKeys[dbName];
      } // Sign a consent message using the current db signing key


      var consent = "Authorized to own database: " + dbName;
      var signature = this.sign(consent, this.dbSignKey);

      var signatureBytes = _ethers.ethers.utils.toUtf8Bytes(signature); // Use the signature as entropy to create a new seed


      var entropy = _ethers.utils.keccak256(signatureBytes);

      var mnemonic = _ethers.ethers.utils.HDNode.entropyToMnemonic(entropy);

      var seed = _ethers.ethers.utils.HDNode.mnemonicToSeed(mnemonic); // Use the seed to create a new HDNode


      var seedNode = _ethers.ethers.utils.HDNode.fromSeed(seed);

      var dbNode = seedNode.derivePath(DB_PATH); // Use the HDNode to create a symmetric key for this database

      this.dbSymKeys[dbName] = dbNode.privateKey;
      return this.dbSymKeys[dbName];
    }
  }, {
    key: "exportPublicKeys",
    value: function exportPublicKeys() {
      var keys = {
        asymmetric: this.asymKey["public"],
        asymmetricBytes: this.asymKey.publicBytes,
        sign: this.signKey["public"],
        signBytes: this.signKey.publicBytes
      };
      keys.asymmetricBase64 = (0, _tweetnaclUtil.encodeBase64)(keys.asymmetricBytes);
      keys.signBase64 = (0, _tweetnaclUtil.encodeBase64)(keys.signBytes);
      return keys;
    }
  }, {
    key: "_generateKeyPair",
    value: function _generateKeyPair(hdNode, method) {
      var seed = Buffer.from(hdNode.privateKey.slice(2), 'hex');
      var keyPair;

      switch (method) {
        case 'sign':
          keyPair = _tweetnacl.sign.keyPair.fromSeed(seed);
          break;

        case 'box':
          keyPair = _tweetnacl.box.keyPair.fromSecretKey(seed);
          break;
      }

      return {
        "public": '0x' + Buffer.from(keyPair.publicKey).toString('hex'),
        publicBytes: keyPair.publicKey,
        "private": '0x' + Buffer.from(keyPair.secretKey).toString('hex'),
        privateBytes: keyPair.secretKey
      };
    } // get a signature

  }, {
    key: "sign",
    value: function sign(data, key) {
      key = key ? key : this.signKey;
      var messageUint8 = (0, _tweetnaclUtil.decodeUTF8)(JSON.stringify(data));
      return (0, _tweetnaclUtil.encodeBase64)(_tweetnacl.sign.detached(messageUint8, key.privateBytes));
    }
  }, {
    key: "verifySig",
    value: function verifySig(data, sig) {
      var messageUint8 = (0, _tweetnaclUtil.decodeUTF8)(JSON.stringify(data));
      return _tweetnacl.sign.detached.verify(messageUint8, (0, _tweetnaclUtil.decodeBase64)(sig), this.signKey.publicBytes);
    }
  }, {
    key: "symEncryptBuffer",
    value: function symEncryptBuffer(data) {
      return _encryption["default"].symEncryptBuffer(data, this.symKey);
    }
  }, {
    key: "symDecryptBuffer",
    value: function symDecryptBuffer(messageWithNonce) {
      return _encryption["default"].symDecryptBuffer(messageWithNonce, this.symKey);
    }
  }, {
    key: "symEncrypt",
    value: function symEncrypt(data) {
      return _encryption["default"].symEncrypt(data, this.symKey);
    }
  }, {
    key: "symDecrypt",
    value: function symDecrypt(messageWithNonce) {
      return _encryption["default"].symDecrypt(messageWithNonce, this.symKey);
    }
  }, {
    key: "asymEncrypt",
    value: function asymEncrypt(data, secretOrSharedKey) {
      return _encryption["default"].asymEncrypt(data, secretOrSharedKey);
    }
  }, {
    key: "asymDecrypt",
    value: function asymDecrypt(messageWithNonce, secretOrSharedKey) {
      return _encryption["default"].asymDecrypt(messageWithNonce, secretOrSharedKey);
    }
  }, {
    key: "buildSharedKeyStart",
    value: function buildSharedKeyStart(privateKey) {
      return _tweetnacl.box.before(this.asymKey.publicBytes, privateKey);
    }
  }, {
    key: "buildSharedKeyEnd",
    value: function buildSharedKeyEnd(publicKey) {
      return _tweetnacl.box.before(publicKey, this.asymKey.privateBytes);
    }
  }]);

  return Keyring;
}();

var _default = Keyring;
exports["default"] = _default;