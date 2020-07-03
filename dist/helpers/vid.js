"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResolver = getResolver;
exports["default"] = void 0;

var _didDocument = require("did-document");

var _didHelper = _interopRequireDefault(require("@verida/did-helper"));

var _ethers = require("ethers");

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VidHelper = /*#__PURE__*/function () {
  function VidHelper() {
    _classCallCheck(this, VidHelper);
  }

  _createClass(VidHelper, [{
    key: "save",

    /**
     * Save a DID document
     * 
     * @todo: Replace with decentralised lookup
     */
    value: function () {
      var _save = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(did, appName, keyring, userDataserverUrl, signature) {
        var vid, publicKeys, appUrl, doc, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                vid = this.getVidFromDid(did, appName);
                publicKeys = keyring.exportPublicKeys();
                appUrl = _app["default"].config.appHost; // Generate a VID Document

                doc = new _didDocument.DIDDocument({
                  did: vid
                });
                doc.addPublicKey({
                  id: "".concat(vid, "#asym"),
                  type: 'Curve25519EncryptionPublicKey',
                  publicKeyHex: publicKeys.asymmetric,
                  publicKeyBase64: publicKeys.asymmetricBase64
                });
                doc.addPublicKey({
                  id: "".concat(vid, "#sign"),
                  type: 'ED25519SignatureVerification',
                  publicKeyHex: publicKeys.sign,
                  publicKeyBase64: publicKeys.signBase64
                });
                doc.addAuthentication({
                  publicKey: "".concat(vid, "#sign"),
                  type: 'ED25519SignatureAuthentication'
                });
                doc.addService({
                  id: "".concat(vid, "#application"),
                  type: 'verida.Application',
                  serviceEndpoint: appUrl,
                  description: appName
                });
                doc.addService({
                  id: "".concat(vid, "#dataserver"),
                  type: 'verida.DataServer',
                  serviceEndpoint: userDataserverUrl
                });

                _didHelper["default"].createProof(doc, keyring.signKey["private"]);

                _context.next = 12;
                return _didHelper["default"].commit(did, doc, signature, _app["default"].config.server.didServerUrl);

              case 12:
                response = _context.sent;

                if (!response) {
                  _context.next = 15;
                  break;
                }

                return _context.abrupt("return", doc);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save(_x, _x2, _x3, _x4, _x5) {
        return _save.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: "getByDid",
    value: function () {
      var _getByDid = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(did, appName) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                appName = appName || _app["default"].config.appName;
                did = did.toLowerCase();
                _context2.next = 4;
                return _didHelper["default"].loadForApp(did, appName, _app["default"].config.server.didServerUrl);

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function getByDid(_x6, _x7) {
        return _getByDid.apply(this, arguments);
      }

      return getByDid;
    }()
  }, {
    key: "getByVid",
    value: function () {
      var _getByVid = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(vid) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                vid = vid.toLowerCase();
                _context3.next = 3;
                return _didHelper["default"].load(vid, _app["default"].config.server.didServerUrl);

              case 3:
                return _context3.abrupt("return", _context3.sent);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function getByVid(_x8) {
        return _getByVid.apply(this, arguments);
      }

      return getByVid;
    }()
    /**
     * Get DID for a given VID
     * 
     * @param {*} vid
     */

  }, {
    key: "getDidFromVid",
    value: function () {
      var _getDidFromVid = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(vid) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                vid = vid.toLowerCase();
                _context4.next = 3;
                return _didHelper["default"].getDidFromVid(vid, _app["default"].config.server.didServerUrl);

              case 3:
                return _context4.abrupt("return", _context4.sent);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getDidFromVid(_x9) {
        return _getDidFromVid.apply(this, arguments);
      }

      return getDidFromVid;
    }()
    /**
     * Get the VID for a given DID and application name
     * 
     * @param {*} did 
     * @param {*} appName 
     */

  }, {
    key: "getVidFromDid",
    value: function getVidFromDid(did, appName) {
      appName = appName || _app["default"].config.appName;
      did = did.toLowerCase();
      return 'did:vid:' + _ethers.utils.id(appName + did);
    }
  }, {
    key: "getDidFromAddress",
    value: function getDidFromAddress(address, chain) {
      chain = chain || "ethr";
      return 'did:' + chain + ':' + address.toLowerCase();
    }
  }, {
    key: "getDidFromUsername",
    value: function () {
      var _getDidFromUsername = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(username) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!usernameOrDid.match(/^did\:/)) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return", username);

              case 2:
                return _context5.abrupt("return", _didHelper["default"].getDidFromUsername(username, _app["default"].config.server.didServerUrl));

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getDidFromUsername(_x10) {
        return _getDidFromUsername.apply(this, arguments);
      }

      return getDidFromUsername;
    }()
  }, {
    key: "commitUsername",
    value: function () {
      var _commitUsername = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(username, did, signature) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", _didHelper["default"].commitUsername(username, did, signature, _app["default"].config.server.didServerUrl));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function commitUsername(_x11, _x12, _x13) {
        return _commitUsername.apply(this, arguments);
      }

      return commitUsername;
    }()
  }]);

  return VidHelper;
}();

var vidHelper = new VidHelper();
var _default = vidHelper;
exports["default"] = _default;

function getResolver() {
  function resolve(_x14, _x15, _x16) {
    return _resolve.apply(this, arguments);
  }

  function _resolve() {
    _resolve = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(vid, parsed, didResolver) {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _app["default"].Helpers.vid.getByVid(vid);

            case 2:
              return _context7.abrupt("return", _context7.sent);

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));
    return _resolve.apply(this, arguments);
  }

  return {
    vid: resolve
  };
}