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
const mongooseRepository_1 = __importDefault(require("./mongooseRepository"));
const settings_1 = __importDefault(require("../models/settings"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const fileRepository_1 = __importDefault(require("./fileRepository"));
class SettingsRepository {
    static find(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            return this._fillFileDownloadUrls(yield mongooseRepository_1.default.wrapWithSessionIfExists(settings_1.default(options.database).findOne({
                tenant: currentTenant.id,
            }), options));
        });
    }
    static findOrCreateDefault(defaults, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const first = yield mongooseRepository_1.default.wrapWithSessionIfExists(settings_1.default(options.database).findOne({
                tenant: currentTenant.id,
            }), options);
            if (first) {
                return this._fillFileDownloadUrls(first);
            }
            const [settings] = yield settings_1.default(options.database).create([
                Object.assign(Object.assign({}, defaults), { tenant: currentTenant.id, createdBy: mongooseRepository_1.default.getCurrentUser(options)
                        ? mongooseRepository_1.default.getCurrentUser(options).id
                        : null })
            ], options);
            return this._fillFileDownloadUrls(settings);
        });
    }
    static save(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const record = yield mongooseRepository_1.default.wrapWithSessionIfExists(settings_1.default(options.database).findOne({
                tenant: currentTenant.id,
            }), options);
            yield settings_1.default(options.database).updateOne({ _id: record.id }, Object.assign(Object.assign({}, data), { tenant: currentTenant.id }), options);
            yield auditLogRepository_1.default.log({
                entityName: 'settings',
                entityId: record.id,
                action: auditLogRepository_1.default.UPDATE,
                values: data,
            }, options);
            return this._fillFileDownloadUrls(yield mongooseRepository_1.default.wrapWithSessionIfExists(settings_1.default(options.database).findById(record.id), options));
        });
    }
    static _fillFileDownloadUrls(record) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!record) {
                return null;
            }
            const output = record.toObject
                ? record.toObject()
                : record;
            output.logos = yield fileRepository_1.default.fillDownloadUrl(output.logos);
            output.backgroundImages = yield fileRepository_1.default.fillDownloadUrl(output.backgroundImages);
            return output;
        });
    }
}
exports.default = SettingsRepository;
//# sourceMappingURL=settingsRepository.js.map