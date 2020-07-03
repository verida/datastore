"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsonSchemaRefParser = _interopRequireDefault(require("json-schema-ref-parser"));

var _ajv = _interopRequireDefault(require("ajv"));

var _app = _interopRequireDefault(require("./app"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var resolveAllOf = require('json-schema-resolve-allof');

var draft6 = require('ajv/lib/refs/json-schema-draft-06.json'); // Custom resolver for RefParser
//const { ono } = require("ono");


var resolver = {
  order: 1,
  canRead: true,
  read: function read(file) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", Schema.loadJson(file.url));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  }
};

var Schema = /*#__PURE__*/function () {
  /**
   * An object representation of a JSON Schema.
   * 
   * **Do not instantiate directly.**
   * 
   * Access via {@link App#getSchema}
   * @param {object} path Path to a schema in the form (http://..../schema.json, /schemas/name/schema.json, name/of/schema)
   * @constructor
   */
  function Schema(path, options) {
    _classCallCheck(this, Schema);

    this.path = path;
    this.errors = [];
    options = _lodash["default"].merge({
      metaSchemas: [draft6],
      ajv: {
        loadSchema: Schema.loadJson,
        logger: false
      }
    }, options);
    this.ajv = new _ajv["default"](options.ajv);

    for (var s in options.metaSchemas) {
      this.ajv.addMetaSchema(options.metaSchemas[s]);
    }

    this._schemaJson = null;
    this._finalPath = null;
    this._specification = null;
    this._validate = null;
  }
  /**
   * @todo: Deprecate in favour of `getProperties()`
   * Get an object that represents the JSON Schema. Fully resolved.
   * Warning: This can cause issues with very large schemas.
   * 
   * @example
   * let schemaDoc = await app.getSchema("social/contact");
   * let spec = schemaDoc.getSpecification();
   * console.log(spec);
   * @returns {object} JSON object representing the defereferenced schema
   */


  _createClass(Schema, [{
    key: "getSpecification",
    value: function () {
      var _getSpecification = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var path;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this._specification) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", this._specification);

              case 2:
                _context2.next = 4;
                return this.getPath();

              case 4:
                path = _context2.sent;
                _context2.next = 7;
                return _jsonSchemaRefParser["default"].dereference(path, {
                  resolve: {
                    http: resolver
                  }
                });

              case 7:
                this._specification = _context2.sent;
                _context2.next = 10;
                return resolveAllOf(this._specification);

              case 10:
                return _context2.abrupt("return", this._specification);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getSpecification() {
        return _getSpecification.apply(this, arguments);
      }

      return getSpecification;
    }()
    /**
     * Validate a data object with this schema, using AJV
     * 
     * @param {object} data 
     * @returns {boolean} True if the data validates against the schema.
     */

  }, {
    key: "validate",
    value: function () {
      var _validate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
        var schemaJson, valid;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this._validate) {
                  _context3.next = 7;
                  break;
                }

                _context3.next = 3;
                return this.getSchemaJson();

              case 3:
                schemaJson = _context3.sent;
                _context3.next = 6;
                return this.ajv.compileAsync(schemaJson);

              case 6:
                this._validate = _context3.sent;

              case 7:
                _context3.next = 9;
                return this._validate(data);

              case 9:
                valid = _context3.sent;

                if (!valid) {
                  this.errors = this._validate.errors;
                }

                return _context3.abrupt("return", valid);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function validate(_x) {
        return _validate.apply(this, arguments);
      }

      return validate;
    }()
    /**
     * Fetch unresolved JSON schema
     */

  }, {
    key: "getSchemaJson",
    value: function () {
      var _getSchemaJson = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var path, fileData;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this._schemaJson) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return", this._schemaJson);

              case 2:
                _context4.next = 4;
                return this.getPath();

              case 4:
                path = _context4.sent;
                _context4.next = 7;
                return fetch(path);

              case 7:
                fileData = _context4.sent;
                _context4.next = 10;
                return fileData.json();

              case 10:
                this._schemaJson = _context4.sent;
                return _context4.abrupt("return", this._schemaJson);

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getSchemaJson() {
        return _getSchemaJson.apply(this, arguments);
      }

      return getSchemaJson;
    }()
  }, {
    key: "getIcon",
    value: function () {
      var _getIcon = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var path;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.getPath();

              case 2:
                path = _context5.sent;
                return _context5.abrupt("return", path.replace("schema.json", "icon.svg"));

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getIcon() {
        return _getIcon.apply(this, arguments);
      }

      return getIcon;
    }()
    /**
     * Get a rully resolveable path for a URL
     * 
     * Handle shortened paths:
     *  - `health/activity` -> `https://schemas.verida.io/health/activity/schema.json`
     *  - `https://schemas.verida.io/health/activity` -> `https://schemas.verida.io/health/activity/schema.json`
     *  - `/health/activity/test.json` -> `https://schemas.verida.io/health/activity/test.json`
     */

  }, {
    key: "getPath",
    value: function () {
      var _getPath = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var path;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this._finalPath) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt("return", this._finalPath);

              case 2:
                path = this.path; // If we have a full HTTP path, simply return it

                if (!path.match("http")) {
                  _context6.next = 6;
                  break;
                }

                this._finalPath = Schema.resolvePath(path);
                return _context6.abrupt("return", this._finalPath);

              case 6:
                // Prepend `/` if required (ie: "profile/public")
                if (path.substring(1) != '/') {
                  path = '/' + path;
                } // Append /schema.json if required


                if (path.substring(path.length - 5) != ".json") {
                  path += "/schema.json";
                }

                _context6.next = 10;
                return Schema.resolvePath(path);

              case 10:
                this._finalPath = _context6.sent;
                this.path = this._finalPath;
                return _context6.abrupt("return", this._finalPath);

              case 13:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getPath() {
        return _getPath.apply(this, arguments);
      }

      return getPath;
    }()
    /**
     * Force schema paths to be applied to URLs
     * 
     */

  }], [{
    key: "resolvePath",
    value: function () {
      var _resolvePath = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(uri) {
        var resolvePaths, searchPath, _resolvePath2;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                resolvePaths = _app["default"].config.server.schemaPaths;

                for (searchPath in resolvePaths) {
                  _resolvePath2 = resolvePaths[searchPath];

                  if (uri.substring(0, searchPath.length) == searchPath) {
                    uri = uri.replace(searchPath, _resolvePath2);
                  }
                }

                return _context7.abrupt("return", uri);

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function resolvePath(_x2) {
        return _resolvePath.apply(this, arguments);
      }

      return resolvePath;
    }()
    /**
     * Load JSON from a url that is fully resolved.
     * 
     * Used by AJV.
     * 
     * @param {*} uri 
     */

  }, {
    key: "loadJson",
    value: function () {
      var _loadJson = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(uri) {
        var request, json;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return Schema.resolvePath(uri);

              case 2:
                uri = _context8.sent;
                _context8.next = 5;
                return fetch(uri);

              case 5:
                request = _context8.sent;
                _context8.next = 8;
                return request.json();

              case 8:
                json = _context8.sent;
                return _context8.abrupt("return", json);

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function loadJson(_x3) {
        return _loadJson.apply(this, arguments);
      }

      return loadJson;
    }()
  }]);

  return Schema;
}();

var _default = Schema;
exports["default"] = _default;