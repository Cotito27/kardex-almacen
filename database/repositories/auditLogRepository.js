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
const auditLog_1 = __importDefault(require("../models/auditLog"));
const mongooseRepository_1 = __importDefault(require("./mongooseRepository"));
const mongooseQueryUtils_1 = __importDefault(require("../utils/mongooseQueryUtils"));
class AuditLogRepository {
    static get CREATE() {
        return 'create';
    }
    static get UPDATE() {
        return 'update';
    }
    static get DELETE() {
        return 'delete';
    }
    /**
     * Saves an Audit Log to the database.
     *
     * @param  {Object} log - The log being saved.
     * @param  {string} log.entityName - The name of the entity. Ex.: customer
     * @param  {string} log.entityId - The id of the entity.
     * @param  {string} log.action - The action [create, update or delete].
     * @param  {Object} log.values - The JSON log value with data of the entity.
     *
     * @param  {Object} options
     * @param  {Object} options.session - The current database session.
     * @param  {Object} options.currentUser - The current logged user.
     * @param  {Object} options.currentTenant - The current currentTenant.
     */
    static log({ entityName, entityId, action, values }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const [log] = yield auditLog_1.default(options.database).create([
                {
                    entityName,
                    entityId,
                    tenantId: currentTenant.id,
                    action,
                    values,
                    timestamp: new Date(),
                    createdById: options && options.currentUser
                        ? options.currentUser.id
                        : null,
                    createdByEmail: options && options.currentUser
                        ? options.currentUser.email
                        : null,
                },
            ], options);
            return log;
        });
    }
    static findAndCountAll({ filter, limit = 0, offset = 0, orderBy = '' }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [];
            criteriaAnd.push({
                tenantId: tenant.id,
            });
            if (filter) {
                if (filter.timestampRange) {
                    const [start, end] = filter.timestampRange;
                    if (start !== undefined &&
                        start !== null &&
                        start !== '') {
                        criteriaAnd.push({
                            ['timestamp']: {
                                $gte: start,
                            },
                        });
                    }
                    if (end !== undefined &&
                        end !== null &&
                        end !== '') {
                        criteriaAnd.push({
                            ['timestamp']: {
                                $lte: end,
                            },
                        });
                    }
                }
                if (filter.action) {
                    criteriaAnd.push({
                        ['action']: filter.action,
                    });
                }
                if (filter.entityId) {
                    criteriaAnd.push({
                        ['entityId']: filter.entityId,
                    });
                }
                if (filter.createdByEmail) {
                    criteriaAnd.push({
                        ['createdByEmail']: {
                            $regex: mongooseQueryUtils_1.default.escapeRegExp(filter.createdByEmail),
                            $options: 'i',
                        },
                    });
                }
                if (filter.entityNames && filter.entityNames.length) {
                    criteriaAnd.push({
                        ['entityName']: {
                            $in: filter.entityNames,
                        },
                    });
                }
            }
            const sort = mongooseQueryUtils_1.default.sort(orderBy || 'createdAt_DESC');
            const skip = Number(offset || 0) || undefined;
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            const rows = yield auditLog_1.default(options.database)
                .find(criteria)
                .skip(skip)
                .limit(limitEscaped)
                .sort(sort);
            const count = yield auditLog_1.default(options.database).countDocuments(criteria);
            return { rows, count };
        });
    }
}
exports.default = AuditLogRepository;
//# sourceMappingURL=auditLogRepository.js.map