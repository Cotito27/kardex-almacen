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
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const user_1 = __importDefault(require("../models/user"));
const crypto_1 = __importDefault(require("crypto"));
class TenantUserRepository {
    static findByInvitationToken(invitationToken, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findOne({
                tenants: { $elemMatch: { invitationToken } },
            })
                .populate('tenants.tenant'), options);
            if (!user) {
                return null;
            }
            user = user.toObject ? user.toObject() : user;
            const tenantUser = user.tenants.find((userTenant) => {
                return userTenant.invitationToken === invitationToken;
            });
            return Object.assign(Object.assign({}, tenantUser), { user });
        });
    }
    static create(tenant, user, roles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            roles = roles || [];
            const status = selectStatus('active', roles);
            yield user_1.default(options.database).updateMany({ _id: user.id }, {
                $push: {
                    tenants: {
                        tenant: tenant.id,
                        status,
                        roles,
                    },
                },
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: auditLogRepository_1.default.CREATE,
                values: {
                    email: user.email,
                    status,
                    roles,
                },
            }, options);
        });
    }
    static destroy(tenantId, id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database).findById(id), options);
            yield user_1.default(options.database).updateOne({ _id: id }, {
                $pull: {
                    tenants: { tenant: tenantId },
                },
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: auditLogRepository_1.default.DELETE,
                values: {
                    email: user.email,
                },
            }, options);
        });
    }
    static updateRoles(tenantId, id, roles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongooseRepository_1.default.wrapWithSessionIfExists(user_1.default(options.database)
                .findById(id)
                .populate('tenants.tenant'), options);
            let tenantUser = user.tenants.find((userTenant) => {
                return userTenant.tenant.id === tenantId;
            });
            let isCreation = false;
            if (!tenantUser) {
                isCreation = true;
                tenantUser = {
                    tenant: tenantId,
                    status: selectStatus('invited', []),
                    invitationToken: crypto_1.default
                        .randomBytes(20)
                        .toString('hex'),
                    roles: [],
                };
                yield user_1.default(options.database).updateOne({ _id: id }, {
                    $push: {
                        tenants: tenantUser,
                    },
                }, options);
            }
            let { roles: existingRoles } = tenantUser;
            let newRoles = [];
            if (options.addRoles) {
                newRoles = [...new Set([...existingRoles, ...roles])];
            }
            else if (options.removeOnlyInformedRoles) {
                newRoles = existingRoles.filter((existingRole) => !roles.includes(existingRole));
            }
            else {
                newRoles = roles || [];
            }
            tenantUser.roles = newRoles;
            tenantUser.status = selectStatus(tenantUser.status, newRoles);
            yield user_1.default(options.database).updateOne({ _id: id, 'tenants.tenant': tenantId }, {
                $set: {
                    'tenants.$.roles': newRoles,
                    'tenants.$.status': tenantUser.status,
                },
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: user.id,
                action: isCreation
                    ? auditLogRepository_1.default.CREATE
                    : auditLogRepository_1.default.UPDATE,
                values: {
                    email: user.email,
                    status: tenantUser.status,
                    roles: newRoles,
                },
            }, options);
            return tenantUser;
        });
    }
    static acceptInvitation(invitationToken, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = mongooseRepository_1.default.getCurrentUser(options);
            // This tenant user includes the User data
            let invitationTenantUser = yield this.findByInvitationToken(invitationToken, options);
            let existingTenantUser = currentUser.tenants.find((userTenant) => String(userTenant.tenant.id) ===
                String(invitationTenantUser.tenant.id));
            // destroys old invite just for sure
            yield this.destroy(invitationTenantUser.tenant.id, invitationTenantUser.user.id, options);
            const tenantUser = {
                tenant: invitationTenantUser.tenant.id,
                invitationToken: null,
                status: selectStatus('active', invitationTenantUser.roles),
                roles: invitationTenantUser.roles,
            };
            // In case the user is already a member, should merge the roles
            if (existingTenantUser) {
                // Merges the roles from the invitation and the current tenant user
                tenantUser.roles = [
                    ...new Set([
                        ...existingTenantUser.roles,
                        ...invitationTenantUser.roles,
                    ]),
                ];
            }
            const isSameEmailFromInvitation = invitationTenantUser.user.id === currentUser.id;
            // Auto-verifies email if the invitation token matches the same email
            const emailVerified = currentUser.emailVerified ||
                isSameEmailFromInvitation;
            yield user_1.default(options.database).updateOne({ _id: currentUser.id }, {
                emailVerified,
                $push: {
                    tenants: tenantUser,
                },
            }, options);
            yield auditLogRepository_1.default.log({
                entityName: 'user',
                entityId: currentUser.id,
                action: auditLogRepository_1.default.UPDATE,
                values: {
                    email: currentUser.email,
                    roles: tenantUser.roles,
                    status: selectStatus('active', tenantUser.roles),
                },
            }, options);
        });
    }
}
exports.default = TenantUserRepository;
function selectStatus(oldStatus, newRoles) {
    newRoles = newRoles || [];
    if (oldStatus === 'invited') {
        return oldStatus;
    }
    if (!newRoles.length) {
        return 'empty-permissions';
    }
    return 'active';
}
//# sourceMappingURL=tenantUserRepository.js.map