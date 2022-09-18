"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('auditLog');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const AuditLogSchema = new Schema({
        entityName: {
            type: String,
            maxlength: 255,
            required: true,
        },
        entityId: {
            type: String,
            maxlength: 255,
            required: true,
        },
        action: {
            type: String,
            maxlength: 255,
            required: true,
        },
        tenantId: {
            type: String,
            maxlength: 255,
        },
        createdById: { type: String, maxlength: 255 },
        createdByEmail: { type: String, maxlength: 255 },
        timestamp: { type: Date, required: true },
        values: { type: Schema.Types.Mixed },
    }, { timestamps: true });
    AuditLogSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    AuditLogSchema.set('toJSON', {
        getters: true,
    });
    AuditLogSchema.set('toObject', {
        getters: true,
    });
    return database.model('auditLog', AuditLogSchema);
};
//# sourceMappingURL=auditLog.js.map