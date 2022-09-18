"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileSchema_1 = __importDefault(require("./schemas/fileSchema"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('settings');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const SettingsSchema = new Schema({
        theme: { type: String, required: true },
        backgroundImages: [fileSchema_1.default],
        logos: [fileSchema_1.default],
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
    }, { timestamps: true });
    SettingsSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    SettingsSchema.set('toJSON', {
        getters: true,
    });
    SettingsSchema.set('toObject', {
        getters: true,
    });
    return database.model('settings', SettingsSchema);
};
//# sourceMappingURL=settings.js.map