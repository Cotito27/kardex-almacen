"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('stock');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const StockSchema = new Schema({
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'producto',
            required: true,
        },
        cantidad: {
            type: Number,
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
    StockSchema.index({ importHash: 1, tenant: 1 }, {
        unique: true,
        partialFilterExpression: {
            importHash: { $type: 'string' },
        },
    });
    StockSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    StockSchema.set('toJSON', {
        getters: true,
    });
    StockSchema.set('toObject', {
        getters: true,
    });
    return database.model('stock', StockSchema);
};
//# sourceMappingURL=stock.js.map