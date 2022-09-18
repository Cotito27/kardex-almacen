"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.get(`/tenant/:tenantId/dashboard/:entityName/count`, require('./dashboardList').default);
    app.get(`/tenant/:tenantId/dashboard/:entityName/last_date`, require('./dashboardListByLastDate').default);
};
//# sourceMappingURL=index.js.map