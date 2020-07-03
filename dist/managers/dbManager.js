"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ethers = require("ethers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = require('lodash');

var DbManager = /*#__PURE__*/function () {
  function DbManager(app) {
    _classCallCheck(this, DbManager);

    this._app = app;
    this._dbStore = null;
  }

  _createClass(DbManager, [{
    key: "saveDb",
    value: function () {
      var _saveDb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(dbName, did, appName, permissions, encryptionKey, options) {
        var id, dbData, doc, saved;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.init();

              case 2:
                options = _.merge({
                  key: {
                    type: "secp256k1"
                  }
                }, options);
                id = this.buildDbId(dbName, did, appName);
                dbData = {
                  _id: id,
                  dbName: dbName,
                  did: did,
                  applicationName: appName,
                  permissions: permissions,
                  encryptionKey: {
                    key: encryptionKey,
                    type: options.key.type
                  }
                };
                _context.next = 7;
                return this._dbStore.getOne({
                  _id: id
                });

              case 7:
                doc = _context.sent;

                if (doc) {
                  _context.next = 13;
                  break;
                }

                _context.next = 11;
                return this._dbStore.save(dbData, {
                  forceInsert: true
                });

              case 11:
                saved = _context.sent;

                if (!saved) {
                  console.error(this._dbStore.errors);
                }

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function saveDb(_x, _x2, _x3, _x4, _x5, _x6) {
        return _saveDb.apply(this, arguments);
      }

      return saveDb;
    }()
  }, {
    key: "getMany",
    value: function () {
      var _getMany = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filter, options) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.init();

              case 2:
                return _context2.abrupt("return", this._dbStore.getMany(filter, options));

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMany(_x7, _x8) {
        return _getMany.apply(this, arguments);
      }

      return getMany;
    }()
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(dbName, did, appName) {
        var dbId;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.init();

              case 2:
                dbId = this.buildDbId(dbName, did, appName);
                return _context3.abrupt("return", this._dbStore.getOne(dbId));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function get(_x9, _x10, _x11) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
    /*
    @todo: Support updating permissions on a user database
    async updatePermissions(dbName, config) {
        // will need dataserver connection
    }*/

  }, {
    key: "buildDbId",
    value: function buildDbId(dbName, did, appName) {
      return _ethers.utils.hashMessage(dbName + '_' + did + '_' + appName);
    }
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this._dbStore) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                _context4.next = 4;
                return this._app.openDatastore('storage/database', {
                  saveDatabase: false
                });

              case 4:
                this._dbStore = _context4.sent;

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }]);

  return DbManager;
}();

var _default = DbManager;
exports["default"] = _default;