"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('producto');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const ProductoSchema = new Schema({
        codigo: {
            type: String,
        },
        descripcion: {
            type: String,
            required: true,
        },
        unidadMedida: {
            type: String,
        },
        detalle: {
            type: String,
        },
        saldoInicial: {
            type: Number,
        },
        precioInicial: {
            type: Number,
        },
        fechaVencimiento: {
            type: String,
        },
        otros: {
            type: String,
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
    ProductoSchema.index({ importHash: 1, tenant: 1 }, {
        unique: true,
        partialFilterExpression: {
            importHash: { $type: 'string' },
        },
    });
    ProductoSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    ProductoSchema.set('toJSON', {
        getters: true,
    });
    ProductoSchema.set('toObject', {
        getters: true,
    });
    return database.model('producto', ProductoSchema);
};
//# sourceMappingURL=producto.js.map