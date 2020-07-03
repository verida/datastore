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

/**
 * 
 */
var WalletHelper = /*#__PURE__*/function () {
  function WalletHelper() {
    _classCallCheck(this, WalletHelper);
  }

  _createClass(WalletHelper, [{
    key: "connectWeb3",

    /**
     * Helper to connect a wallet.
     */
    value: function () {
      var _connectWeb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(chain) {
        var web3Provider;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(chain == 'ethr')) {
                  _context.next = 19;
                  break;
                }

                if (!window.ethereum) {
                  _context.next = 13;
                  break;
                }

                // Modern dapp browsers...
                web3Provider = window.ethereum;
                _context.prev = 3;
                _context.next = 6;
                return window.ethereum.enable();

              case 6:
                _context.next = 11;
                break;

              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](3);
                throw Error("User denied account access");

              case 11:
                _context.next = 18;
                break;

              case 13:
                if (!window.web3) {
                  _context.next = 17;
                  break;
                }

                // Legacy dapp browsers...
                web3Provider = window.web3.currentProvider;
                _context.next = 18;
                break;

              case 17:
                throw Error("Unable to locate Ethereum");

              case 18:
                return _context.abrupt("return", web3Provider);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 8]]);
      }));

      function connectWeb3(_x) {
        return _connectWeb.apply(this, arguments);
      }

      return connectWeb3;
    }()
    /**
     * Helper to get the current address for a wallet.
     * 
     * @param {*} chain 
     */

    /*eslint no-console: "off"*/

  }, {
    key: "getAddress",
    value: function () {
      var _getAddress = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(chain) {
        var address;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = chain;
                _context2.next = _context2.t0 === 'ethr' ? 3 : 7;
                break;

              case 3:
                _context2.next = 5;
                return window.ethereum.enable();

              case 5:
                address = _context2.sent;
                return _context2.abrupt("return", address.toString());

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function getAddress(_x2) {
        return _getAddress.apply(this, arguments);
      }

      return getAddress;
    }()
  }]);

  return WalletHelper;
}();

var walletHelper = new WalletHelper();
var _default = walletHelper;
exports["default"] = _default;