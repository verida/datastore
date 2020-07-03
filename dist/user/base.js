"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vid = _interopRequireDefault(require("../helpers/vid"));

var _keyring = _interopRequireDefault(require("../keyring"));

var _app = _interopRequireDefault(require("../app"));

var _didJwt = _interopRequireDefault(require("did-jwt"));

var _ethers = require("ethers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = require('lodash');

var Base = /*#__PURE__*/function () {
  /**
   * 
   * @param {*} chain 
   * @param {*} address 
   * @param {*} serverUrl URL of the application server for this user and application combination. This is used to populate the serviceUrl for third party apps to connect.
   */
  function Base(chain, address, serverUrl) {
    _classCallCheck(this, Base);

    this.chain = chain;
    this.address = address;
    this.serverUrl = serverUrl;
    this.did = _vid["default"].getDidFromAddress(address, chain);
    this.appConfigs = {};
    this.signatures = {};
  }

  _createClass(Base, [{
    key: "getAppVid",
    value: function () {
      var _getAppVid = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(appName, keyring) {
        var vidDoc, signature;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                appName = appName || _app["default"].config.appName;

                if (!this.appConfigs[appName]) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", this.appConfigs[appName].vid);

              case 3:
                _context.next = 5;
                return _vid["default"].getByDid(this.did, appName);

              case 5:
                vidDoc = _context.sent;

                if (vidDoc) {
                  _context.next = 13;
                  break;
                }

                _context.next = 9;
                return this.requestSignature(appName, "default");

              case 9:
                signature = _context.sent;
                _context.next = 12;
                return _vid["default"].save(this.did, appName, keyring, this.serverUrl, signature);

              case 12:
                vidDoc = _context.sent;

              case 13:
                return _context.abrupt("return", vidDoc.id);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAppVid(_x, _x2) {
        return _getAppVid.apply(this, arguments);
      }

      return getAppVid;
    }()
  }, {
    key: "getAppConfig",
    value: function () {
      var _getAppConfig = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(appName, force, signature) {
        var keyring, vid;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                appName = appName || _app["default"].config.appName; // Load from in memory cache

                if (!this.appConfigs[appName]) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return", this.appConfigs[appName]);

              case 3:
                if (!this.restoreFromSession(appName)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", this.appConfigs[appName]);

              case 5:
                if (force) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", false);

              case 7:
                if (signature) {
                  _context2.next = 11;
                  break;
                }

                _context2.next = 10;
                return this.requestSignature(appName, "default");

              case 10:
                signature = _context2.sent;

              case 11:
                if (signature) {
                  _context2.next = 13;
                  break;
                }

                throw new Error("Unable to obtain signature from user");

              case 13:
                keyring = new _keyring["default"](signature);
                _context2.next = 16;
                return this.getAppVid(appName, keyring);

              case 16:
                vid = _context2.sent;
                this.appConfigs[appName] = {
                  keyring: keyring,
                  vid: vid
                };
                this.saveToSession(appName);
                return _context2.abrupt("return", this.appConfigs[appName]);

              case 20:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAppConfig(_x3, _x4, _x5) {
        return _getAppConfig.apply(this, arguments);
      }

      return getAppConfig;
    }()
  }, {
    key: "setUsername",
    value: function () {
      var _setUsername = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(username) {
        var signature;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.requestSignature(username, "username");

              case 2:
                signature = _context3.sent;
                return _context3.abrupt("return", _vid["default"].commitUsername(username, this.did, signature));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setUsername(_x6) {
        return _setUsername.apply(this, arguments);
      }

      return setUsername;
    }()
  }, {
    key: "saveToSession",
    value: function saveToSession(appName) {
      return false;
    }
  }, {
    key: "restoreFromSession",
    value: function restoreFromSession(appName) {
      return false;
    }
    /**
     * Sign data as the current user
     * 
     * @param {*} data 
     * @todo Think about signing data and versions / insertedAt etc.
     */

  }, {
    key: "signData",
    value: function () {
      var _signData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(data, appName) {
        var _data, appConfig;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!data.signatures) {
                  data.signatures = {};
                }

                appName = appName || _app["default"].config.appName;
                _data = _.merge({}, data);
                delete _data['_signatures'];
                _context4.next = 6;
                return this.getAppConfig(appName, true);

              case 6:
                appConfig = _context4.sent;

                if (appConfig) {
                  _context4.next = 9;
                  break;
                }

                throw new Error("User not authorized to sign for \"" + appName + "\"");

              case 9:
                data.signatures[appConfig.vid] = appConfig.keyring.sign(_data);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function signData(_x7, _x8) {
        return _signData.apply(this, arguments);
      }

      return signData;
    }()
    /**
     * Create a DID-JWT from a data object
     * @param {*} data 
     */

  }, {
    key: "createDidJwt",
    value: function () {
      var _createDidJwt = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(data, config) {
        var userConfig, keyring, signer, jwt;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                config = _.merge({
                  expiry: null,
                  appName: _app["default"].config.appName,
                  insertedAt: new Date().toISOString()
                }, config);
                _context5.next = 3;
                return this.getAppConfig(config.appName, true);

              case 3:
                userConfig = _context5.sent;
                keyring = userConfig.keyring;
                signer = _didJwt["default"].SimpleSigner(keyring.signKey["private"]);
                _context5.next = 8;
                return _didJwt["default"].createJWT({
                  aud: this.did,
                  vid: userConfig.vid,
                  exp: config.expiry,
                  data: data,
                  veridaApp: config.appName,
                  insertedAt: config.insertedAt
                }, {
                  alg: 'Ed25519',
                  issuer: this.did,
                  signer: signer
                });

              case 8:
                jwt = _context5.sent;
                return _context5.abrupt("return", jwt);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function createDidJwt(_x9, _x10) {
        return _createDidJwt.apply(this, arguments);
      }

      return createDidJwt;
    }()
  }, {
    key: "logout",
    value: function logout(appName) {
      delete this.appConfigs[appName];
    }
  }, {
    key: "requestSignature",
    value: function () {
      var _requestSignature2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(context, accessType) {
        var hex, hash, signMessage;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                hex = Buffer.from(JSON.stringify([context, accessType])).toString("hex");
                hash = _ethers.utils.sha256('0x' + hex);

                if (!this.signatures[hash]) {
                  _context6.next = 4;
                  break;
                }

                return _context6.abrupt("return", this.signatures[hash]);

              case 4:
                signMessage = this._getSignMessage(context, accessType);
                _context6.next = 7;
                return this._requestSignature(signMessage);

              case 7:
                this.signatures[hash] = _context6.sent;
                return _context6.abrupt("return", this.signatures[hash]);

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function requestSignature(_x11, _x12) {
        return _requestSignature2.apply(this, arguments);
      }

      return requestSignature;
    }()
  }, {
    key: "_requestSignature",
    value: function () {
      var _requestSignature3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                throw new Error("Not implemented");

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function _requestSignature() {
        return _requestSignature3.apply(this, arguments);
      }

      return _requestSignature;
    }()
  }, {
    key: "_getSignMessage",
    value: function _getSignMessage(context, accessType) {
      switch (accessType) {
        case 'username':
          return "Set my username to " + context + " for DID " + this.did;

        case 'profile':
          return "Do you approve this application to update your Verida public profile?\n\n" + this.did;

        default:
          return "Do you approve access to view and update \"" + context + "\"?\n\n" + this.did;
      }
    }
  }]);

  return Base;
}();

var _default = Base;
exports["default"] = _default;