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
const user_1 = __importDefault(require("../models/user"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const mongooseQueryUtils_1 = __importDefault(require("../utils/mongooseQueryUtils"));
const fileRepository_1 = __importDefault(require("./fileRepository"));
const crypto_1 = __importDefault(require("crypto"));
const Error404_1 = __importDefault(require("../../errors/Error404"));
const settingsRepository_1 = __importDefault(require("./settingsRepository"));
const userTenantUtils_1 = require("../utils/userTenantUtils");
const lodash_1 = __importDefault(require("lodash"));
class UserRepository {
    static create(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            data = this._preSave(data);
            const [user] = yield user_1.default(options.database).create([
                {
                    email: data.email,
                    firstName: data.firstName || null,
                    lastName: data.lastName || null,
                    fullName: data.fullName || null,
                    phoneNumber: data.phoneNumber || null,
                    importHash: data.importHash || null,
                    avatars: data.avatars || [],
                    createdBy: currentUser.id,
                    updatedBy: currentUser.id,
                },
            ], options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: auditLogRepository_1.default.CREATE,
                values: user,
            }, options);
            return this.findById(user.id, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }));
        });
    }
    static createFromAuth(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            data = this._preSave(data);
            let [user] = yield user_1.default(options.database).create([
                {
                    email: data.email,
                    password: data.password,
                    firstName: data.firstName,
                    fullName: data.fullName,
                }
            ], options);
            delete user.password;
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: auditLogRepository_1.default.CREATE,
                values: user,
            }, options);
            return this.findById(user.id, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }));
        });
    }
    static updatePassword(id, password, invalidateOldTokens, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            const data = {
                password,
                updatedBy: currentUser.id,
            };
            if (invalidateOldTokens) {
                data.jwtTokenInvalidBefore = new Date();
            }
            yield user_1.default(options.database).updateOne({ _id: id }, data, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: {
                    id,
                    password: 'secret',
                },
            }, options);
            return this.findById(id, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }));
        });
    }
    static updateProfile(id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            data = this._preSave(data);
            yield user_1.default(options.database).updateOne({ _id: id }, {
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                fullName: data.fullName || null,
                phoneNumber: data.phoneNumber || null,
                updatedBy: currentUser.id,
                avatars: data.avatars || [],
            }, options);
            const user = yield this.findById(id, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: user,
            }, options);
            return user;
        });
    }
    static generateEmailVerificationToken(email, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            const { id } = yield this.findByEmailWithoutAvatar(email, options);
            const emailVerificationToken = crypto_1.default
                .randomBytes(20)
                .toString('hex');
            const emailVerificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
            yield user_1.default(options.database).updateOne({ _id: id }, {
                emailVerificationToken,
                emailVerificationTokenExpiresAt,
                updatedBy: currentUser.id,
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: {
                    id,
                    emailVerificationToken,
                    emailVerificationTokenExpiresAt,
                },
            }, options);
            return emailVerificationToken;
        });
    }
    static generatePasswordResetToken(email, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            const { id } = yield this.findByEmailWithoutAvatar(email, options);
            const passwordResetToken = crypto_1.default
                .randomBytes(20)
                .toString('hex');
            const passwordResetTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
            yield user_1.default(options.database).updateOne({ _id: id }, {
                passwordResetToken,
                passwordResetTokenExpiresAt,
                updatedBy: currentUser.id,
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: {
                    id,
                    passwordResetToken,
                    passwordResetTokenExpiresAt,
                },
            }, options);
            return passwordResetToken;
        });
    }
    static update(id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            data = this._preSave(data);
            yield user_1.default(options.database).updateOne({ _id: id }, {
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                fullName: data.fullName || null,
                phoneNumber: data.phoneNumber || null,
                updatedBy: currentUser.id,
                avatars: data.avatars || [],
            }, options);
            const user = yield this.findById(id, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: user,
            }, options);
            return user;
        });
    }
    static findByEmail(email, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.findByEmailWithoutAvatar(email, options);
            return yield this._fillRelationsAndFileDownloadUrls(record, options);
        });
    }
    static findByEmailWithoutAvatar(email, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findOne({
                email: {
                    $regex: new RegExp(`^${mongooseQueryUtils_1.default.escapeRegExp(email)}$`),
                    $options: 'i',
                },
            })
                .populate('tenants.tenant'), options);
        });
    }
    static findAndCountAll({ filter, limit = 0, offset = 0, orderBy = '' }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [];
            criteriaAnd.push({
                tenants: { $elemMatch: { tenant: currentTenant.id } },
            });
            if (filter) {
                if (filter.id) {
                    criteriaAnd.push({
                        ['_id']: mongooseQueryUtils_1.default.uuid(filter.id),
                    });
                }
                if (filter.fullName) {
                    criteriaAnd.push({
                        ['fullName']: {
                            $regex: mongooseQueryUtils_1.default.escapeRegExp(filter.fullName),
                            $options: 'i',
                        },
                    });
                }
                if (filter.email) {
                    criteriaAnd.push({
                        ['email']: {
                            $regex: mongooseQueryUtils_1.default.escapeRegExp(filter.email),
                            $options: 'i',
                        },
                    });
                }
                if (filter.role) {
                    criteriaAnd.push({
                        tenants: { $elemMatch: { roles: filter.role } },
                    });
                }
                if (filter.status) {
                    criteriaAnd.push({
                        tenants: {
                            $elemMatch: { status: filter.status },
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
            const sort = mongooseQueryUtils_1.default.sort(orderBy || 'createdAt_DESC');
            const skip = Number(offset || 0) || undefined;
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = criteriaAnd.length
                ? { $and: criteriaAnd }
                : null;
            let rows = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .find(criteria)
                .skip(skip)
                .limit(limitEscaped)
                .sort(sort)
                .populate('tenants.tenant'), options);
            const count = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database).countDocuments(criteria), options);
            rows = this._mapUserForTenantForRows(rows, currentTenant);
            rows = yield Promise.all(rows.map((row) => this._fillRelationsAndFileDownloadUrls(row, options)));
            return { rows, count };
        });
    }
    static findAllAutocomplete(search, limit, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let criteriaAnd = [
                {
                    tenants: {
                        $elemMatch: { tenant: currentTenant.id },
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
                            fullName: {
                                $regex: mongooseQueryUtils_1.default.escapeRegExp(search),
                                $options: 'i',
                            },
                        },
                        {
                            email: {
                                $regex: mongooseQueryUtils_1.default.escapeRegExp(search),
                                $options: 'i',
                            },
                        },
                    ],
                });
            }
            const sort = mongooseQueryUtils_1.default.sort('fullName_ASC');
            const limitEscaped = Number(limit || 0) || undefined;
            const criteria = { $and: criteriaAnd };
            let users = yield user_1.default(options.database)
                .find(criteria)
                .limit(limitEscaped)
                .sort(sort);
            users = this._mapUserForTenantForRows(users, currentTenant);
            const buildText = (user) => {
                if (!user.fullName) {
                    return user.email;
                }
                return `${user.fullName} <${user.email}>`;
            };
            return users.map((user) => ({
                id: user.id,
                label: buildText(user),
            }));
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
                return ids;
            }
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            let users = yield user_1.default(options.database)
                .find({
                _id: {
                    $in: ids,
                },
                tenants: {
                    $elemMatch: { tenant: currentTenant.id },
                },
            })
                .select(['_id']);
            return users.map((user) => user._id);
        });
    }
    static findByIdWithPassword(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findById(id)
                .populate('tenants.tenant'), options);
        });
    }
    static findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findById(id)
                .populate('tenants.tenant'), options);
            if (!record) {
                throw new Error404_1.default();
            }
            const currentTenant = mongooseRepository_1.default.getCurrentTenant(options);
            if (!options || !options.bypassPermissionValidation) {
                if (!userTenantUtils_1.isUserInTenant(record, currentTenant.id)) {
                    throw new Error404_1.default();
                }
                record = this._mapUserForTenant(record, currentTenant);
            }
            record = yield this._fillRelationsAndFileDownloadUrls(record, options);
            return record;
        });
    }
    static findPassword(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let record = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findById(id)
                .select('+password'), options);
            if (!record) {
                return null;
            }
            return record.password;
        });
    }
    static findByIdWithoutAvatar(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findById(id, options);
        });
    }
    /**
     * Finds the user by the password token if not expired.
     */
    static findByPasswordResetToken(token, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database).findOne({
                passwordResetToken: token,
                passwordResetTokenExpiresAt: { $gt: Date.now() },
            }), options);
        });
    }
    /**
     * Finds the user by the email verification token if not expired.
     */
    static findByEmailVerificationToken(token, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database).findOne({
                emailVerificationToken: token,
                emailVerificationTokenExpiresAt: {
                    $gt: Date.now(),
                },
            }), options);
        });
    }
    static markEmailVerified(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            yield user_1.default(options.database).updateOne({ _id: id }, {
                emailVerified: true,
                updatedBy: currentUser.id,
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: id,
                action: auditLogRepository_1.default.UPDATE,
                values: {
                    emailVerified: true,
                },
            }, options);
            return true;
        });
    }
    static count(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database).countDocuments(filter), options);
        });
    }
    /**
     * Normalize the user fields.
     */
    static _preSave(data) {
        if (data.firstName || data.lastName) {
            data.fullName = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
        }
        data.email = data.email ? data.email.trim() : null;
        data.firstName = data.firstName
            ? data.firstName.trim()
            : null;
        data.lastName = data.lastName
            ? data.lastName.trim()
            : null;
        return data;
    }
    /**
     * Maps the users data to show only the current tenant related info
     */
    static _mapUserForTenantForRows(rows, tenant) {
        if (!rows) {
            return rows;
        }
        return rows.map((record) => this._mapUserForTenant(record, tenant));
    }
    /**
     * Maps the user data to show only the current tenant related info
     */
    static _mapUserForTenant(user, tenant) {
        if (!user || !user.tenants) {
            return user;
        }
        const tenantUser = user.tenants.find((tenantUser) => tenantUser &&
            tenantUser.tenant &&
            String(tenantUser.tenant.id) === String(tenant.id));
        delete user.tenants;
        const status = tenantUser ? tenantUser.status : null;
        const roles = tenantUser ? tenantUser.roles : [];
        // If the user is only invited,
        // tenant members can only see its email
        const otherData = status === 'active' ? user.toObject() : {};
        return Object.assign(Object.assign({}, otherData), { id: user.id, email: user.email, roles,
            status });
    }
    static _fillRelationsAndFileDownloadUrls(record, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!record) {
                return null;
            }
            const output = record.toObject
                ? record.toObject()
                : record;
            if (output.tenants && output.tenants.length) {
                yield Promise.all(output.tenants.map((userTenant) => __awaiter(this, void 0, void 0, function* () {
                    userTenant.tenant.settings = yield settingsRepository_1.default.find(Object.assign({ currentTenant: userTenant.tenant }, options));
                })));
            }
            output.avatars = yield fileRepository_1.default.fillDownloadUrl(output.avatars);
            return output;
        });
    }
    static createFromSocial(provider, providerId, email, emailVerified, firstName, lastName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {
                email,
                emailVerified,
                providerId,
                provider,
                firstName,
                lastName,
            };
            data = this._preSave(data);
            let [user] = yield user_1.default(options.database).create([data], options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: auditLogRepository_1.default.CREATE,
                values: user,
            }, options);
            return this.findById(user.id, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }));
        });
    }
    static cleanupForRelationships(userOrUsers) {
        if (!userOrUsers) {
            return userOrUsers;
        }
        if (Array.isArray(userOrUsers)) {
            return userOrUsers.map((user) => lodash_1.default.pick(user, [
                '_id',
                'id',
                'firstName',
                'lastName',
                'email',
            ]));
        }
        return lodash_1.default.pick(userOrUsers, [
            '_id',
            'id',
            'firstName',
            'lastName',
            'email',
        ]);
    }
}
exports.default = UserRepository;
//# sourceMappingURL=userRepository.js.map