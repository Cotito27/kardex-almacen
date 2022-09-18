"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileSchema_1 = __importDefault(require("./schemas/fileSchema"));
const tenantUserSchema_1 = __importDefault(require("./schemas/tenantUserSchema"));
const Schema = mongoose_1.default.Schema;
exports.default = (database) => {
    try {
        return database.model('user');
    }
    catch (error) {
        // continue, because model doesnt exist
    }
    const UserSchema = new Schema({
        fullName: { type: String, maxlength: 255 },
        firstName: { type: String, maxlength: 80 },
        lastName: { type: String, maxlength: 175 },
        phoneNumber: { type: String, maxlength: 24 },
        provider: { type: String, maxlength: 255 },
        providerId: { type: String, maxlength: 255 },
        email: {
            type: String,
            maxlength: 255,
            index: { unique: true },
            required: true
        },
        password: {
            type: String,
            maxlength: 255,
            select: false,
        },
        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: {
            type: String,
            maxlength: 255,
            select: false,
        },
        emailVerificationTokenExpiresAt: { type: Date },
        passwordResetToken: {
            type: String,
            maxlength: 255,
            select: false,
        },
        passwordResetTokenExpiresAt: { type: Date },
        avatars: [fileSchema_1.default],
        tenants: [tenantUserSchema_1.default],
        jwtTokenInvalidBefore: { type: Date },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        importHash: { type: String, maxlength: 255 },
    }, {
        timestamps: true,
    });
    UserSchema.index({ importHash: 1 }, {
        unique: true,
        partialFilterExpression: {
            importHash: { $type: 'string' },
        },
    });
    UserSchema.virtual('id').get(function () {
        // @ts-ignore
        return this._id.toHexString();
    });
    UserSchema.set('toJSON', {
        getters: true,
    });
    UserSchema.set('toObject', {
        getters: true,
    });
    return database.model('user', UserSchema);
};
//# sourceMappingURL=user.js.map