"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _datastore = _interopRequireDefault(require("../datastore"));

var _lodash = _interopRequireDefault(require("lodash"));

var _vid = _interopRequireDefault(require("../helpers/vid"));

var _didHelper = _interopRequireDefault(require("@verida/did-helper"));

var _didJwt = _interopRequireDefault(require("did-jwt"));

var _tweetnacl = require("tweetnacl");

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Outbox = /*#__PURE__*/function () {
  function Outbox(app) {
    _classCallCheck(this, Outbox);

    this._app = app;
    this._inboxes = {};
    this._outboxDatastore = null;
  }
  /**
   * Send a message to another user's application inbox. The message is converted to
   * a DID-JWT, signed by this application user (sender).
   * 
   * The message is then encrypted using the recipients public key and saved
   * to their public inbox with date/time metadata removed.
   * 
   * @param {string} did User's public DID
   * @param {string} type Type of inbox entry (ie: /schemas/base/inbox/type/dataSend)
   * @param {object} data Data to include in the message. Must match a particular
   *  schema or be an array of schema objects
   * @param {string} message Message to show the user describing the inbox message
   * @param {config} config Optional config (TBA). ie: specify `appName` if sending to a specific application
   */


  _createClass(Outbox, [{
    key: "send",
    value: function () {
      var _send = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(did, type, data, message, config) {
        var defaults, sendingAppName, receivingAppName, vidDoc, outboxEntry, outbox, response, appUserConfig, keyring, signer, userVid, jwt, publicAsymKey, sharedKey, encrypted, inbox, db;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                message = message ? message : "";
                config = config ? config : {};
                did = did.toLowerCase();
                defaults = {
                  // By default send data to the user's official Verida Vault application
                  appName: _app["default"].config.vaultAppName
                };
                config = _lodash["default"].merge(defaults, config);
                sendingAppName = _app["default"].config.appName;
                receivingAppName = config.appName;
                this.validateData(type, data);
                _context.next = 10;
                return _vid["default"].getByDid(did, receivingAppName);

              case 10:
                vidDoc = _context.sent;

                if (vidDoc) {
                  _context.next = 13;
                  break;
                }

                throw new Error("Unable to locate VID for " + receivingAppName);

              case 13:
                outboxEntry = {
                  type: type,
                  data: data,
                  message: message,
                  sentTo: {
                    did: did,
                    vid: String(vidDoc.id)
                  },
                  sent: false
                };
                _context.next = 16;
                return this.getOutboxDatastore();

              case 16:
                outbox = _context.sent;
                _context.next = 19;
                return outbox.save(outboxEntry);

              case 19:
                response = _context.sent;

                if (response) {
                  _context.next = 23;
                  break;
                }

                console.error(outbox.errors);
                throw new Error("Unable to save to outbox. See error log above.");

              case 23:
                if (!(response.ok !== true)) {
                  _context.next = 26;
                  break;
                }

                console.error(outbox.errors);
                throw new Error("Unable to save to outbox. See error log above.");

              case 26:
                // Include the outbox _id and _rev so the recipient user
                // can respond to this inbox message
                outboxEntry._id = response.id;
                outboxEntry._rev = response.rev;
                /**
                 * Sign this message from the current application user to create a JWT
                 * containing the inbox message
                 */
                // Use the current application's keyring as we can't request access to
                // the user's private vault

                _context.next = 30;
                return this._app.user.getAppConfig();

              case 30:
                appUserConfig = _context.sent;
                keyring = appUserConfig.keyring;
                signer = _didJwt["default"].SimpleSigner(keyring.signKey["private"]);
                _context.next = 35;
                return this._app.user.getAppVid(sendingAppName);

              case 35:
                userVid = _context.sent;
                _context.next = 38;
                return _didJwt["default"].createJWT({
                  aud: this._app.user.did,
                  vid: userVid.id,
                  exp: config.expiry,
                  data: outboxEntry,
                  veridaApp: sendingAppName,
                  insertedAt: new Date().toISOString()
                }, {
                  alg: 'ES256K-R',
                  issuer: this._app.user.did,
                  signer: signer
                });

              case 38:
                jwt = _context.sent;
                // Encrypt this message using the receipients public key and this apps private key
                publicAsymKey = _didHelper["default"].getKeyBytes(vidDoc, 'asym');
                sharedKey = _tweetnacl.box.before(publicAsymKey, keyring.asymKey.privateBytes);
                encrypted = keyring.asymEncrypt(jwt, sharedKey); // Save the encrypted JWT to the user's inbox

                _context.next = 44;
                return this.getInboxDatastore(did, {
                  appName: receivingAppName
                });

              case 44:
                inbox = _context.sent;
                _context.next = 47;
                return inbox.getDb();

              case 47:
                db = _context.sent;
                db.on("beforeInsert", function (data) {
                  delete data['insertedAt'];
                  delete data['modifiedAt'];
                });
                _context.next = 51;
                return inbox.save({
                  content: encrypted,
                  key: keyring.asymKey["public"]
                });

              case 51:
                response = _context.sent;
                // Update outbox entry as saved
                outboxEntry.sent = true;
                _context.next = 55;
                return outbox.save(outboxEntry);

              case 55:
                response = _context.sent;
                return _context.abrupt("return", response);

              case 57:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function send(_x, _x2, _x3, _x4, _x5) {
        return _send.apply(this, arguments);
      }

      return send;
    }()
    /**
     * Get the inbox Datastore for a user by DID (and 
     * optionally application name)
     * 
     * @param {string} did User's public DID
     * @param {object} config Config to be passed to the dataserver
     */

  }, {
    key: "getInboxDatastore",
    value: function () {
      var _getInboxDatastore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(did, config) {
        var defaults, key, dataserver, inbox;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                config = config ? config : {};
                defaults = {
                  appName: _app["default"].config.vaultAppName
                };
                config = _lodash["default"].merge(defaults, config);
                key = did + config.appName;

                if (!this._inboxes[key]) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", this._inboxes[key]);

              case 6:
                _context2.next = 8;
                return _app["default"].buildDataserver(did, config);

              case 8:
                dataserver = _context2.sent;
                inbox = new _datastore["default"](dataserver, "inbox/item", did, config.appName, {
                  permissions: {
                    read: "public",
                    write: "public"
                  },
                  isOwner: false,
                  // Sign data as this user and application
                  signUser: this._app.user,
                  signAppName: _app["default"].config.appName
                });
                this._inboxes[key] = inbox;
                return _context2.abrupt("return", inbox);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getInboxDatastore(_x6, _x7) {
        return _getInboxDatastore.apply(this, arguments);
      }

      return getInboxDatastore;
    }()
  }, {
    key: "getOutboxDatastore",
    value: function () {
      var _getOutboxDatastore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this._outboxDatastore) {
                  this._outboxDatastore = this._app.openDatastore("outbox/entry");
                }

                return _context3.abrupt("return", this._outboxDatastore);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getOutboxDatastore() {
        return _getOutboxDatastore.apply(this, arguments);
      }

      return getOutboxDatastore;
    }()
    /*eslint no-unused-vars: "off"*/

  }, {
    key: "validateData",
    value: function validateData(data) {
      // TODO: Validate the data is a valid schema (or an array of valid schemas)
      return true;
    }
  }]);

  return Outbox;
}();

var _default = Outbox;
exports["default"] = _default;