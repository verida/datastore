"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*eslint no-console: "off"*/
var axios = require('axios');

var Client = /*#__PURE__*/function () {
  function Client(dataserver) {
    _classCallCheck(this, Client);

    this._dataserver = dataserver;
    this._axios = null;
    this.username = null;
    this.signature = null;
    this.isProfile = this._dataserver.config.isProfile ? true : false;
  }

  _createClass(Client, [{
    key: "getUser",
    value: function () {
      var _getUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(did) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", this.getAxios(true).get(this._dataserver.serverUrl + "user/get?did=" + did));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getUser(_x) {
        return _getUser.apply(this, arguments);
      }

      return getUser;
    }()
  }, {
    key: "getPublicUser",
    value: function () {
      var _getPublicUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.getAxios(false).get(this._dataserver.serverUrl + "user/public"));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getPublicUser() {
        return _getPublicUser.apply(this, arguments);
      }

      return getPublicUser;
    }()
  }, {
    key: "createUser",
    value: function () {
      var _createUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(did) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", this.getAxios(true).post(this._dataserver.serverUrl + "user/create", {
                  did: did
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function createUser(_x2) {
        return _createUser.apply(this, arguments);
      }

      return createUser;
    }()
  }, {
    key: "createDatabase",
    value: function () {
      var _createDatabase = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(did, databaseName, options) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                options = options ? options : {};
                return _context4.abrupt("return", this.getAxios(true).post(this._dataserver.serverUrl + "user/createDatabase", {
                  did: did,
                  databaseName: databaseName,
                  options: options
                }));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function createDatabase(_x3, _x4, _x5) {
        return _createDatabase.apply(this, arguments);
      }

      return createDatabase;
    }()
  }, {
    key: "getAxios",
    value: function getAxios(includeAuth) {
      var config = {
        headers: {
          "Application-Name": this._dataserver.appName,
          "Profile-Request": this.isProfile
        }
      };

      if (includeAuth) {
        if (!this.username) {
          throw Error("Username not specified");
        }

        if (!this.signature) {
          throw Error("Signature not specified");
        }

        config.auth = {
          username: this.username.replace(/:/g, "_"),
          password: this.signature
        };
      }

      return axios.create(config);
    }
  }]);

  return Client;
}();

var _default = Client;
exports["default"] = _default;