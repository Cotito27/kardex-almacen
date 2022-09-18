"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('movimiento');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const MovimientoSchema = new Schema({
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'producto',
            required: true,
        },
        fecha: {
            type: String,
        },
        tipo: {
            type: String,
            required: true,
            enum: [
                "Entrada",
                "Salida"
            ],
        },
        detalleProveedor: {
            type: String,
        },
        cantidad: {
            type: Number,
            min: 0,
        },
        costoUnidad: {
            type: Number,
            min: 0,
        },
        tenant: {
            type: Schema.Types.ObjectId,
            ref: 'tenant',
            required: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        importHash: { type: String },
    }, { timestamps: true });
    MovimientoSchema.index({ importHash: 1, tenant: 1 }, {
        unique: true,
        partialFilterExpression: {
            importHash: { $type: 'string' },
        },
    });
    MovimientoSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    MovimientoSchema.set('toJSON', {
        getters: true,
    });
    MovimientoSchema.set('toObject', {
        getters: true,
    });
    return database.model('movimiento', MovimientoSchema);
};
//# sourceMappingURL=movimiento.js.map