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
const tenantRepository_1 = __importDefault(require("../database/repositories/tenantRepository"));
const tenantUserRepository_1 = __importDefault(require("../database/repositories/tenantUserRepository"));
const Error400_1 = __importDefault(require("../errors/Error400"));
const mongooseRepository_1 = __importDefault(require("../database/repositories/mongooseRepository"));
const permissionChecker_1 = __importDefault(require("./user/permissionChecker"));
const permissions_1 = __importDefault(require("../security/permissions"));
const Error404_1 = __importDefault(require("../errors/Error404"));
const config_1 = require("../config");
const roles_1 = __importDefault(require("../security/roles"));
const settingsService_1 = __importDefault(require("./settingsService"));
const userRepository_1 = __importDefault(require("../database/repositories/userRepository"));
const plans_1 = __importDefault(require("../security/plans"));
class TenantService {
    constructor(options) {
        this.options = options;
    }
    /**
     * Creates the default tenant or joins the default with
     * roles passed.
     * If default roles are empty, the admin will have to asign the roles
     * to new users.
     */
    createOrJoinDefault({ roles }, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenant = yield tenantRepository_1.default.findDefault(Object.assign(Object.assign({}, this.options), { session }));
            if (tenant) {
                // Reload the current user in case it has chenged
                // in the middle of this session
                const currentUserReloaded = yield userRepository_1.default.findById(this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { bypassPermissionValidation: true, session }));
                const tenantUser = currentUserReloaded.tenants.find((userTenant) => {
                    return userTenant.tenant.id === tenant.id;
                });
                // In this situation, the user has used the invitation token
                // and it is already part of the tenant
                if (tenantUser) {
                    return;
                }
                return yield tenantUserRepository_1.default.create(tenant, this.options.currentUser, roles, Object.assign(Object.assign({}, this.options), { session }));
            }
            let record = yield tenantRepository_1.default.create({ name: 'default', url: 'default' }, Object.assign(Object.assign({}, this.options), { session }));
            yield settingsService_1.default.findOrCreateDefault(Object.assign(Object.assign({}, this.options), { currentTenant: record, session }));
            yield tenantUserRepository_1.default.create(record, this.options.currentUser, [roles_1.default.values.admin], Object.assign(Object.assign({}, this.options), { session }));
        });
    }
    joinWithDefaultRolesOrAskApproval({ roles, tenantId }, { session }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenant = yield tenantRepository_1.default.findById(tenantId, Object.assign(Object.assign({}, this.options), { session }));
            if (!tenant) {
                return;
            }
            // Reload the current user in case it has chenged
            // in the middle of this session
            const currentUserReloaded = yield userRepository_1.default.findById(this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { bypassPermissionValidation: true, session }));
            const tenantUser = currentUserReloaded.tenants.find((userTenant) => {
                return userTenant.tenant.id === tenant.id;
            });
            if (tenantUser) {
                // If found the invited tenant user via email
                // accepts the invitation
                if (tenantUser.status === 'invited') {
                    return yield tenantUserRepository_1.default.acceptInvitation(tenantUser.invitationToken, Object.assign(Object.assign({}, this.options), { session }));
                }
                // In this case the tenant user already exists
                // and it's accepted or with empty permissions
                return;
            }
            return yield tenantUserRepository_1.default.create(tenant, this.options.currentUser, roles, Object.assign(Object.assign({}, this.options), { session }));
        });
    }
    // In case this user has been invited
    // but havent used the invitation token
    joinDefaultUsingInvitedEmail(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenant = yield tenantRepository_1.default.findDefault(Object.assign(Object.assign({}, this.options), { session }));
            if (!tenant) {
                return;
            }
            // Reload the current user in case it has chenged
            // in the middle of this session
            const currentUserReloaded = yield userRepository_1.default.findById(this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { bypassPermissionValidation: true, session }));
            const tenantUser = currentUserReloaded.tenants.find((userTenant) => {
                return userTenant.tenant.id === tenant.id;
            });
            if (!tenantUser || tenantUser.status !== 'invited') {
                return;
            }
            return yield tenantUserRepository_1.default.acceptInvitation(tenantUser.invitationToken, Object.assign(Object.assign({}, this.options), { session }));
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                if (config_1.getConfig().TENANT_MODE === 'single') {
                    const count = yield tenantRepository_1.default.count(null, Object.assign(Object.assign({}, this.options), { session }));
                    if (count > 0) {
                        throw new Error400_1.default(this.options.language, 'tenant.exists');
                    }
                }
                let record = yield tenantRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { session }));
                yield settingsService_1.default.findOrCreateDefault(Object.assign(Object.assign({}, this.options), { currentTenant: record, session }));
                yield tenantUserRepository_1.default.create(record, this.options.currentUser, [roles_1.default.values.admin], Object.assign(Object.assign({}, this.options), { session }));
                yield mongooseRepository_1.default.commitTransaction(session);
                return record;
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                let record = yield tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { session, currentTenant: { id } }));
                new permissionChecker_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: { id } })).validateHas(permissions_1.default.values.tenantEdit);
                record = yield tenantRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { session, currentTenant: record }));
                yield mongooseRepository_1.default.commitTransaction(session);
                return record;
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    updatePlanUser(id, planStripeCustomerId, planUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                yield tenantRepository_1.default.updatePlanUser(id, planStripeCustomerId, planUserId, Object.assign(Object.assign({}, this.options), { session, currentTenant: { id }, bypassPermissionValidation: true }));
                yield mongooseRepository_1.default.commitTransaction(session);
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    updatePlanToFree(planStripeCustomerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updatePlanStatus(planStripeCustomerId, plans_1.default.values.free, 'active');
        });
    }
    updatePlanStatus(planStripeCustomerId, plan, planStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                yield tenantRepository_1.default.updatePlanStatus(planStripeCustomerId, plan, planStatus, Object.assign(Object.assign({}, this.options), { session, bypassPermissionValidation: true }));
                yield mongooseRepository_1.default.commitTransaction(session);
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    destroyAll(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                for (const id of ids) {
                    const tenant = yield tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { session, currentTenant: { id } }));
                    new permissionChecker_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: tenant })).validateHas(permissions_1.default.values.tenantDestroy);
                    if (!plans_1.default.allowTenantDestroy(tenant.plan, tenant.planStatus)) {
                        throw new Error400_1.default(this.options.language, 'tenant.planActive');
                    }
                    yield tenantRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { session, currentTenant: { id } }));
                }
                yield mongooseRepository_1.default.commitTransaction(session);
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            return tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), options));
        });
    }
    findByUrl(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            return tenantRepository_1.default.findByUrl(url, Object.assign(Object.assign({}, this.options), options));
        });
    }
    findAllAutocomplete(search, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return tenantRepository_1.default.findAllAutocomplete(search, limit, this.options);
        });
    }
    findAndCountAll(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return tenantRepository_1.default.findAndCountAll(args, this.options);
        });
    }
    acceptInvitation(token, forceAcceptOtherEmail = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                const tenantUser = yield tenantUserRepository_1.default.findByInvitationToken(token, Object.assign(Object.assign({}, this.options), { session }));
                if (!tenantUser || tenantUser.status !== 'invited') {
                    throw new Error404_1.default();
                }
                const isNotCurrentUserEmail = tenantUser.user.id !== this.options.currentUser.id;
                if (!forceAcceptOtherEmail && isNotCurrentUserEmail) {
                    throw new Error400_1.default(this.options.language, 'tenant.invitation.notSameEmail', tenantUser.user.email, this.options.currentUser.email);
                }
                yield tenantUserRepository_1.default.acceptInvitation(token, Object.assign(Object.assign({}, this.options), { currentTenant: { id: tenantUser.tenant.id }, session }));
                yield mongooseRepository_1.default.commitTransaction(session);
                return tenantUser.tenant;
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    declineInvitation(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongooseRepository_1.default.createSession(this.options.database);
            try {
                const tenantUser = yield tenantUserRepository_1.default.findByInvitationToken(token, Object.assign(Object.assign({}, this.options), { session }));
                if (!tenantUser || tenantUser.status !== 'invited') {
                    throw new Error404_1.default();
                }
                yield tenantUserRepository_1.default.destroy(tenantUser.tenant.id, this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { session, currentTenant: { id: tenantUser.tenant.id } }));
                yield mongooseRepository_1.default.commitTransaction(session);
            }
            catch (error) {
                yield mongooseRepository_1.default.abortTransaction(session);
                throw error;
            }
        });
    }
    import(data, importHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!importHash) {
                throw new Error400_1.default(this.options.language, 'importer.errors.importHashRequired');
            }
            if (yield this._isImportHashExistent(importHash)) {
                throw new Error400_1.default(this.options.language, 'importer.errors.importHashExistent');
            }
            const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
            return this.create(dataToCreate);
        });
    }
    _isImportHashExistent(importHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield tenantRepository_1.default.count({
                importHash,
            }, this.options);
            return count > 0;
        });
    }
}
exports.default = TenantService;
//# sourceMappingURL=tenantService.js.map