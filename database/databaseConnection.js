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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseInit = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const models_1 = __importDefault(require("./models"));
function databaseInit() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * If the connection is already established,
         * returns the mongoose instance.
         */
        if (mongoose_1.default.connection.readyState) {
            return mongoose_1.default;
        }
        /**
         * Connects to MongoDB
         */
        return mongoose_1.default
            .connect(config_1.getConfig().DATABASE_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
            .then(() => {
            models_1.default(mongoose_1.default);
        })
            .then(() => mongoose_1.default)
            .catch((error) => {
            console.error(error);
            throw error;
        });
    });
}
exports.databaseInit = databaseInit;
//# sourceMappingURL=databaseConnection.js.map