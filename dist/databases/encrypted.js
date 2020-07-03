"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pouchdb = _interopRequireDefault(require("pouchdb"));

var _pouchdbFind = _interopRequireDefault(require("pouchdb-find"));

var _utils = _interopRequireDefault(require("../utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_pouchdb["default"].plugin(_pouchdbFind["default"]);

_pouchdb["default"].plugin(_pouchdbFind["default"]);

var CryptoPouch = require('crypto-pouch');

_pouchdb["default"].plugin(CryptoPouch);

var EncryptedDatabase = /*#__PURE__*/function () {
  /**
   * 
   * @param {*} dbName 
   * @param {*} dataserver 
   * @param {string} encryptionKey sep256k1 hex string representing encryption key (0x)
   * @param {*} remoteDsn 
   * @param {*} did 
   * @param {*} permissions 
   */
  function EncryptedDatabase(dbName, dataserver, encryptionKey, remoteDsn, did, permissions) {
    _classCallCheck(this, EncryptedDatabase);

    this.dbName = dbName;
    this.dataserver = dataserver;
    this.did = did;
    this.permissions = permissions;
    this.encryptionKey = encryptionKey;
    this.remoteDsn = remoteDsn;
  }

  _createClass(EncryptedDatabase, [{
    key: "_init",
    value: function () {
      var _init2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var encryptionKey, info;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this._localDbEncrypted = new _pouchdb["default"](this.dbName);
                this._localDb = new _pouchdb["default"](this.dbName);
                encryptionKey = Buffer.from(this.encryptionKey.slice(2), 'hex');

                this._localDb.crypto("", {
                  "key": encryptionKey,
                  cb: function cb(err) {
                    if (err) {
                      console.error('Unable to connect to local DB');
                      console.error(err);
                    }
                  }
                });

                this._remoteDbEncrypted = new _pouchdb["default"](this.remoteDsn + this.dbName, {
                  skip_setup: true
                });
                _context.prev = 5;
                _context.next = 8;
                return this._remoteDbEncrypted.info();

              case 8:
                info = _context.sent;

                if (!(info.error && info.error == "not_found")) {
                  _context.next = 12;
                  break;
                }

                _context.next = 12;
                return this.createDb();

              case 12:
                _context.next = 18;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](5);
                _context.next = 18;
                return this.createDb();

              case 18:
                _context.next = 20;
                return this._localDbEncrypted.replicate.from(this._remoteDbEncrypted);

              case 20:
                // then two-way, continuous, retriable sync
                _pouchdb["default"].sync(this._localDbEncrypted, this._remoteDbEncrypted, {
                  live: true,
                  retry: true
                }).on("error", function (err) {
                  console.log("sync error");
                  console.log(err);
                }).on("denied", function (err) {
                  console.log("denied error");
                  console.log(err);
                });

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 14]]);
      }));

      function _init() {
        return _init2.apply(this, arguments);
      }

      return _init;
    }()
  }, {
    key: "createDb",
    value: function () {
      var _createDb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var options, client;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = {
                  permissions: this.permissions
                };
                _context2.next = 3;
                return this.dataserver.getClient();

              case 3:
                client = _context2.sent;
                _context2.prev = 4;
                _context2.next = 7;
                return client.createDatabase(this.did, this.dbName, options);

              case 7:
                _context2.next = 9;
                return _utils["default"].sleep(1000);

              case 9:
                _context2.next = 14;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2["catch"](4);
                throw new Error("User doesn't exist or unable to create user database");

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 11]]);
      }));

      function createDb() {
        return _createDb.apply(this, arguments);
      }

      return createDb;
    }()
  }, {
    key: "getDb",
    value: function () {
      var _getDb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this._localDb) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return this._init();

              case 3:
                return _context3.abrupt("return", this._localDb);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getDb() {
        return _getDb.apply(this, arguments);
      }

      return getDb;
    }()
  }]);

  return EncryptedDatabase;
}();

var _default = EncryptedDatabase;
exports["default"] = _default;