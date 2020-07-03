"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _app = _interopRequireDefault(require("./app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = require('lodash');
/**
 * A datastore wrapper around a given database and schema.
 * 
 * @property {array} errors Array of most recent errors.
 * @property {string} schemaName Name of the schema used on this Datastore.
 */


var DataStore = /*#__PURE__*/function () {
  /**
   * Create a new Datastore.
   * 
   * **Do not instantiate directly.**
   * @example <caption>Binding to database changes</caption>
   * // open datastore and fetch database
   * let datastore = await app.openDataStore("employment");
   * let db = datastore.getDb();
   * 
   * // fetch underlying PouchDB instance (see PouchDB docs)
   * let pouch = db.getInstance();
   * pouch.changes({
   *      since: 'now',
   *      live: true,
   *      include_docs: true
   *  }).on('change', function() {
   *      console.log("Data has changed in the database");
   *  });
   * @example <caption>Binding to database events</caption>
   * let datastore = await app.openDataStore("employment");
   * let db = datastore.getDb();
   * 
   * db.on("afterInsert", function(data, response) {
   *  console.log("afterInsert() fired");
   *  console.log("Saved data", data);
   * }
   */
  function DataStore(dataserver, schemaName, did, appName, config) {
    _classCallCheck(this, DataStore);

    this._dataserver = dataserver;
    this._app = this._dataserver.app;
    this.schemaName = schemaName;
    this.schemaPath = null;
    this.appName = appName;
    this.did = did;
    this.errors = {};
    this.config = config;
    this._db = null;
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


  _createClass(DataStore, [{
    key: "save",
    value: function () {
      var _save = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, options) {
        var valid;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._init();

              case 2:
                data.schema = this.schemaPath;
                _context.next = 5;
                return this.schema.validate(data);

              case 5:
                valid = _context.sent;

                if (valid) {
                  _context.next = 9;
                  break;
                }

                this.errors = this.schema.errors;
                return _context.abrupt("return", false);

              case 9:
                return _context.abrupt("return", this._db.save(data, options));

              case 10:
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
     * Fetch a list of records from this Datastore.
     * 
     * Only returns records that belong to this Datastore's schema.
     * 
     * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @example
     * let results = datastore.getMany({
     *  name: 'John'
     * });
     * 
     * console.log(results);
     */

  }, {
    key: "getMany",
    value: function () {
      var _getMany = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(customFilter, options) {
        var filter;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._init();

              case 2:
                filter = _.merge({
                  schema: this.schemaPath
                }, customFilter);
                return _context2.abrupt("return", this._db.getMany(filter, options));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMany(_x3, _x4) {
        return _getMany.apply(this, arguments);
      }

      return getMany;
    }()
  }, {
    key: "getOne",
    value: function () {
      var _getOne = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(customFilter, options) {
        var results;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getMany(customFilter, options);

              case 2:
                results = _context3.sent;

                if (!(results && results.length)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", results[0]);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getOne(_x5, _x6) {
        return _getOne.apply(this, arguments);
      }

      return getOne;
    }()
    /**
     * Get a record by ID.
     * 
     * @param {string} key Unique ID of the record to fetch
     * @param {object} [options] Database options that will be passed through to [PouchDB.get()](https://pouchdb.com/api.html#fetch_document)
     */

  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(key, options) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._init();

              case 2:
                return _context4.abrupt("return", this._db.get(key, options));

              case 3:
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
    /**
     * Delete a record by ID.
     * 
     * @param {string} docId Unique ID of the record to delete
     */

  }, {
    key: "delete",
    value: function () {
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(docId) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this._init();

              case 2:
                return _context5.abrupt("return", this._db["delete"](docId));

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _delete(_x9) {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
    /**
     * Get the underlying database instance associated with this datastore.
     * 
     * **Note: Do not use unless you know what you're doing as you can easily corrupt a database by breaking schema data.**
     */

  }, {
    key: "getDb",
    value: function () {
      var _getDb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this._init();

              case 2:
                return _context6.abrupt("return", this._db);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getDb() {
        return _getDb.apply(this, arguments);
      }

      return getDb;
    }()
  }, {
    key: "getDataserver",
    value: function getDataserver() {
      return this._dataserver;
    }
  }, {
    key: "_init",
    value: function () {
      var _init2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var schemaJson, dbName, config, indexes;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!this._db) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return");

              case 2:
                _context7.next = 4;
                return _app["default"].getSchema(this.schemaName);

              case 4:
                this.schema = _context7.sent;
                _context7.next = 7;
                return this.schema.getSchemaJson();

              case 7:
                schemaJson = _context7.sent;
                dbName = this.config.dbName ? this.config.dbName : schemaJson.database.name;
                this.schemaPath = this.schema.path;
                config = _.merge({
                  appName: this.appName,
                  did: this.did
                }, this.config);
                _context7.next = 13;
                return this._dataserver.openDatabase(dbName, config);

              case 13:
                this._db = _context7.sent;
                indexes = schemaJson.database.indexes;

                if (!indexes) {
                  _context7.next = 18;
                  break;
                }

                _context7.next = 18;
                return this.ensureIndexes(indexes);

              case 18:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _init() {
        return _init2.apply(this, arguments);
      }

      return _init;
    }() // TODO: Support removing indexes that were deleted from the spec
    // TODO: Validate indexes

  }, {
    key: "ensureIndexes",
    value: function () {
      var _ensureIndexes = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(indexes) {
        var indexName, indexFields, db;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.t0 = regeneratorRuntime.keys(indexes);

              case 1:
                if ((_context8.t1 = _context8.t0()).done) {
                  _context8.next = 11;
                  break;
                }

                indexName = _context8.t1.value;
                indexFields = indexes[indexName];
                _context8.next = 6;
                return this._db.getInstance();

              case 6:
                db = _context8.sent;
                _context8.next = 9;
                return db.createIndex({
                  fields: indexFields,
                  name: indexName
                });

              case 9:
                _context8.next = 1;
                break;

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function ensureIndexes(_x10) {
        return _ensureIndexes.apply(this, arguments);
      }

      return ensureIndexes;
    }()
  }]);

  return DataStore;
}();

var _default = DataStore;
exports["default"] = _default;