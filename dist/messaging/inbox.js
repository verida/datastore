"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _tweetnacl = require("tweetnacl");

var _didJwt = _interopRequireDefault(require("did-jwt"));

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

var EventEmitter = require('events');

var Inbox = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Inbox, _EventEmitter);

  var _super = _createSuper(Inbox);

  function Inbox(app) {
    var _this;

    _classCallCheck(this, Inbox);

    _this = _super.call(this);
    _this._app = app;
    _this._init = false; // TODO: Implement on new message event

    return _this;
  }

  _createClass(Inbox, [{
    key: "processAll",
    value: function () {
      var _processAll = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var items, manager, count;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.init();

              case 2:
                _context.next = 4;
                return this._publicInbox.getMany();

              case 4:
                items = _context.sent;

                if (!(items.length == 0)) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", 0);

              case 7:
                manager = this;
                count = 0;
                items.forEach(function (item) {
                  manager.processItem(item);
                  count++;
                });
                return _context.abrupt("return", count);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function processAll() {
        return _processAll.apply(this, arguments);
      }

      return processAll;
    }()
  }, {
    key: "processItem",
    value: function () {
      var _processItem = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(inboxItem) {
        var appUserConfig, keyring, publicKeyBytes, sharedKeyEnd, jwt, decoded, item, inboxEntry;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.init();

              case 2:
                _context2.next = 4;
                return this._app.user.getAppConfig();

              case 4:
                appUserConfig = _context2.sent;
                keyring = appUserConfig.keyring;
                publicKeyBytes = Buffer.from(inboxItem.key.slice(2), 'hex');
                sharedKeyEnd = _tweetnacl.box.before(publicKeyBytes, keyring.asymKey.privateBytes); // Decrypt the inbox/tem to obtain the JWT

                _context2.prev = 8;
                jwt = keyring.asymDecrypt(inboxItem.content, sharedKeyEnd);
                _context2.next = 17;
                break;

              case 12:
                _context2.prev = 12;
                _context2.t0 = _context2["catch"](8);
                console.error("Unable to decrypt inbox item:");
                console.error(_context2.t0);
                return _context2.abrupt("return");

              case 17:
                decoded = _didJwt["default"].decodeJWT(jwt);
                item = decoded.payload; // TODO: Verify the DID-JWT with a custom VID resolver

                inboxEntry = {
                  _id: inboxItem._id,
                  // Use the same _id to avoid duplicates
                  message: item.data.message,
                  type: item.data.type,
                  sentAt: item.insertedAt,
                  data: item.data.data,
                  sentBy: {
                    did: item.aud,
                    vid: item.vid,
                    app: item.veridaApp
                  },
                  insertedAt: new Date().toISOString(),
                  read: false
                }; // Save a new inbox entry into the user's private inbox

                _context2.prev = 20;
                _context2.next = 23;
                return this._privateInbox.save(inboxEntry);

              case 23:
                _context2.next = 29;
                break;

              case 25:
                _context2.prev = 25;
                _context2.t1 = _context2["catch"](20);
                console.error("Unable to save to private inbox");
                console.error(_context2.t1);

              case 29:
                _context2.prev = 29;
                _context2.next = 32;
                return this._publicInbox["delete"](inboxItem);

              case 32:
                _context2.next = 39;
                break;

              case 34:
                _context2.prev = 34;
                _context2.t2 = _context2["catch"](29);
                console.error("Unable to delete from public inbox");
                console.error(_context2.t2);
                throw _context2.t2;

              case 39:
                this.emit("newMessage", inboxEntry);

              case 40:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[8, 12], [20, 25], [29, 34]]);
      }));

      function processItem(_x) {
        return _processItem.apply(this, arguments);
      }

      return processItem;
    }()
  }, {
    key: "watch",
    value: function () {
      var _watch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var inbox, db;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.init();

              case 2:
                inbox = this;
                _context3.next = 5;
                return this._publicInbox.getDb();

              case 5:
                db = _context3.sent;
                _context3.next = 8;
                return db.getInstance();

              case 8:
                db = _context3.sent;
                db.changes({
                  since: 'now',
                  live: true
                }).on('change', function (info) {
                  if (info.deleted) {
                    // ignore deleted changes
                    return;
                  }

                  inbox.processAll();
                }).on('error', function (err) {
                  console.log("Error watching for inbox changes");
                  console.log(err);
                });

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function watch() {
        return _watch.apply(this, arguments);
      }

      return watch;
    }()
    /**
     * Initialise the inbox manager
     */

  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var isConnected;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this._init) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                this._init = true;
                _context4.next = 5;
                return this._app.isConnected();

              case 5:
                isConnected = _context4.sent;

                if (isConnected) {
                  _context4.next = 8;
                  break;
                }

                throw "Verida application isn't connected";

              case 8:
                _context4.next = 10;
                return this._app.openDatastore("inbox/item", {
                  permissions: {
                    read: "public",
                    write: "public"
                  }
                });

              case 10:
                this._publicInbox = _context4.sent;
                _context4.next = 13;
                return this._app.openDatastore("inbox/entry", {
                  permissions: {
                    read: "owner",
                    write: "owner"
                  }
                });

              case 13:
                this._privateInbox = _context4.sent;
                _context4.next = 16;
                return this.watch();

              case 16:
                _context4.next = 18;
                return this.processAll();

              case 18:
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
  }, {
    key: "getInbox",
    value: function () {
      var _getInbox = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.init();

              case 2:
                return _context5.abrupt("return", this._privateInbox);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getInbox() {
        return _getInbox.apply(this, arguments);
      }

      return getInbox;
    }()
  }]);

  return Inbox;
}(EventEmitter);

var _default = Inbox;
exports["default"] = _default;