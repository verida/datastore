"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _didJwt = _interopRequireDefault(require("did-jwt"));

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Trust = /*#__PURE__*/function () {
  function Trust() {
    _classCallCheck(this, Trust);
  }

  _createClass(Trust, null, [{
    key: "decodeDidJwt",

    /**
     * Decode a DID-JWT
     * 
     * @param {string} didJwt 
     */
    value: function decodeDidJwt(didJwt) {
      return _didJwt["default"].decodeJWT(didJwt);
    }
    /**
     * Get a list of the profiles that signed a piece of data
     * 
     * @param {object} data 
     */

  }, {
    key: "getSigners",
    value: function () {
      var _getSigners = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
        var signers, did, profile;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (data.signatures) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", []);

              case 2:
                signers = [];
                _context.t0 = regeneratorRuntime.keys(data.signatures);

              case 4:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 12;
                  break;
                }

                did = _context.t1.value;
                _context.next = 8;
                return _app["default"].openProfile(did);

              case 8:
                profile = _context.sent;
                signers[did] = profile;
                _context.next = 4;
                break;

              case 12:
                return _context.abrupt("return", signers);

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getSigners(_x) {
        return _getSigners.apply(this, arguments);
      }

      return getSigners;
    }()
    /**
     * 
     * @param {object} data 
     * @param {string} did 
     * @param {string} signature 
     * @todo Implement
     */

  }, {
    key: "verifySignature",
    value: function verifySignature(data, did, signature) {
      return true;
    }
  }]);

  return Trust;
}();

var _default = Trust;
exports["default"] = _default;