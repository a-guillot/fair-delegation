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
var web3_1 = __importDefault(require("web3"));
var web3 = new web3_1["default"](new web3_1["default"].providers.WebsocketProvider('ws://172.16.238.45:8545'));
var FairSwap = /** @class */ (function () {
    function FairSwap() {
    }
    FairSwap.prototype.generateContract = function () {
        var compiled_name = 'fairswap_sol_fileSale';
        var abi = JSON.parse(fs_1["default"].readFileSync(compiled_name + '.abi').toString());
        this.contract = new web3.eth.Contract(abi, '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', {
            from: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
            data: fs_1["default"].readFileSync(compiled_name + '.bin').toString()
        });
    };
    FairSwap.prototype.pushContract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractCost, cost_sp, cost_c, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.contract.deploy({
                            data: '',
                            arguments: []
                        }).estimateGas()];
                    case 1:
                        contractCost = _b.sent();
                        return [4 /*yield*/, this.contract.methods.revealKey('0x').estimateGas()];
                    case 2:
                        cost_sp = _b.sent();
                        return [4 /*yield*/, this.contract.methods.accept().estimateGas()];
                    case 3:
                        cost_c = _b.sent();
                        _a = cost_c;
                        return [4 /*yield*/, this.contract.methods.noComplain().estimateGas()];
                    case 4:
                        cost_c = _a + _b.sent();
                        console.log("Estimated cost for the deployment:\n" + contractCost);
                        console.log("Estimated cost for the customer:\n" + cost_c);
                        console.log("Estimated cost for the service provider:\n" + cost_sp);
                        return [2 /*return*/];
                }
            });
        });
    };
    FairSwap.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.generateContract();
                        return [4 /*yield*/, this.pushContract()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FairSwap;
}());
var fairSwap = new FairSwap();
fairSwap.main();