"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.post(`/tenant/:tenantId/movimiento`, require('./movimientoCreate').default);
    app.put(`/tenant/:tenantId/movimiento/:id`, require('./movimientoUpdate').default);
    app.post(`/tenant/:tenantId/movimiento/import`, require('./movimientoImport').default);
    app.delete(`/tenant/:tenantId/movimiento`, require('./movimientoDestroy').default);
    app.get(`/tenant/:tenantId/movimiento/autocomplete`, require('./movimientoAutocomplete').default);
    app.get(`/tenant/:tenantId/movimiento`, require('./movimientoList').default);
    app.get(`/tenant/:tenantId/movimiento/:id`, require('./movimientoFind').default);
};
//# sourceMappingURL=index.js.map