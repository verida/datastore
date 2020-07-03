"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _encrypted = _interopRequireDefault(require("./databases/encrypted"));

var _public = _interopRequireDefault(require("./databases/public"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/*eslint no-unused-vars: "off"*/

/*eslint no-console: "off"*/
var crypto = require('crypto');

var uuidv1 = require('uuid/v1');

var EventEmitter = require('events');

var _ = require('lodash');

var Database = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Database, _EventEmitter);

  var _super = _createSuper(Database);

  /**
   * Create a new database.
   * 
   * **Do not instantiate directly.**
   */
  function Database(dbName, did, appName, dataserver, config) {
    var _this;

    _classCallCheck(this, Database);

    _this = _super.call(this);
    _this.dbName = dbName;
    _this.did = did.toLowerCase();
    _this.appName = appName; // User will be the user who owns this database
    // Will be null if the user isn't the current user
    // (ie: for a public / external database)

    _this.user = config.user; // Signing user will be the logged in user

    _this.signUser = config.signUser || config.user;
    _this.signAppName = config.signAppName || _this.appName;
    _this.dataserver = dataserver;
    _this.config = _.merge({}, config);
    _this.permissions = {};
    _this.permissions = _.merge({
      read: "owner",
      write: "owner",
      readUsers: [],
      writeUsers: []
    }, _this.config.permissions ? _this.config.permissions : {});
    _this.readOnly = _this.config.readOnly ? true : false;
    _this._dbHash = null;
    _this._db = null;
    return _this;
  } // DID + AppName + DB Name + readPerm + writePerm


  _createClass(Database, [{
    key: "getDatabaseHash",
    value: function getDatabaseHash() {
      if (this._dbHash) {
        return this._dbHash;
      }

      var text = [this.did, this.appName, this.dbName].join("/");
      var hash = crypto.createHash('md5').update(text).digest("hex");
      this._dbHash = "v" + hash; // Database name must start with a letter

      return this._dbHash;
    }
    /**
     * Save data to an application schema.
     * 
     * @param {object} data Data to be saved. Will be validated against the schema associated with this Datastore.
     * @param {object} [options] Database options that will be passed through to [PouchDB.put()](https://pouchdb.com/api.html#create_document)
     * @fires Database#beforeInsert Event fired before inserting a new record
     * @fires Database#beforeUpdate Event fired before updating a new record
     * @fires Database#afterInsert Event fired after inserting a new record
     * @fires Database#afterUpdate Event fired after updating a new record
     * @example
     * let result = await datastore.save({
     *  "firstName": "John",
     *  "lastName": "Doe"
     * });
     * 
     * if (!result) {
     *  console.errors(datastore.errors);
     * } else {
     *  console.log("Successfully saved");
     * }
     * @returns {boolean} Boolean indicating if the save was successful. If not successful `this.errors` will be populated.
     */

  }, {
    key: "save",
    value: function () {
      var _save = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, options) {
        var defaults, insert, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._init();

              case 2:
                if (!this.readOnly) {
                  _context.next = 4;
                  break;
                }

                throw "Unable to save. Read only.";

              case 4:
                defaults = {
                  forceInsert: false
                };
                options = _.merge(defaults, options);
                insert = false; // Set inserted at if not defined
                // (Assuming it's not defined as we have an insert)

                if (data._id === undefined || options.forceInsert) {
                  insert = true;
                }

                if (!insert) {
                  _context.next = 14;
                  break;
                }

                _context.next = 11;
                return this._beforeInsert(data);

              case 11:
                /**
                 * Fired before a new record is inserted.
                 * 
                 * @event Database#beforeInsert
                 * @param {object} data Data that was saved
                 */
                this.emit("beforeInsert", data);
                _context.next = 17;
                break;

              case 14:
                _context.next = 16;
                return this._beforeUpdate(data);

              case 16:
                /**
                 * Fired before a new record is updated.
                 * 
                 * @event Database#beforeUpdate
                 * @param {object} data Data that was saved
                 */
                this.emit("beforeUpdate", data);

              case 17:
                _context.next = 19;
                return this._db.put(data, options);

              case 19:
                response = _context.sent;

                if (insert) {
                  this._afterInsert();
                  /**
                   * Fired after a new record is inserted.
                   * 
                   * @event Database#afterInsert
                   * @param {object} data Data that was saved
                   */


                  this.emit("afterInsert", data, response);
                } else {
                  this._afterUpdate();
                  /**
                   * Fired after a new record is updated.
                   * 
                   * @event Database#afterUpdate
                   * @param {object} data Data that was saved
                   */


                  this.emit("afterUpdate", data, response);
                }

                return _context.abrupt("return", response);

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function save(_x, _x2) {
        return _save.apply(this, arguments);
      }

      return save;
    }()
    /**
     * Get many rows from the database.
     * 
     * @param {object} filter Optional query filter matching CouchDB find() syntax.
     * @param {object} options Options passed to CouchDB find().
     * @param {object} options.raw Returns the raw CouchDB result, otherwise just returns the documents
     */

  }, {
    key: "getMany",
    value: function () {
      var _getMany = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filter, options) {
        var defaults, raw, docs;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._init();

              case 2:
                filter = filter || {};
                defaults = {
                  limit: 20
                };
                options = _.merge(defaults, options);
                filter = this.applySortFix(filter, options.sort || {});
                raw = options.raw || false;
                delete options['raw'];

                if (filter) {
                  options.selector = _.merge(options.selector, filter);
                }

                _context2.prev = 9;
                _context2.next = 12;
                return this._db.find(options);

              case 12:
                docs = _context2.sent;

                if (!docs) {
                  _context2.next = 15;
                  break;
                }

                return _context2.abrupt("return", raw ? docs : docs.docs);

              case 15:
                _context2.next = 20;
                break;

              case 17:
                _context2.prev = 17;
                _context2.t0 = _context2["catch"](9);
                console.log(_context2.t0);

              case 20:
                return _context2.abrupt("return");

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[9, 17]]);
      }));

      function getMany(_x3, _x4) {
        return _getMany.apply(this, arguments);
      }

      return getMany;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(doc, options) {
        var defaults;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.readOnly) {
                  _context3.next = 2;
                  break;
                }

                throw "Unable to delete. Read only.";

              case 2:
                defaults = {};
                options = _.merge(defaults, options);

                if (!(typeof doc === "string")) {
                  _context3.next = 8;
                  break;
                }

                _context3.next = 7;
                return this.get(doc);

              case 7:
                doc = _context3.sent;

              case 8:
                doc._deleted = true;
                return _context3.abrupt("return", this.save(doc, options));

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _delete(_x5, _x6) {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(docId, options) {
        var defaults;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._init();

              case 2:
                defaults = {};
                options = _.merge(defaults, options);
                _context4.next = 6;
                return this._db.get(docId, options);

              case 6:
                return _context4.abrupt("return", _context4.sent);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function get(_x7, _x8) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "_init",
    value: function () {
      var _init2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var dbHashName, encryptionKey, remoteDsn, db, _db, _encryptionKey, _remoteDsn, _db2;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this._db) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return");

              case 2:
                // private data (owner, owner) -- use private
                // public profile (readOnly) -- use public
                // public inbox (public, private) -- is that even possible? may need to be public, public
                // group data -- (users, users)
                dbHashName = this.getDatabaseHash();

                if (!(this.permissions.read == "owner" && this.permissions.write == "owner")) {
                  _context5.next = 23;
                  break;
                }

                _context5.prev = 4;
                _context5.next = 7;
                return this.dataserver.getDbKey(this.user, dbHashName);

              case 7:
                encryptionKey = _context5.sent;
                _context5.next = 10;
                return this.dataserver.getDsn(this.user);

              case 10:
                remoteDsn = _context5.sent;
                db = new _encrypted["default"](dbHashName, this.dataserver, encryptionKey, remoteDsn, this.did, this.permissions);
                this._originalDb = db;
                _context5.next = 15;
                return db.getDb();

              case 15:
                this._db = _context5.sent;
                _context5.next = 21;
                break;

              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](4);
                throw new Error("Error creating owner database (" + this.dbName + ") for " + this.did + ": " + _context5.t0.message);

              case 21:
                _context5.next = 59;
                break;

              case 23:
                if (!(this.permissions.read == "public")) {
                  _context5.next = 36;
                  break;
                }

                _context5.prev = 24;
                _db = new _public["default"](dbHashName, this.dataserver, this.did, this.permissions, this.config.isOwner);
                _context5.next = 28;
                return _db.getDb();

              case 28:
                this._db = _context5.sent;
                _context5.next = 34;
                break;

              case 31:
                _context5.prev = 31;
                _context5.t1 = _context5["catch"](24);
                throw new Error("Error creating public database (" + this.dbName + " / " + dbHashName + ") for " + this.did + ": " + _context5.t1.message);

              case 34:
                _context5.next = 59;
                break;

              case 36:
                if (!(this.permissions.read == "users" || this.permissions.write == "users")) {
                  _context5.next = 58;
                  break;
                }

                _context5.prev = 37;
                _encryptionKey = this.config.encryptionKey;

                if (!(!_encryptionKey && this.config.isOwner)) {
                  _context5.next = 43;
                  break;
                }

                _context5.next = 42;
                return this.dataserver.getDbKey(this.user, dbHashName);

              case 42:
                _encryptionKey = _context5.sent;

              case 43:
                _context5.next = 45;
                return this.dataserver.getDsn(this.user);

              case 45:
                _remoteDsn = _context5.sent;
                _db2 = new _encrypted["default"](dbHashName, this.dataserver, _encryptionKey, _remoteDsn, this.did, this.permissions);
                this._originalDb = _db2;
                _context5.next = 50;
                return _db2.getDb();

              case 50:
                this._db = _context5.sent;
                _context5.next = 56;
                break;

              case 53:
                _context5.prev = 53;
                _context5.t2 = _context5["catch"](37);
                throw new Error("Error creating encrypted database (" + this.dbName + " for " + this.did + ": " + _context5.t2.message);

              case 56:
                _context5.next = 59;
                break;

              case 58:
                throw "Unknown database permissions requested";

              case 59:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[4, 18], [24, 31], [37, 53]]);
      }));

      function _init() {
        return _init2.apply(this, arguments);
      }

      return _init;
    }()
  }, {
    key: "_beforeInsert",
    value: function () {
      var _beforeInsert2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(data) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!data._id) {
                  data._id = uuidv1();
                }

                data.insertedAt = new Date().toISOString();
                data.modifiedAt = new Date().toISOString();
                _context6.next = 5;
                return this.signData(data);

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _beforeInsert(_x9) {
        return _beforeInsert2.apply(this, arguments);
      }

      return _beforeInsert;
    }()
  }, {
    key: "_beforeUpdate",
    value: function () {
      var _beforeUpdate2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(data) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                data.modifiedAt = new Date().toISOString();
                _context7.next = 3;
                return this.signData(data);

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _beforeUpdate(_x10) {
        return _beforeUpdate2.apply(this, arguments);
      }

      return _beforeUpdate;
    }()
  }, {
    key: "_afterInsert",
    value: function _afterInsert(data, response) {}
  }, {
    key: "_afterUpdate",
    value: function _afterUpdate(data, response) {}
    /**
     * Get the underlying PouchDB instance associated with this database.
     * 
     * @see {@link https://pouchdb.com/api.html#overview|PouchDB documentation}
     * @returns {PouchDB}
     */

  }, {
    key: "getInstance",
    value: function () {
      var _getInstance = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this._init();

              case 2:
                return _context8.abrupt("return", this._db);

              case 3:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getInstance() {
        return _getInstance.apply(this, arguments);
      }

      return getInstance;
    }()
    /**
     * See PouchDB bug: https://github.com/pouchdb/pouchdb/issues/6399
     * 
     * This method automatically detects any fields being sorted on and
     * adds them to an $and clause to ensure query indexes are used.
     * 
     * Note: This still requires the appropriate index to exist for
     * sorting to work.
     */

  }, {
    key: "applySortFix",
    value: function applySortFix(filter, sortItems) {
      if (sortItems.length) {
        var and = [filter];

        for (var s in sortItems) {
          var sort = sortItems[s];

          for (var fieldName in sort) {
            var d = {};
            d[fieldName] = {
              $gt: true
            };
            and.push(d);
          }
        }

        filter = {
          $and: and
        };
      }

      return filter;
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
      var _signData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(data) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (this.signUser) {
                  _context9.next = 2;
                  break;
                }

                throw new Error("Unable to sign data. No signing user specified.");

              case 2:
                this.signUser.signData(data, this.signAppName);

              case 3:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function signData(_x11) {
        return _signData.apply(this, arguments);
      }

      return signData;
    }()
  }]);

  return Database;
}(EventEmitter);

var _default = Database;
exports["default"] = _default;