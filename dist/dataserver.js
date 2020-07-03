"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _datastore = _interopRequireDefault(require("./datastore"));

var _client = _interopRequireDefault(require("./client"));

var _lodash = _interopRequireDefault(require("lodash"));

var _database = _interopRequireDefault(require("./database"));

var _app = _interopRequireDefault(require("./app"));

var _crypto = _interopRequireDefault(require("crypto"));

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DataServer = /*#__PURE__*/function () {
  function DataServer(config) {
    _classCallCheck(this, DataServer);

    var defaults = {
      datastores: {}
    };
    this.config = _lodash["default"].merge(defaults, config);
    this.appName = config.appName ? config.appName : _app["default"].config.appName;
    this.appHost = config.appHost ? config.appHost : _app["default"].config.appHost;
    this.dbManager = config.dbManager;
    this.serverUrl = config.serverUrl;
    this.isProfile = config.isProfile ? config.isProfile : false;
    this._client = new _client["default"](this); // By default, dataserver access is public only

    this._publicCredentials = null;
    this._datastores = {}; // @todo: difference if public v nonpublic?

    this._user = null;
    this._keyring = null;
    this._vid = null;
    this._dsn = null;
  }
  /**
   * Authorize a user to have full permissions to this dataserver
   * 
   * @param {*} force 
   */


  _createClass(DataServer, [{
    key: "connect",
    value: function () {
      var _connect = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(user, force) {
        var userConfig, dsUser;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this._userConfig && this._userConfig)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", true);

              case 2:
                _context.next = 4;
                return user.getAppConfig(this.appName, force);

              case 4:
                userConfig = _context.sent;

                if (userConfig) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", false);

              case 7:
                _context.next = 9;
                return this._getUser(user, userConfig.keyring.signature);

              case 9:
                dsUser = _context.sent;
                this._keyring = userConfig.keyring;
                this._vid = userConfig.vid;
                this._dsn = dsUser.dsn; // configure client

                this._client.username = user.did;
                this._client.signature = userConfig.keyring.signature;
                this._user = user;
                return _context.abrupt("return", true);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connect(_x, _x2) {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
    /**
     * Load an external data server
     */

  }, {
    key: "loadExternal",
    value: function () {
      var _loadExternal = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(config) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._vid = config.vid;

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function loadExternal(_x3) {
        return _loadExternal.apply(this, arguments);
      }

      return loadExternal;
    }()
  }, {
    key: "logout",
    value: function logout() {
      this._connected = false;

      this._user.logout(this.appName);
    }
  }, {
    key: "getPublicCredentials",
    value: function () {
      var _getPublicCredentials = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this._publicCredentials) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", this._publicCredentials);

              case 2:
                _context3.next = 4;
                return this._client.getPublicUser();

              case 4:
                response = _context3.sent;
                this._publicCredentials = response.data.user;
                return _context3.abrupt("return", this._publicCredentials);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getPublicCredentials() {
        return _getPublicCredentials.apply(this, arguments);
      }

      return getPublicCredentials;
    }()
    /**
     * 
     * @param {*} dbName 
     * @param {*} config 
     */

  }, {
    key: "openDatabase",
    value: function () {
      var _openDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(dbName, config) {
        var did, db;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (dbName) {
                  _context4.next = 2;
                  break;
                }

                throw new Error("No database name provided");

              case 2:
                config = _lodash["default"].merge({
                  permissions: {
                    read: "owner",
                    write: "owner"
                  },
                  user: this._user,
                  did: this.config.did,
                  saveDatabase: true
                }, config); // If permissions require "owner" access, connect the current user

                if (!((config.permissions.read == "owner" || config.permissions.write == "owner") && !config.readOnly)) {
                  _context4.next = 8;
                  break;
                }

                if (!(!config.readOnly && !config.user)) {
                  _context4.next = 6;
                  break;
                }

                throw new Error("Unable to open database. Permissions require \"owner\" access, but no user supplied in config.");

              case 6:
                _context4.next = 8;
                return this.connect(config.user, true);

              case 8:
                // Default to user's did if not specified
                did = config.did;

                if (config.user) {
                  did = config.did || config.user.did;
                  config.isOwner = did == (config.user ? config.user.did : false);
                }

                did = did.toLowerCase(); // @todo Cache databases so we don't open the same one more than once

                db = new _database["default"](dbName, did, this.appName, this, config);
                _context4.next = 14;
                return db._init();

              case 14:
                if (config.saveDatabase && db._originalDb) {
                  this.dbManager.saveDb(dbName, did, this.appName, config.permissions, db._originalDb.encryptionKey);
                }

                return _context4.abrupt("return", db);

              case 16:
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
  }, {
    key: "openDatastore",
    value: function () {
      var _openDatastore = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(schemaName, config) {
        var did, datastoreName, dsHash;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                config = _lodash["default"].merge({
                  permissions: {
                    read: "owner",
                    write: "owner"
                  },
                  user: this._user,
                  did: this.config.did
                }, config); // Default to user's did if not specified

                did = config.did;

                if (config.user) {
                  did = config.did || config.user.did;
                  config.isOwner = did == (config.user ? config.user.did : false);
                }

                if (did) {
                  _context5.next = 5;
                  break;
                }

                throw new Error("No DID specified in config and no user connected");

              case 5:
                did = did.toLowerCase();
                datastoreName = config.dbName ? config.dbName : schemaName;
                dsHash = _utils["default"].md5FromArray([datastoreName, did, config.readOnly ? true : false]);

                if (!this._datastores[dsHash]) {
                  _context5.next = 10;
                  break;
                }

                return _context5.abrupt("return", this._datastores[dsHash]);

              case 10:
                if (!((config.permissions.read == "owner" || config.permissions.write == "owner") && !(config.readOnly === true))) {
                  _context5.next = 15;
                  break;
                }

                if (config.user) {
                  _context5.next = 13;
                  break;
                }

                throw new Error("Unable to open database. Permissions require \"owner\" access, but no user supplied in config.");

              case 13:
                _context5.next = 15;
                return this.connect(config.user, true);

              case 15:
                this._datastores[dsHash] = new _datastore["default"](this, schemaName, did, this.appName, config);
                return _context5.abrupt("return", this._datastores[dsHash]);

              case 17:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function openDatastore(_x6, _x7) {
        return _openDatastore.apply(this, arguments);
      }

      return openDatastore;
    }()
    /**
     * Get the default symmetric encryption key
     */

  }, {
    key: "getDbKey",
    value: function () {
      var _getDbKey = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(user, dbName) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this._keyring) {
                  _context6.next = 3;
                  break;
                }

                _context6.next = 3;
                return this.connect(user, true);

              case 3:
                return _context6.abrupt("return", this._keyring.getDbKey(dbName));

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getDbKey(_x8, _x9) {
        return _getDbKey.apply(this, arguments);
      }

      return getDbKey;
    }()
  }, {
    key: "getClient",
    value: function () {
      var _getClient = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(user) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (this._keyring) {
                  _context7.next = 3;
                  break;
                }

                _context7.next = 3;
                return this.connect(user, true);

              case 3:
                return _context7.abrupt("return", this._client);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getClient(_x10) {
        return _getClient.apply(this, arguments);
      }

      return getClient;
    }()
  }, {
    key: "getDsn",
    value: function () {
      var _getDsn = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(user) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (this._keyring) {
                  _context8.next = 3;
                  break;
                }

                _context8.next = 3;
                return this.connect(user, true);

              case 3:
                return _context8.abrupt("return", this._dsn);

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getDsn(_x11) {
        return _getDsn.apply(this, arguments);
      }

      return getDsn;
    }()
  }, {
    key: "_generatePassword",
    value: function _generatePassword(signature) {
      return _crypto["default"].createHash('sha256').update(signature).digest("hex");
    }
  }, {
    key: "_getUser",
    value: function () {
      var _getUser2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(user, signature) {
        var response;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                this._client.username = user.did;
                this._client.signature = signature;
                _context9.next = 5;
                return this._client.getUser(user.did);

              case 5:
                response = _context9.sent;
                _context9.next = 21;
                break;

              case 8:
                _context9.prev = 8;
                _context9.t0 = _context9["catch"](0);

                if (!(_context9.t0.response && _context9.t0.response.data.data && _context9.t0.response.data.data.did == "Invalid DID specified")) {
                  _context9.next = 16;
                  break;
                }

                _context9.next = 13;
                return this._client.createUser(user.did, this._generatePassword(signature));

              case 13:
                response = _context9.sent;
                _context9.next = 21;
                break;

              case 16:
                if (!(_context9.t0.response && _context9.t0.response.statusText == "Unauthorized")) {
                  _context9.next = 20;
                  break;
                }

                throw new Error("Invalid signature or permission to access DID server");

              case 20:
                throw _context9.t0;

              case 21:
                return _context9.abrupt("return", response.data.user);

              case 22:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[0, 8]]);
      }));

      function _getUser(_x12, _x13) {
        return _getUser2.apply(this, arguments);
      }

      return _getUser;
    }()
  }]);

  return DataServer;
}();

var _default = DataServer;
exports["default"] = _default;