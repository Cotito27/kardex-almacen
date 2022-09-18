"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserInTenant = void 0;
function isUserInTenant(user, tenantId) {
    if (!user) {
        return false;
    }
    return user.tenants.some((tenantUser) => String(tenantUser.tenant.id) === String(tenantId));
}
exports.isUserInTenant = isUserInTenant;
//# sourceMappingURL=userTenantUtils.js.map