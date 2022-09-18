"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const FileSchema = new Schema({
    name: {
        type: String,
        maxlength: 21845,
        required: true,
    },
    sizeInBytes: { type: Number },
    privateUrl: { type: String, maxlength: 21845 },
    publicUrl: {
        type: String,
        maxlength: 21845,
        required: false,
    },
    tenant: {
        type: Schema.Types.ObjectId,
        ref: 'tenant',
    },
}, { timestamps: true });
FileSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
});
FileSchema.set('toJSON', {
    getters: true,
});
FileSchema.set('toObject', {
    getters: true,
});
exports.default = FileSchema;
//# sourceMappingURL=fileSchema.js.map