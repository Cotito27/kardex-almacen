"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const roles_1 = __importDefault(require("./roles"));
const plans_1 = __importDefault(require("./plans"));
const storage_1 = __importDefault(require("./storage"));
const storage = storage_1.default.values;
const roles = roles_1.default.values;
const plans = plans_1.default.values;
class Permissions {
    static get values() {
        return {
            tenantEdit: {
                id: 'tenantEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            tenantDestroy: {
                id: 'tenantDestroy',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            planEdit: {
                id: 'planEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            planRead: {
                id: 'planRead',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userEdit: {
                id: 'userEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userDestroy: {
                id: 'userDestroy',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userCreate: {
                id: 'userCreate',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userImport: {
                id: 'userImport',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userRead: {
                id: 'userRead',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            userAutocomplete: {
                id: 'userAutocomplete',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            auditLogRead: {
                id: 'auditLogRead',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
            },
            settingsEdit: {
                id: 'settingsEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [
                    plans.free,
                    plans.growth,
                    plans.enterprise,
                ],
                allowedStorage: [
                    storage.settingsBackgroundImages,
                    storage.settingsLogos,
                ],
            },
            productoImport: {
                id: 'productoImport',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            productoCreate: {
                id: 'productoCreate',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            productoEdit: {
                id: 'productoEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            productoDestroy: {
                id: 'productoDestroy',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            productoRead: {
                id: 'productoRead',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            productoAutocomplete: {
                id: 'productoAutocomplete',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            movimientoImport: {
                id: 'movimientoImport',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            movimientoCreate: {
                id: 'movimientoCreate',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            movimientoEdit: {
                id: 'movimientoEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            movimientoDestroy: {
                id: 'movimientoDestroy',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            movimientoRead: {
                id: 'movimientoRead',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            movimientoAutocomplete: {
                id: 'movimientoAutocomplete',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            stockImport: {
                id: 'stockImport',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            stockCreate: {
                id: 'stockCreate',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            stockEdit: {
                id: 'stockEdit',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            stockDestroy: {
                id: 'stockDestroy',
                allowedRoles: [roles.admin],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
                allowedStorage: [],
            },
            stockRead: {
                id: 'stockRead',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
            stockAutocomplete: {
                id: 'stockAutocomplete',
                allowedRoles: [roles.admin, roles.custom],
                allowedPlans: [plans.free, plans.growth, plans.enterprise],
            },
        };
    }
    static get asArray() {
        return Object.keys(this.values).map((value) => {
            return this.values[value];
        });
    }
}
exports.default = Permissions;
//# sourceMappingURL=permissions.js.map