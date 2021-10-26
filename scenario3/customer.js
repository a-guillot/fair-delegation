"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Customer = void 0;
var Fs = __importStar(require("fs"));
var util_1 = require("./util");
var WebSocketAwait = require("ws-await");
var web3_1 = __importDefault(require("web3"));
// ----------------------------------------------------------------------------
var Customer = /** @class */ (function () {
    function Customer(wage, sk, pk, addr, input, port, portOther, portBlockchain, pkSp, ipOther, ipBlockchain) {
        this.loop = true;
        this.privateKey = sk.toLowerCase();
        this.publicKey = pk.toLowerCase();
        this.address = addr;
        this.wage = wage;
        this.ipOther = ipOther;
        this.ipBlockchain = ipBlockchain;
        this.port = port;
        this.portOther = portOther;
        this.web3 = new web3_1["default"](new web3_1["default"].providers.WebsocketProvider("ws://" + this.ipBlockchain + ":" + [portBlockchain]));
        this.util = new util_1.Util();
        this.input = input;
        this.pkSp = pkSp;
        this.wsC = new WebSocketAwait.Server({ port: port });
        console.log("Creating server on port: " + port);
    }
    Customer.prototype.sendInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wsSp;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deployContract()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.subscribe()];
                    case 2:
                        _a.sent();
                        this.wsC.on('connection', function (ws) {
                            console.log("C: someone connected to me");
                            ws.on('messageAwait', function (msg, id) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log("C: I received a message");
                                            this.workEncrypted = msg.work;
                                            this.stamp = msg.stamp;
                                            this.addressOther = msg.addr;
                                            return [4 /*yield*/, ws.resAwait({
                                                    res: true
                                                }, id)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, this.verifyWork()];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        wsSp = new WebSocketAwait("ws://" + this.ipOther + ":" + this.portOther);
                        wsSp.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, wsSp.sendAwait({
                                            input: this.input, addrC: this.contract.options.address
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        _a.label = 3;
                    case 3:
                        if (!this.loop) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.util.delay(1000)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Customer.prototype.deployContract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, compiled_name, abi, contract, contractCost;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = 'FairDelegation3';
                        compiled_name = name + '_sol_' + name;
                        abi = JSON.parse(Fs.readFileSync(compiled_name + '.abi').toString());
                        contract = new this.web3.eth.Contract(abi, this.address, {
                            from: this.address,
                            data: Fs.readFileSync(compiled_name + '.bin').toString()
                        });
                        this.contract = contract;
                        return [4 /*yield*/, contract.deploy({
                                data: contract.options.data,
                                arguments: []
                            }).estimateGas()];
                    case 1:
                        contractCost = _a.sent();
                        console.log("S3 - deploymentCost: " + contractCost);
                        return [4 /*yield*/, contract.deploy({
                                data: contract.options.data,
                                arguments: []
                            }).send({
                                from: contract.options.from,
                                gas: 4712388, gasPrice: '0',
                                value: this.web3.utils.toWei(this.wage.toString(), 'wei')
                            }).then(function (sentContract) {
                                contract.options.address = sentContract.options.address;
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Customer.prototype.verifyWork = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // const [workHash, enc, sig]: [string, string, string] = [
                //     this.stamp[0], this.stamp[1], this.stamp[2]
                // ]
                // const decHash = await this.util.decrypt(
                //     this.privateKey, enc
                // );
                // No need to contact the SP in s2 or s3 since they subbed to the contract
                // const wsSp = new WebSocketAwait(`ws://${this.ipOther}:${this.portOther}`);
                // wsSp.on('open', async () => {
                //     await wsSp.sendAwait({
                //         input: undefined, addr: this.contract.options.address
                //     });
                // });
                this.sendKeyAndWage();
                return [2 /*return*/];
            });
        });
    };
    Customer.prototype.subscribe = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contract.events.ServiceProviderTrigger({}, function (error, event) { return __awaiter(_this, void 0, void 0, function () {
                            var key, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        key = event['returnValues']['k'];
                                        _a = this;
                                        return [4 /*yield*/, this.util.decrypt(key, this.workEncrypted)];
                                    case 1:
                                        _a.work = _b.sent();
                                        console.log("C: I decrypted my reward!");
                                        this.loop = false;
                                        return [2 /*return*/, true];
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
    Customer.prototype.sendKeyAndWage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var k, first, last, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        k = this.pkSp;
                        first = k.substr(0, k.length / 2);
                        last = k.substr(k.length / 2);
                        _a = this;
                        return [4 /*yield*/, this.contract.methods.customer(this.addressOther, '0x' + first, '0x' + last).estimateGas()];
                    case 1:
                        _a.methodCost = _b.sent();
                        console.log("C.methodCost: " + this.methodCost);
                        return [4 /*yield*/, this.contract.methods.customer(this.addressOther, '0x' + first, '0x' + last).send({ from: this.address, value: this.web3.utils.toWei(this.wage.toString(), 'wei') }).on('error', console.error)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Customer;
}());
exports.Customer = Customer;
// constructor(wage: number, sk: string, pk: string, addr:string, input: string, port: number, portOther: number, portBlockchain: number, pkSp: string, ipOther: string, ipBlockchain: string) {
var c = new Customer(+process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], +process.argv[7], +process.argv[8], +process.argv[9], process.argv[10], process.argv[11], process.argv[12]);
c.sendInfo();
