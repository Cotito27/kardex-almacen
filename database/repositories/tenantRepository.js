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
const mongooseQueryUtils_1 = __importDefault(require("../utils/mongooseQueryUtils"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const user_1 = __importDefault(require("../models/user"));
const tenant_1 = __importDefault(require("../models/tenant"));
const settings_1 = __importDefault(require("../models/settings"));
const Error404_1 = __importDefault(require("../../errors/Error404"));
const producto_1 = __importDefault(require("../models/producto"));
const movimiento_1 = __importDefault(require("../models/movimiento"));
const stock_1 = __importDefault(require("../models/stock"));
const Error400_1 = __importDefault(require("../../errors/Error400"));
const uuid_1 = require("uuid");
const userTenantUtils_1 = require("../utils/userTenantUtils");
const settingsRepository_1 = __importDefault(require("./settingsRepository"));
const forbiddenTenantUrls = ['www'];
class TenantRepository {
    static create(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            // URL is required,
            // in case of multi tenant without subdomain
            // set a random uuid
            data.url = data.url || uuid_1.v4();
            const existsUrl = Boolean(yield this.count({ url: data.url }, options));
            if (forbiddenTenantUrls.includes(data.url) ||
                existsUrl) {
                throw new Error400_1.default(options.language, 'tenant.url.exists');
            }
            const [record] = yield tenant_1.default(options.database).create([
                Object.assign(Object.assign({}, data), { createdBy: currentUser.id, updatedBy: currentUser.id })
            ], options);
            yield this._createAuditLog(auditLogRepository_1.default.CREATE, record.id, data, Object.assign(Object.assign({}, options), { currentTenant: record }));
            return this.findById(record.id, Object.assign({}, options));
        });
    }
    static update(id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            if (!userTenantUtils_1.isUserInTenant(currentUser, id)) {
                throw new Error404_1.default();
            }
            const record = yield this.findById(id, options);
            // When not multi-with-subdomain, the
            // from passes the URL as undefined.
            // This way it's ensured that the URL will
            // remain the old one
            data.url = data.url || record.url;
            const existsUrl = Boolean(yield this.count({ url: data.url, _id: { $ne: id } }, options));
            if (forbiddenTenantUrls.includes(data.url) ||
                existsUrl) {
                throw new Error400_1.default(options.language, 'tenant.url.exists');
            }
            // Does not allow user to update the plan
            // only by updating the tenant
            delete data.plan;
            delete data.planStripeCustomerId;
            delete data.planUserId;
            delete data.planStatus;
            yield tenant_1.default(options.database).updateOne({ _id: id }, Object.assign(Object.assign({}, data), { updatedBy: mongooseRepository_1.default.getCurrentUser(options).id }), options);
            yield this._createAuditLog(auditLogRepository_1.default.UPDATE, id, data, options);
            return yield this.findById(id, options);
        });
    }
    /**
     * Updates the Tenant Plan user.
     */
    static updatePlanUser(id, planStripeCustomerId, planUserId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            const data = {
                planStripeCustomerId,
                planUserId,
                updatedBy: currentUser.id,
            };
            yield tenant_1.default(options.database).updateOne({ _id: id }, data, options);
            yield this._createAuditLog(auditLogRepository_1.default.UPDATE, id, data, options);
            return yield this.findById(id, options);
        });
    }
    static updatePlanStatus(planStripeCustomerId, plan, planStatus, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                plan,
                planStatus,
                updatedBy: null,
            };
            const record = yield mongooseRepository_1.default.wrapWithSessionIfExists(tenant_1.default(options.database).findOne({
                planStripeCustomerId,
            }), options);
            yield tenant_1.default(options.database).updateOne({ _id: record.id }, data, options);
            yield this._createAuditLog(auditLogRepository_1.default.UPDATE, record.id, data, options);
            return yield this.findById(record.id, options);
        });
    }
    static destroy(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            if (!userTenantUtils_1.isUserInTenant(currentUser, id)) {
                throw new Error404_1.default();
            }
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(tenant_1.default(options.database).findById(id), options);
            yield tenant_1.default(options.database).deleteOne({ _id: id }, options);
            yield this._createAuditLog(auditLogRepository_1.default.DELETE, id, record, options);
            yield producto_1.default(options.database).deleteMany({ tenant: id }, options);
            yield movimiento_1.default(options.database).deleteMany({ tenant: id }, options);
            yield stock_1.default(options.database).deleteMany({ tenant: id }, options);
            yield settings_1.default(options.database).deleteMany({ tenant: id }, options);
            yield user_1.default(options.database).updateMany({}, {
                $pull: {
                    tenants: { tenant: id },
                },
            }, options);
        });
    }
    static count(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongooseRepository_1.default.wrapWithSessionIfExists(tenant_1.default(options.database).countDocuments(filter), options);
        });
    }
    static findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield mongooseRepository_1.default.wrapWithSessionIfExists(tenant_1.default(options.database).findById(id), options);
            if (!record) {
                return record;
            }
            const output = record.toObject
                ? record.toObject()
                : record;
            output.settings = yield settingsRepository_1.default.find(Object.assign({ currentTenant: record }, options));
            return output;
        });
    }
    static findByUrl(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield mongooseRepository_1.default.wrapWithSessionIfExists(tenant_1.default(options.database).findOne({ url }), options);
            if (!record) {
                return null;
            }
            const output = record.toObject
                ? record.toObject()
                : record;
            output.settings = yield settingsRepository_1.default.find(Object.assign({ currentTenant: record }, options));
            return output;
        });
    }
    static findDefault(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return tenant_1.default(options.database).findOne();
        });
    }
    static findAndCountAll({ filter, limit = 0, offset = 0, orderBy = '' }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            let criteriaAnd = [];
            criteriaAnd.push({
                _id: {
                    $in: currentUser.tenants
                        .filter((userTenant) => ['invited', 'active'].includes(userTenant.status))
                        .map((userTenant) => userTenant.tenant.id),
                },
            });
            if (filter) {
                if (filter.id) {
                    criteriaAnd.push({
                        ['_id']: mongooseQueryUtils_1.default.uuid(filter.id),
                    });
                }
                if (filter.name) {
                    criteriaAnd.push({
                        name: {
                            $regex: mongooseQueryUtils_1.default.escapeRegExp(filter.name),
                            $options: 'i',
                        },
                    });
                }
                if (filter.createdAtRange) {
                    const [start, end] = filter.createdAtRange;
                    if (start !== undefined &&
                        start !== null &&
                        start !== '') {
                        criteriaAnd.push({
                            ['createdAt']: {
                                $gte: start,
                            },
                        });
                    }
                    if (end !== undefined &&
                        end !== null &&
                        end !== '') {
                        criteriaAnd.push({
                            ['createdAt']: {
                                $lte: end,
                            },
                        });
                    }
                }
            }
            const sort = mongooseQueryUtils_1.default.sort(orderBy || 'name_ASC');
            const skip = Number(offset || 0) || undefined;
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            const rows = yield tenant_1.default(options.database)
                .find(criteria)
                .skip(skip)
                .limit(limitEscaped)
                .sort(sort);
            const count = yield tenant_1.default(options.database).countDocuments(criteria);
            return { rows, count };
        });
    }
    static findAllAutocomplete(search, limit, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            let criteriaAnd = [
                {
                    _id: {
                        $in: currentUser.tenants.map((userTenant) => userTenant.tenant.id),
                    },
                },
            ];
            if (search) {
                criteriaAnd.push({
                    $or: [
                        {
                            _id: mongooseQueryUtils_1.default.uuid(search),
                        },
                        {
                            name: {
                                $regex: mongooseQueryUtils_1.default.escapeRegExp(search),
                                $options: 'i',
                            },
                        },
                    ],
                });
            }
            const sort = mongooseQueryUtils_1.default.sort('name_ASC');
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = { $and: criteriaAnd };
            const records = yield tenant_1.default(options.database)
                .find(criteria)
                .limit(limitEscaped)
                .sort(sort);
            return records.map((record) => ({
                id: record.id,
                label: record['name'],
            }));
        });
    }
    static _createAuditLog(action, id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auditLogRepository_1.default.log({
                entityName: tenant_1.default(options.database).modelName,
                entityId: id,
                action,
                values: data,
            }, options);
        });
    }
    static _isUserInTenant(user, tenantId) {
        if (!user || !user.tenants) {
            return false;
        }
        return user.tenants.some((tenantUser) => String(tenantUser.tenant.id) === String(tenantId));
    }
}
exports.default = TenantRepository;
//# sourceMappingURL=tenantRepository.js.map