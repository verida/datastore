"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _didJwt = _interopRequireDefault(require("did-jwt"));

var _didJwtVc = require("did-jwt-vc");

var _didResolver = require("did-resolver");

var _vid = require("./vid");

var _tweetnaclUtil = require("tweetnacl-util");

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var url = require('url');

var Credentials = /*#__PURE__*/function () {
  function Credentials() {
    _classCallCheck(this, Credentials);
  }

  _createClass(Credentials, null, [{
    key: "createVerifiableCredential",

    /*credential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": "https://example.com/credentials/1872",
        "type": ["VerifiableCredential", "AlumniCredential"],
        "issuer": "https://example.edu/issuers/565049",
        "issuanceDate": "2010-01-01T19:23:24Z",
        "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "alumniOf": "Example University"
        }
    };*/
    value: function () {
      var _createVerifiableCredential2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(credential, issuer) {
        var vcPayload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // Create the payload
                vcPayload = {
                  sub: issuer.did,
                  vc: credential
                }; // Create the verifiable credential

                _context.next = 3;
                return (0, _didJwtVc.createVerifiableCredential)(vcPayload, issuer);

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function createVerifiableCredential(_x, _x2) {
        return _createVerifiableCredential2.apply(this, arguments);
      }

      return createVerifiableCredential;
    }()
  }, {
    key: "createVerifiablePresentation",
    value: function () {
      var _createVerifiablePresentation = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(vcJwts, issuer) {
        var vpPayload;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                vpPayload = {
                  vp: {
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiablePresentation'],
                    verifiableCredential: vcJwts
                  }
                };
                return _context2.abrupt("return", (0, _didJwtVc.createPresentation)(vpPayload, issuer));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function createVerifiablePresentation(_x3, _x4) {
        return _createVerifiablePresentation.apply(this, arguments);
      }

      return createVerifiablePresentation;
    }()
  }, {
    key: "verifyPresentation",
    value: function () {
      var _verifyPresentation2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(vpJwt) {
        var resolver;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                resolver = Credentials._getResolver();
                return _context3.abrupt("return", (0, _didJwtVc.verifyPresentation)(vpJwt, resolver));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function verifyPresentation(_x5) {
        return _verifyPresentation2.apply(this, arguments);
      }

      return verifyPresentation;
    }()
  }, {
    key: "verifyCredential",
    value: function () {
      var _verifyCredential2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(vcJwt) {
        var resolver;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                resolver = Credentials._getResolver();
                return _context4.abrupt("return", (0, _didJwtVc.verifyCredential)(vcJwt, resolver));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function verifyCredential(_x6) {
        return _verifyCredential2.apply(this, arguments);
      }

      return verifyCredential;
    }()
  }, {
    key: "createIssuer",
    value: function () {
      var _createIssuer = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(user) {
        var appConfig, keyring, privateKey, signer, issuer;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return user.getAppConfig();

              case 2:
                appConfig = _context5.sent;
                keyring = appConfig.keyring;
                privateKey = (0, _tweetnaclUtil.encodeBase64)(keyring.signKey.privateBytes);
                signer = _didJwt["default"].NaclSigner(privateKey);
                issuer = {
                  did: appConfig.vid,
                  signer: signer,
                  alg: "Ed25519" // must be this casing due to did-jwt/src/JWT.ts

                };
                return _context5.abrupt("return", issuer);

              case 8:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function createIssuer(_x7) {
        return _createIssuer.apply(this, arguments);
      }

      return createIssuer;
    }()
    /**
     * Fetch a credential from a Verida URI
     * 
     * @param {*} uri
     * @return string DIDJWT representation of the credential
     */

  }, {
    key: "fetch",
    value: function () {
      var _fetch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(uri) {
        var regex, matches, vid, dbName, id, query, didDoc, applicationService, appName, did, db, item, encrypted, key, decrypted;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                regex = /^verida:\/\/(.*)\/(.*)\/(.*)\?(.*)$/i;
                matches = uri.match(regex);

                if (matches) {
                  _context6.next = 4;
                  break;
                }

                throw new Error("Invalid URI");

              case 4:
                console.log(matches);
                vid = matches[1];
                dbName = matches[2];
                id = matches[3];
                query = url.parse(uri, true).query; // Determine application name

                _context6.next = 11;
                return _app["default"].Helpers.vid.getByVid(vid);

              case 11:
                didDoc = _context6.sent;

                if (didDoc) {
                  _context6.next = 14;
                  break;
                }

                throw new Error("Unable to locate VID: " + JSON.stringify(_app["default"].config.servers.local.didServerUrl) + vid);

              case 14:
                applicationService = didDoc.service.find(function (entry) {
                  return entry.type.includes("verida.Application");
                });
                appName = applicationService.description;

                if (appName) {
                  _context6.next = 18;
                  break;
                }

                throw new Error("Unable to locate application name");

              case 18:
                _context6.next = 20;
                return _app["default"].Helpers.vid.getDidFromVid(vid);

              case 20:
                did = _context6.sent;

                if (did) {
                  _context6.next = 23;
                  break;
                }

                throw new Error("Unable to locate DID");

              case 23:
                _context6.next = 25;
                return _app["default"].openExternalDatabase(dbName, did, {
                  permissions: {
                    read: "public",
                    write: "owner"
                  },
                  appName: appName,
                  readOnly: true
                });

              case 25:
                db = _context6.sent;
                _context6.next = 28;
                return db.get(id);

              case 28:
                item = _context6.sent;
                encrypted = item.content;
                key = Buffer.from(query.key, 'hex');
                decrypted = _app["default"].Helpers.encryption.symDecrypt(encrypted, key);
                return _context6.abrupt("return", decrypted);

              case 33:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function fetch(_x8) {
        return _fetch.apply(this, arguments);
      }

      return fetch;
    }()
  }, {
    key: "_getResolver",
    value: function _getResolver() {
      return new _didResolver.Resolver((0, _vid.getResolver)());
    }
  }]);

  return Credentials;
}();

var _default = Credentials;
exports["default"] = _default;