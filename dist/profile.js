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

/**
 * Public profile for a user.
 */
var Profile = /*#__PURE__*/function () {
  /**
   * Create a new user profile.
   * 
   * **Do not instantiate directly.**
   * 
   * Access the current user's profile via {@link App.profile}
   * 
   * @constructor
   */
  function Profile(datastore) {
    _classCallCheck(this, Profile);

    this._store = datastore;
  }
  /**
   * Get a profile value by key
   * 
   * @param {string} key Profile key to get (ie: `email`)
   * @example
   * let emailDoc = app.wallet.profile.get('email');
   * 
   * // key = email
   * // value = john@doe.com
   * console.log(emailDoc.key, emailDoc.value);
   * @return {object} Database record for this profile key. Object has keys [`key`, `value`, `_id`, `_rev`].
   */


  _createClass(Profile, [{
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(key, options, extended) {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this._store.get(key, options);

              case 3:
                response = _context.sent;

                if (extended) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt("return", response.value);

              case 6:
                return _context.abrupt("return", response);

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);

                if (!(_context.t0.error == "not_found")) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt("return", null);

              case 13:
                throw _context.t0;

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      function get(_x, _x2, _x3) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
    /**
     * 
     * @param {string} key Profile key to delete (ie: `email`)
     * @returns {boolean} Boolean indicating if the delete was successful
     *
    async delete(key) {
        await this._init();
        return this._store.delete(key);
    }*/

    /**
     * Get many profile values.
     * 
     * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     */

  }, {
    key: "getMany",
    value: function () {
      var _getMany = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filter, options) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this._store.getMany(filter, options));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMany(_x4, _x5) {
        return _getMany.apply(this, arguments);
      }

      return getMany;
    }()
  }]);

  return Profile;
}();

var _default = Profile;
exports["default"] = _default;