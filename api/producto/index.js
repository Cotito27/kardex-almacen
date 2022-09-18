"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.post(`/tenant/:tenantId/producto`, require('./productoCreate').default);
    app.put(`/tenant/:tenantId/producto/:id`, require('./productoUpdate').default);
    app.post(`/tenant/:tenantId/producto/import`, require('./productoImport').default);
    app.delete(`/tenant/:tenantId/producto`, require('./productoDestroy').default);
    app.get(`/tenant/:tenantId/producto/autocomplete`, require('./productoAutocomplete').default);
    app.get(`/tenant/:tenantId/producto`, require('./productoList').default);
    app.get(`/tenant/:tenantId/producto/:id`, require('./productoFind').default);
};
//# sourceMappingURL=index.js.map