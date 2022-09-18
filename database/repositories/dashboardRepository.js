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
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const producto_1 = __importDefault(require("../models/producto"));
const movimiento_1 = __importDefault(require("../models/movimiento"));
const stock_1 = __importDefault(require("../models/stock"));
const entities = {
    'user': user_1.default,
    'producto': producto_1.default,
    'movimiento': movimiento_1.default,
    'stock': stock_1.default,
};
class DashboardRepository {
    static findAndCountAll({ entityName, tipo }, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const Entity = entities[entityName];
            if (!Entity) {
                return null;
            }
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [];
            if (entityName === 'user') {
                criteriaAnd.push({
                    tenants: { $elemMatch: { tenant: currentTenant.id } },
                });
            }
            else {
                criteriaAnd.push({
                    tenant: mongoose_1.default.Types.ObjectId(currentTenant.id),
                });
                if (entityName === 'movimiento') {
                    tipo && (criteriaAnd.push({
                        tipo
                    }));
                }
            }
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            let count;
            if (entityName === 'stock' || entityName === 'movimiento') {
                count = yield Entity(options.database).aggregate([
                    {
                        $match: criteria,
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: '$cantidad' },
                        }
                    }
                ]);
                count = ((_a = count[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            }
            else {
                count = yield Entity(options.database).countDocuments(criteria);
            }
            return { count };
        });
    }
    static findByLastDate({ entityName = 'user', typeOfDate = 'day', limit = 12, tipo }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const Entity = entities[entityName];
            if (!Entity) {
                return null;
            }
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const fieldDate = entityName === 'entryExit' ? '$dateTime' : '$createdAt';
            const timezone = '-05:00';
            const yearQuery = {
                year: {
                    $year: { date: fieldDate, timezone }
                }
            };
            const monthQuery = {
                month: {
                    $month: { date: fieldDate, timezone }
                }
            };
            const dayQuery = {
                day: {
                    $dayOfMonth: { date: fieldDate, timezone }
                }
            };
            const query = {
                'day': Object.assign(Object.assign(Object.assign({}, yearQuery), monthQuery), dayQuery),
                'month': Object.assign(Object.assign({}, yearQuery), monthQuery),
                'year': yearQuery
            };
            if (!query[typeOfDate]) {
                return null;
            }
            let criteriaAnd = [];
            if (entityName === 'user') {
                criteriaAnd.push({
                    tenants: { $elemMatch: { tenant: mongoose_1.default.Types.ObjectId(currentTenant.id) } },
                });
            }
            else {
                criteriaAnd.push({
                    tenant: mongoose_1.default.Types.ObjectId(currentTenant.id),
                });
                if (entityName === 'movimiento') {
                    tipo && (criteriaAnd.push({
                        tipo
                    }));
                }
            }
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            let data = yield Entity(options.database).aggregate([
                {
                    $match: criteria
                },
                {
                    $group: {
                        _id: Object.assign({}, query[typeOfDate]),
                        date: {
                            $last: fieldDate,
                        },
                        // withdraws: {
                        //   $push: "$$ROOT"
                        // },
                        count: { $sum: (entityName === 'stock' || entityName === 'movimiento') ? '$cantidad' : 1 },
                    }
                },
                {
                    $sort: {
                        "_id.year": -1,
                        "_id.month": -1,
                        '_id.day': -1
                    }
                },
                {
                    $limit: Number(limit)
                }
            ]);
            return data;
        });
    }
}
exports.default = DashboardRepository;
//# sourceMappingURL=dashboardRepository.js.map