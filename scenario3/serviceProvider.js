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
var fs_1 = __importDefault(require("fs"));
var util_1 = require("./util");
var WebSocketAwait = require("ws-await");
var web3_1 = __importDefault(require("web3"));
// ----------------------------------------------------------------------------
//
var ServiceProvider = /** @class */ (function () {
    function ServiceProvider(wage, sk, pk, addr, port, portOther, portBlockchain, portVerifier, ipOther, ipBlockchain, ipVerifier) {
        var _this = this;
        this.loop = true;
        this.privateKey = sk.toLowerCase();
        this.publicKey = pk.toLowerCase();
        this.address = addr;
        this.wage = wage;
        this.port = port;
        this.portOther = portOther;
        this.web3 = new web3_1["default"](new web3_1["default"].providers.WebsocketProvider("ws://" + ipBlockchain + ":" + portBlockchain));
        this.util = new util_1.Util();
        this.wsSp = new WebSocketAwait.Server({ port: port });
        console.log("Creating server on port: " + port);
        this.wsSp.on('connection', function (ws) {
            console.log("SP: someone connected to me");
            ws.on('messageAwait', function (msg, id) { return __awaiter(_this, void 0, void 0, function () {
                var contractAddress, name, compiled_name, abi, _a, wsV;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.input = msg.input;
                            return [4 /*yield*/, ws.resAwait({
                                    res: true
                                }, id)];
                        case 1:
                            _b.sent();
                            contractAddress = msg.addrC;
                            name = 'FairDelegation3';
                            compiled_name = name + '_sol_' + name;
                            abi = JSON.parse(fs_1["default"].readFileSync(compiled_name + '.abi').toString());
                            this.contract = new this.web3.eth.Contract(abi, contractAddress);
                            return [4 /*yield*/, this.subscribe()];
                        case 2:
                            _b.sent();
                            this.work = 'Worked with:' + this.input;
                            _a = this;
                            return [4 /*yield*/, this.util.encrypt(this.publicKey, this.work)];
                        case 3:
                            _a.workEncrypted = _b.sent();
                            wsV = new WebSocketAwait("ws://" + ipVerifier + ":" + portVerifier);
                            console.log("SP: opening connection with verifier");
                            wsV.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                                var waiting, stamp, ws2;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, wsV.sendAwait({
                                                work: "Worked with: " + this.input
                                            })];
                                        case 1:
                                            waiting = _a.sent();
                                            stamp = [
                                                waiting.hash, waiting.enc, waiting.sig
                                            ];
                                            this.stamp = stamp;
                                            console.log("SP: about to send data to other");
                                            ws2 = new WebSocketAwait("ws://" + ipOther + ":" + this.portOther);
                                            ws2.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, ws2.sendAwait({
                                                                work: this.workEncrypted,
                                                                stamp: this.stamp,
                                                                addr: this.address
                                                            })];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    }
    ServiceProvider.prototype.subscribe = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contract.events.CustomerTrigger({}, function (error, event) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // const key = event['returnValues']['k'].substr(2) +
                                    //     event['returnValues']['k2'].substr(2);
                                    // const wage = event['returnValues']['w'];
                                    return [4 /*yield*/, this.verifyData()];
                                    case 1:
                                        // const key = event['returnValues']['k'].substr(2) +
                                        //     event['returnValues']['k2'].substr(2);
                                        // const wage = event['returnValues']['w'];
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceProvider.prototype.sendAndClaimReward = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.contract.methods.serviceProvider('0x' + this.privateKey).estimateGas()];
                    case 1:
                        _a.methodCost = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.contract.methods.pair('0x' + this.privateKey, '0x' + this.privateKey, '0x' + this.privateKey).estimateGas()];
                    case 2:
                        _b.pairCost = _c.sent();
                        console.log("S3 - pairCost: " + this.pairCost);
                        console.log("S3 - spCost: " + (this.methodCost - this.pairCost));
                        return [4 /*yield*/, this.contract.methods.serviceProvider('0x' + this.privateKey).send({
                                from: this.address, gas: 1000000, gasPrice: '0'
                            }).on('error', function (error) {
                            })];
                    case 3:
                        _c.sent();
                        this.loop = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceProvider.prototype.verifyData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // const key1 = await this.util.inspectVariable(this.contract, 'pkSp');
                    // const key2 = await this.util.inspectVariable(this.contract, 'pkSp2');
                    // const wage = await this.util.inspectVariable(this.contract, 'wage');
                    // const key = key1.substr(2) + key2.substr(2);
                    return [4 /*yield*/, this.sendAndClaimReward()];
                    case 1:
                        // const key1 = await this.util.inspectVariable(this.contract, 'pkSp');
                        // const key2 = await this.util.inspectVariable(this.contract, 'pkSp2');
                        // const wage = await this.util.inspectVariable(this.contract, 'wage');
                        // const key = key1.substr(2) + key2.substr(2);
                        _a.sent();
                        console.log("I got my reward");
                        return [2 /*return*/];
                }
            });
        });
    };
    return ServiceProvider;
}());
// constructor(wage: number, sk: string, pk: string, addr:string, port: number, portOther: number, portBlockchain: number, portVerifier: number, ipOther: string, ipBlockchain: string, ipVerifier: string) {
new ServiceProvider(+process.argv[2], process.argv[3], process.argv[4], process.argv[5], +process.argv[6], +process.argv[7], +process.argv[8], +process.argv[9], process.argv[10], process.argv[11], process.argv[12]);
