"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _app = _interopRequireDefault(require("../app"));

var _base = _interopRequireDefault(require("./base"));

var _store = _interopRequireDefault(require("store"));

var _keyring = _interopRequireDefault(require("../keyring"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Web3 = require('web3');

var STORAGE_KEY = 'VERIDA_SESSION_';

var WebUser = /*#__PURE__*/function (_Base) {
  _inherits(WebUser, _Base);

  var _super = _createSuper(WebUser);

  /**
   * Create a new user.
   * 
   * **Do not instantiate directly.**
   * 
   * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
   * @property {string} address Blockchain address for this user (ie: `0xaef....`)
   */
  function WebUser(chain, address, appServerUrl, web3Provider) {
    var _this;

    _classCallCheck(this, WebUser);

    _this = _super.call(this, chain, address, appServerUrl);

    if (!web3Provider) {
      throw new Error("No web3 provider specified for server user");
    }

    _this.web3Provider = new Web3(web3Provider);
    return _this;
  }

  _createClass(WebUser, [{
    key: "_requestSignature",
    value: function () {
      var _requestSignature2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(signMessage) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", this.web3Provider.eth.personal.sign(signMessage, this.address));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _requestSignature(_x) {
        return _requestSignature2.apply(this, arguments);
      }

      return _requestSignature;
    }()
  }, {
    key: "saveToSession",
    value: function saveToSession(appName) {
      if (!this.appConfigs[appName]) {
        return false;
      }

      var _storageKey = WebUser.getSessionKey(this.did, appName);

      var data = {
        signature: this.appConfigs[appName].keyring.signature,
        vid: this.appConfigs[appName].vid
      };

      _store["default"].set(_storageKey, data);

      return true;
    }
  }, {
    key: "restoreFromSession",
    value: function restoreFromSession(appName) {
      var _storageKey = WebUser.getSessionKey(this.did, appName);

      var data = _store["default"].get(_storageKey);

      if (data) {
        this.appConfigs[appName] = {
          keyring: new _keyring["default"](data.signature),
          vid: data.vid
        };
        return true;
      }

      return false;
    }
  }, {
    key: "logout",
    value: function logout(appName) {
      _get(_getPrototypeOf(WebUser.prototype), "logout", this).call(this, appName);

      var _storageKey = WebUser.getSessionKey(this.did, appName);

      _store["default"].remove(_storageKey);
    }
  }], [{
    key: "getSessionKey",
    value: function getSessionKey(did, appName) {
      appName = appName || _app["default"].config.appName;
      return STORAGE_KEY + appName + did;
    }
  }, {
    key: "hasSessionKey",
    value: function hasSessionKey(did, appName) {
      var _storageKey = WebUser.getSessionKey(did, appName);

      var data = _store["default"].get(_storageKey);

      if (data) {
        return true;
      }

      return false;
    }
  }]);

  return WebUser;
}(_base["default"]);

var _default = WebUser;
exports["default"] = _default;