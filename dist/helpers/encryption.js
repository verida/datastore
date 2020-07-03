"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _tweetnacl = require("tweetnacl");

var _tweetnaclUtil = require("tweetnacl-util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var newSymNonce = function newSymNonce() {
  return (0, _tweetnacl.randomBytes)(_tweetnacl.secretbox.nonceLength);
};

var newAsymNonce = function newAsymNonce() {
  return (0, _tweetnacl.randomBytes)(_tweetnacl.box.nonceLength);
};

var newKey = function newKey(length) {
  return (0, _tweetnacl.randomBytes)(length ? length : _tweetnacl.secretbox.keyLength);
};

var Encryption = /*#__PURE__*/function () {
  function Encryption() {
    _classCallCheck(this, Encryption);
  }

  _createClass(Encryption, null, [{
    key: "symEncryptBuffer",
    value: function symEncryptBuffer(data, keyUint8Array) {
      var nonce = newSymNonce();
      var messageUint8 = data;
      var box = (0, _tweetnacl.secretbox)(messageUint8, nonce, keyUint8Array);
      var fullMessage = new Uint8Array(nonce.length + box.length);
      fullMessage.set(nonce);
      fullMessage.set(box, nonce.length);
      var base64FullMessage = (0, _tweetnaclUtil.encodeBase64)(fullMessage);
      return base64FullMessage;
    }
  }, {
    key: "symDecryptBuffer",
    value: function symDecryptBuffer(messageWithNonce, keyUint8Array) {
      var messageWithNonceAsUint8Array = (0, _tweetnaclUtil.decodeBase64)(messageWithNonce);
      var nonce = messageWithNonceAsUint8Array.slice(0, _tweetnacl.secretbox.nonceLength);
      var message = messageWithNonceAsUint8Array.slice(_tweetnacl.secretbox.nonceLength, messageWithNonce.length);

      var decrypted = _tweetnacl.secretbox.open(message, nonce, keyUint8Array);

      if (!decrypted) {
        throw new Error("Could not decrypt message");
      }

      return decrypted;
    }
  }, {
    key: "symEncrypt",
    value: function symEncrypt(data, keyUint8Array) {
      data = (0, _tweetnaclUtil.decodeUTF8)(JSON.stringify(data));
      return Encryption.symEncryptBuffer(data, keyUint8Array);
    }
  }, {
    key: "symDecrypt",
    value: function symDecrypt(messageWithNonce, keyUint8Array) {
      var decrypted = Encryption.symDecryptBuffer(messageWithNonce, keyUint8Array);
      var base64DecryptedMessage = (0, _tweetnaclUtil.encodeUTF8)(decrypted);
      return JSON.parse(base64DecryptedMessage);
    }
  }, {
    key: "asymEncrypt",
    value: function asymEncrypt(data, secretOrSharedKey) {
      var nonce = newAsymNonce();
      var messageUint8 = (0, _tweetnaclUtil.decodeUTF8)(JSON.stringify(data));

      var encrypted = _tweetnacl.box.after(messageUint8, nonce, secretOrSharedKey);

      var fullMessage = new Uint8Array(nonce.length + encrypted.length);
      fullMessage.set(nonce);
      fullMessage.set(encrypted, nonce.length);
      var base64FullMessage = (0, _tweetnaclUtil.encodeBase64)(fullMessage);
      return base64FullMessage;
    }
  }, {
    key: "asymDecrypt",
    value: function asymDecrypt(messageWithNonce, secretOrSharedKey) {
      var messageWithNonceAsUint8Array = (0, _tweetnaclUtil.decodeBase64)(messageWithNonce);
      var nonce = messageWithNonceAsUint8Array.slice(0, _tweetnacl.box.nonceLength);
      var message = messageWithNonceAsUint8Array.slice(_tweetnacl.box.nonceLength, messageWithNonce.length);

      var decrypted = _tweetnacl.box.open.after(message, nonce, secretOrSharedKey);

      if (!decrypted) {
        throw new Error('Could not decrypt message');
      }

      var base64DecryptedMessage = (0, _tweetnaclUtil.encodeUTF8)(decrypted);
      return JSON.parse(base64DecryptedMessage);
    }
  }, {
    key: "randomKey",
    value: function randomKey(length) {
      return newKey(length);
    }
  }]);

  return Encryption;
}();

var _default = Encryption;
exports["default"] = _default;