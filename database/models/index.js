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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollections = void 0;
const models = [
    require('./tenant').default,
    require('./auditLog').default,
    require('./settings').default,
    require('./user').default,
    require('./producto').default,
    require('./movimiento').default,
    require('./stock').default,
];
function init(database) {
    for (let model of models) {
        model(database);
    }
    return database;
}
exports.default = init;
function createCollections(database) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let model of models) {
            yield model(database).createCollection();
        }
        return database;
    });
}
exports.createCollections = createCollections;
//# sourceMappingURL=index.js.map