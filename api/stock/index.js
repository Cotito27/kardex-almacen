"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.post(`/tenant/:tenantId/stock`, require('./stockCreate').default);
    app.put(`/tenant/:tenantId/stock/:id`, require('./stockUpdate').default);
    app.post(`/tenant/:tenantId/stock/import`, require('./stockImport').default);
    app.delete(`/tenant/:tenantId/stock`, require('./stockDestroy').default);
    app.get(`/tenant/:tenantId/stock/autocomplete`, require('./stockAutocomplete').default);
    app.get(`/tenant/:tenantId/stock`, require('./stockList').default);
    app.get(`/tenant/:tenantId/stock/:id`, require('./stockFind').default);
};
//# sourceMappingURL=index.js.map