"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _web = _interopRequireDefault(require("./user/web"));

var _server = _interopRequireDefault(require("./user/server"));

var _schema = _interopRequireDefault(require("./schema"));

var _dataserver = _interopRequireDefault(require("./dataserver"));

var _inbox = _interopRequireDefault(require("./messaging/inbox"));

var _outbox = _interopRequireDefault(require("./messaging/outbox"));

var _wallet = _interopRequireDefault(require("./helpers/wallet"));

var _vid = _interopRequireDefault(require("./helpers/vid"));

var _trust = _interopRequireDefault(require("./helpers/trust"));

var _credentials = _interopRequireDefault(require("./helpers/credentials"));

var _encryption = _interopRequireDefault(require("./helpers/encryption"));

var _profile = _interopRequireDefault(require("./profile"));

var _dbManager = _interopRequireDefault(require("./managers/dbManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = require('lodash');
/**
 * @property {Wallet} wallet The current user's wallet.
 */


var App = /*#__PURE__*/function () {
  /**
   * Create a new application.
   *
   * @constructor
   * @example
   * import VeridaApp from 'verida-datastore';
   * let myApp = new VeridaApp("My Application Name");
   * myApp.connect(true);
   */
  function App(config) {
    _classCallCheck(this, App);

    if (process.browser) {
      this.user = new _web["default"](config.chain, config.address, config.appServerUrl || App.config.server.appServerUrl, config.web3Provider);
    } else {
      this.user = new _server["default"](config.chain, config.address, config.appServerUrl || App.config.server.appServerUrl, config.privateKey);
    }

    this.outbox = new _outbox["default"](this);
    this.inbox = new _inbox["default"](this);
    this.dbManager = new _dbManager["default"](this);
    this.dataserver = new _dataserver["default"]({
      datastores: config.datastores,
      serverUrl: this.user.serverUrl,
      dbManager: this.dbManager
    });
    this._isConnected = false;
  }
  /**
   * Override the default config
   *
   * @param {*} config
   */


  _createClass(App, [{
    key: "connect",

    /**
     * Connect a user to the application. Similar to "logging in" to an application.
     * This will popup a metamask window asking the user to authorize the application.
     *
     * The user will remain logged in for all subsequent page loads until `app.logout()` is called.
     */
    value: function () {
      var _connect = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(force) {
        var connected;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this._isConnected && force)) {
                  _context.next = 2;
                  break;
                }

                throw "Application datastore is already connected";

              case 2:
                _context.next = 4;
                return this.dataserver.connect(this.user, force);

              case 4:
                connected = _context.sent;
                this._isConnected = connected;

                if (!this._isConnected) {
                  _context.next = 9;
                  break;
                }

                _context.next = 9;
                return this.inbox.init();

              case 9:
                return _context.abrupt("return", connected);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connect(_x) {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
    /**
     * Logout a user.
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      this.dataserver.logout();
      this._isConnected = false;
    }
    /**
     * Determine if the current application instnace is connected
     */

  }, {
    key: "isConnected",
    value: function () {
      var _isConnected = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.connect();

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function isConnected() {
        return _isConnected.apply(this, arguments);
      }

      return isConnected;
    }()
    /**
     * Determine if a web session exists for a given DID (indicates they can be autologgedin)
     *
     * @param {string} did User's DID
     * @param {string} appName Application name
     */

  }, {
    key: "openDatastore",

    /**
     * Open an application datastore owned by the current suer
     *
     * @param {string} schemaName
     * @param {object} [config] Optional data store configuration
     * @returns {DataStore} Datastore instance for the requested schema
     */
    value: function () {
      var _openDatastore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(schemaName, config) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                config = _.merge(config, {
                  user: this.user
                }); // TODO: Add schema specific config from app config or do it in openDatastore?

                return _context3.abrupt("return", this.dataserver.openDatastore(schemaName, config));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function openDatastore(_x2, _x3) {
        return _openDatastore.apply(this, arguments);
      }

      return openDatastore;
    }()
    /**
     * Open an application database owned by the current user
     *
     * @param {*} dbName
     * @param {*} config
     */

  }, {
    key: "openDatabase",
    value: function () {
      var _openDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(dbName, config) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                config = _.merge(config, {
                  user: this.user
                });
                return _context4.abrupt("return", this.dataserver.openDatabase(dbName, config));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function openDatabase(_x4, _x5) {
        return _openDatabase.apply(this, arguments);
      }

      return openDatabase;
    }()
    /**
     * Open an application datastore owned by an external user
     *
     * @param {*} schemaName
     * @param {*} did
     * @param {*} config
     */

  }], [{
    key: "setConfig",
    value: function setConfig(config) {
      App.config = _.merge({}, App.config, config);
      App.config.server = App.config.servers[App.config.environment];
    }
  }, {
    key: "webSessionExists",
    value: function () {
      var _webSessionExists = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(did, appName) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", _web["default"].hasSessionKey(did, appName));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function webSessionExists(_x6, _x7) {
        return _webSessionExists.apply(this, arguments);
      }

      return webSessionExists;
    }()
  }, {
    key: "openExternalDatastore",
    value: function () {
      var _openExternalDatastore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(schemaName, did, config) {
        var dataserver;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                did = did.toLowerCase();
                _context6.next = 3;
                return App.buildDataserver(did, {
                  appName: config.appName || App.config.appName
                });

              case 3:
                dataserver = _context6.sent;
                config.did = did;
                return _context6.abrupt("return", dataserver.openDatastore(schemaName, config));

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function openExternalDatastore(_x8, _x9, _x10) {
        return _openExternalDatastore.apply(this, arguments);
      }

      return openExternalDatastore;
    }()
    /**
     * Open an application database owned by an external user
     *
     * @param {*} dbName
     * @param {*} did
     * @param {*} config
     */

  }, {
    key: "openExternalDatabase",
    value: function () {
      var _openExternalDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(dbName, did, config) {
        var dataserver;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                did = did.toLowerCase();
                _context7.next = 3;
                return App.buildDataserver(did, {
                  appName: config.appName || App.config.appName
                });

              case 3:
                dataserver = _context7.sent;
                config.did = did;
                return _context7.abrupt("return", dataserver.openDatabase(dbName, config));

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function openExternalDatabase(_x11, _x12, _x13) {
        return _openExternalDatabase.apply(this, arguments);
      }

      return openExternalDatabase;
    }()
    /**
     * Opens the public profile of any user in read only mode
     *
     * @param {*} did
     * @example
     * let profile = app.openProfile(userDid);
     * console.log(profile.get("email"));
     * @returns {DataStore} Datastore instance for the requested user profile
     */

  }, {
    key: "openProfile",
    value: function () {
      var _openProfile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(did, appName) {
        var datastore;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return App.openExternalDatastore("profile/public", did, {
                  appName: appName || App.config.vaultAppName,
                  permissions: {
                    read: "public",
                    write: "owner"
                  },
                  readOnly: true
                });

              case 2:
                datastore = _context8.sent;
                return _context8.abrupt("return", new _profile["default"](dataStore));

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function openProfile(_x14, _x15) {
        return _openProfile.apply(this, arguments);
      }

      return openProfile;
    }()
    /**
     * Get a JSON Schema object by name
     *
     * @param {string} schemaName That may be a name (ie: "social/contact") or a URL of a schema (ie: "https://test.com/schema.json")
     * @returns {Schema}
     */

  }, {
    key: "getSchema",
    value: function () {
      var _getSchema = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(schemaName, returnSpec) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!App.cache.schemas[schemaName]) {
                  App.cache.schemas[schemaName] = new _schema["default"](schemaName);
                }

                if (!returnSpec) {
                  _context9.next = 3;
                  break;
                }

                return _context9.abrupt("return", App.cache.schemas[schemaName].getSpecification());

              case 3:
                return _context9.abrupt("return", App.cache.schemas[schemaName]);

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function getSchema(_x16, _x17) {
        return _getSchema.apply(this, arguments);
      }

      return getSchema;
    }()
    /**
     * Build a dataserver connection to an external dataserver.
     *
     *
     * @param {*} did
     * @param {*} config
     */

  }, {
    key: "buildDataserver",
    value: function () {
      var _buildDataserver = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(did, config) {
        var vidDoc, dataserverDoc, dataserverUrl, dataserver;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                did = did.toLowerCase();
                config = _.merge({
                  appName: App.config.appName,
                  did: did
                }, config);

                if (!App.cache.dataservers[did + ':' + config.appName]) {
                  _context10.next = 4;
                  break;
                }

                return _context10.abrupt("return", App.cache.dataservers[did + ':' + config.appName]);

              case 4:
                _context10.next = 6;
                return _vid["default"].getByDid(did, config.appName);

              case 6:
                vidDoc = _context10.sent;

                if (vidDoc) {
                  _context10.next = 9;
                  break;
                }

                throw "Unable to locate application VID. User hasn't initialised this application? (" + did + " / " + config.appName + ")";

              case 9:
                dataserverDoc = vidDoc.service.find(function (entry) {
                  return entry.id.includes('dataserver');
                });
                dataserverUrl = dataserverDoc.serviceEndpoint; // Build dataserver config, merging defaults and user defined config

                config = _.merge({
                  isProfile: false,
                  serverUrl: dataserverUrl,
                  dbManager: this.dbManager
                }, config); // Build dataserver

                dataserver = new _dataserver["default"](config);
                dataserver.loadExternal({
                  vid: vidDoc.id
                }); // Cache and return dataserver

                App.cache.dataservers[did + ':' + config.appName] = dataserver;
                return _context10.abrupt("return", App.cache.dataservers[did + ':' + config.appName]);

              case 16:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function buildDataserver(_x18, _x19) {
        return _buildDataserver.apply(this, arguments);
      }

      return buildDataserver;
    }()
  }]);

  return App;
}();

App.Helpers = {
  vid: _vid["default"],
  wallet: _wallet["default"],
  trust: _trust["default"],
  credentials: _credentials["default"],
  schema: _schema["default"],
  encryption: _encryption["default"]
};
App.cache = {
  schemas: {},
  dataservers: {}
};
App.config = _config["default"];
var _default = App;
exports["default"] = _default;