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
const Error404_1 = __importDefault(require("../../errors/Error404"));
const lodash_1 = __importDefault(require("lodash"));
const stock_1 = __importDefault(require("../models/stock"));
const productoRepository_1 = __importDefault(require("./productoRepository"));
const movimientoRepository_1 = __importDefault(require("./movimientoRepository"));
class StockRepository {
    static create(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            const [record] = yield stock_1.default(options.database).create([
                Object.assign(Object.assign({}, data), { tenant: currentTenant.id, createdBy: currentUser.id, updatedBy: currentUser.id })
            ], options);
            yield this._createAuditLog(auditLogRepository_1.default.CREATE, record.id, data, options);
            return this.findById(record.id, options);
        });
    }
    static update(id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(stock_1.default(options.database).findOne({ _id: id, tenant: currentTenant.id }), options);
            if (!record) {
                throw new Error404_1.default();
            }
            yield stock_1.default(options.database).updateOne({ _id: id }, Object.assign(Object.assign({}, data), { updatedBy: mongooseRepository_1.default.getCurrentUser(options).id }), options);
            yield this._createAuditLog(auditLogRepository_1.default.UPDATE, id, data, options);
            record = yield this.findById(id, options);
            return record;
        });
    }
    static destroy(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(stock_1.default(options.database).findOne({ _id: id, tenant: currentTenant.id }), options);
            if (!record) {
                throw new Error404_1.default();
            }
            yield stock_1.default(options.database).deleteOne({ _id: id }, options);
            yield this._createAuditLog(auditLogRepository_1.default.DELETE, id, record, options);
        });
    }
    static filterIdInTenant(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return lodash_1.default.get(yield this.filterIdsInTenant([id], options), '[0]', null);
        });
    }
    static filterIdsInTenant(ids, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || !ids.length) {
                return [];
            }
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            const records = yield stock_1.default(options.database)
                .find({
                _id: { $in: ids },
                tenant: currentTenant.id,
            })
                .select(['_id']);
            return records.map((record) => record._id);
        });
    }
    static count(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            return mongooseRepository_1.default.wrapWithSessionIfExists(stock_1.default(options.database).countDocuments(Object.assign(Object.assign({}, filter), { tenant: currentTenant.id })), options);
        });
    }
    static findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(stock_1.default(options.database)
                .findOne({ _id: id, tenant: currentTenant.id })
                .populate('producto'), options);
            if (!record) {
                throw new Error404_1.default();
            }
            return this._mapRelationshipsAndFillDownloadUrl(record);
        });
    }
    static findByProductId(productId, options, fields = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(stock_1.default(options.database)
                .findOne({ producto: mongooseQueryUtils_1.default.uuid(productId), tenant: currentTenant.id }, fields)
                .populate('producto'), options);
            if (!record) {
                return null;
            }
            return this._mapRelationshipsAndFillDownloadUrl(record);
        });
    }
    static findAndCountAll({ filter, limit = 0, offset = 0, orderBy = '' }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [];
            criteriaAnd.push({
                tenant: currentTenant.id,
            });
            if (filter) {
                if (filter.id) {
                    criteriaAnd.push({
                        ['_id']: mongooseQueryUtils_1.default.uuid(filter.id),
                    });
                }
                if (filter.producto) {
                    criteriaAnd.push({
                        producto: mongooseQueryUtils_1.default.uuid(filter.producto),
                    });
                }
                if (filter.cantidadRange) {
                    const [start, end] = filter.cantidadRange;
                    if (start !== undefined && start !== null && start !== '') {
                        criteriaAnd.push({
                            cantidad: {
                                $gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        criteriaAnd.push({
                            cantidad: {
                                $lte: end,
                            },
                        });
                    }
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
            const sort = mongooseQueryUtils_1.default.sort(orderBy || 'createdAt_DESC');
            const skip = Number(offset || 0) || undefined;
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            let rows = yield stock_1.default(options.database)
                .find(criteria)
                .skip(skip)
                .limit(limitEscaped)
                .sort(sort)
                .populate('producto');
            const count = yield stock_1.default(options.database).countDocuments(criteria);
            rows = yield Promise.all(rows.map(this._mapRelationshipsAndFillDownloadUrl));
            return { rows, count };
        });
    }
    static findAllAutocomplete(search, limit, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [{
                    tenant: currentTenant.id,
                }];
            if (search) {
                criteriaAnd.push({
                    $or: [
                        {
                            _id: mongooseQueryUtils_1.default.uuid(search),
                        },
                    ],
                });
            }
            const sort = mongooseQueryUtils_1.default.sort('id_ASC');
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = { $and: criteriaAnd };
            const records = yield stock_1.default(options.database)
                .find(criteria)
                .limit(limitEscaped)
                .sort(sort);
            return records.map((record) => ({
                id: record.id,
                label: record.id,
            }));
        });
    }
    static getStockProduct({ productId }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cantidad } = yield this.findByProductId(productId, options);
            return cantidad;
        });
    }
    static updateStockProduct({ productId }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundStock = yield this.findByProductId(productId, options);
            const foundProduct = yield productoRepository_1.default.findById(productId, options);
            const foundMovimientos = yield movimientoRepository_1.default.findAllByProductId(productId, options);
            let cantidad = foundProduct.saldoInicial;
            foundMovimientos.forEach((movimiento) => {
                const { tipo } = movimiento;
                if (tipo === 'Entrada') {
                    cantidad += movimiento.cantidad;
                }
                else {
                    cantidad -= movimiento.cantidad;
                }
            });
            if (foundStock) {
                yield this.update(foundStock.id, {
                    cantidad,
                }, options);
            }
            else {
                yield this.create({
                    producto: productId,
                    cantidad
                }, options);
            }
        });
    }
    static _createAuditLog(action, id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auditLogRepository_1.default.log({
                entityName: stock_1.default(options.database).modelName,
                entityId: id,
                action,
                values: data,
            }, options);
        });
    }
    static _mapRelationshipsAndFillDownloadUrl(record) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!record) {
                return null;
            }
            const output = record.toObject
                ? record.toObject()
                : record;
            return output;
        });
    }
}
exports.default = StockRepository;
//# sourceMappingURL=stockRepository.js.map