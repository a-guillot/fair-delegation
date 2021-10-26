"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var eth_crypto_1 = __importDefault(require("eth-crypto"));
var WebSocketAwait = require('ws-await');
var wss = new WebSocketAwait.Server({ port: 8080 });
var Verifier = /** @class */ (function () {
    function Verifier(pkSp, pkC, skC) {
        this.pkSp = pkSp;
        this.pkC = pkC;
        this.skC = skC;
    }
    Verifier.prototype.encrypt = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return resolve(eth_crypto_1["default"].encryptWithPublicKey(key, JSON.stringify(data))
                        .then(function (encrypted) {
                        return eth_crypto_1["default"].cipher.stringify(encrypted);
                    })); })];
            });
        });
    };
    Verifier.prototype.decrypt = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptedObject;
            return __generator(this, function (_a) {
                encryptedObject = eth_crypto_1["default"].cipher.parse(data);
                return [2 /*return*/, new Promise(function (resolve, reject) { return resolve(eth_crypto_1["default"].decryptWithPrivateKey(key, encryptedObject)
                        .then(function (decrypted) {
                        return JSON.parse(decrypted);
                    })["catch"](function (error) {
                    })); })];
            });
        });
    };
    Verifier.prototype.hash = function (data) {
        // type's here to match solidity's format
        return eth_crypto_1["default"].hash.keccak256([
            { type: 'string', value: data }
        ]);
    };
    Verifier.prototype.sign = function (k, data) {
        return eth_crypto_1["default"].sign(k, data);
    };
    Verifier.prototype.createStamp = function (work) {
        return __awaiter(this, void 0, void 0, function () {
            var workEncrypted, workHash, enc, sig, stamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.encrypt(this.pkSp, work)];
                    case 1:
                        workEncrypted = _a.sent();
                        workHash = this.hash(workEncrypted);
                        return [4 /*yield*/, this.encrypt(this.pkC, workHash)];
                    case 2:
                        enc = _a.sent();
                        sig = this.sign(this.skC, workHash);
                        stamp = [
                            workHash, enc, sig
                        ];
                        // console.log(stamp);
                        return [2 /*return*/, {
                                hash: workHash,
                                enc: enc,
                                sig: sig
                            }];
                }
            });
        });
    };
    return Verifier;
}());
var verifier = new Verifier(process.argv[2], process.argv[3], process.argv[4]);
wss.on('connection', function (ws) {
    ws.on('messageAwait', function (msg, id) { return __awaiter(void 0, void 0, void 0, function () {
        var d;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, verifier.createStamp(msg.work)];
                case 1:
                    d = _a.sent();
                    return [4 /*yield*/, ws.resAwait({
                            res: true,
                            hash: d.hash,
                            enc: d.enc,
                            sig: d.sig
                        }, id)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
