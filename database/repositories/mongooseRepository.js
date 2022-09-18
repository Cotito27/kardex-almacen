"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
const Error400_1 = __importDefault(require("../../errors/Error400"));
/**
 * Abstracts some basic Mongoose operations.
 * See https://mongoosejs.com/docs/index.html
 */
class MongooseRepository {
    /**
     * Cleans the database.
     */
    static cleanDatabase(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV !== 'test') {
                throw new Error('Clean database only allowed for test!');
            }
            return connection.dropDatabase();
        });
    }
    /**
     * Returns the currentUser if it exists on the options.
     */
    static getCurrentUser(options) {
        return (options && options.currentUser) || { id: null };
    }
    /**
     * Returns the tenant if it exists on the options.
     */
    static getCurrentTenant(options) {
        return ((options && options.currentTenant) || { id: null });
    }
    /**
     * Returns the session if it exists on the options.
     */
    static getSession(options) {
        return (options && options.session) || undefined;
    }
    /**
     * Creates a database session and transaction.
     */
    static createSession(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.getConfig().DATABASE_TRANSACTIONS !== 'true') {
                return;
            }
            const session = yield connection.startSession();
            yield session.startTransaction();
            return session;
        });
    }
    /**
     * Commits a database transaction.
     */
    static commitTransaction(session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.getConfig().DATABASE_TRANSACTIONS !== 'true') {
                return;
            }
            yield session.commitTransaction();
            yield session.endSession();
        });
    }
    /**
     * Aborts a database transaction.
     */
    static abortTransaction(session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.getConfig().DATABASE_TRANSACTIONS !== 'true') {
                return;
            }
            yield session.abortTransaction();
            yield session.endSession();
        });
    }
    /**
     * Wraps the operation with the current session.
     */
    static wrapWithSessionIfExists(toWrap, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.getSession(options)) {
                return toWrap;
            }
            return toWrap.session(this.getSession(options));
        });
    }
    /**
     * In the case of a two way relationship, both records from both collections
     * must be in sync.
     * This method ensures it for Many to One relations.
     */
    static refreshTwoWayRelationManyToOne(record, sourceModel, sourceProperty, targetModel, targetProperty, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sourceModel.updateMany({
                _id: { $nin: record._id },
                [sourceProperty]: { $in: record[sourceProperty] },
            }, {
                $pullAll: {
                    [sourceProperty]: record[sourceProperty],
                },
            }, options);
            yield targetModel.updateMany({
                _id: { $in: record[sourceProperty] },
            }, { [targetProperty]: record._id }, options);
            yield targetModel.updateMany({
                _id: { $nin: record[sourceProperty] },
                [targetProperty]: record._id,
            }, { [targetProperty]: null }, options);
        });
    }
    /**
     * In the case of a two-way relationship, both records from
     * both collections must be in sync.
     * This method ensures it for One to One relations.
     */
    static refreshTwoWayRelationOneToMany(record, sourceProperty, targetModel, targetProperty, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield targetModel.updateOne({ _id: record[sourceProperty] }, { $addToSet: { [targetProperty]: record._id } }, options);
            yield targetModel.updateMany({
                _id: { $ne: record[sourceProperty] },
                [targetProperty]: record._id,
            }, { $pull: { [targetProperty]: record._id } }, options);
        });
    }
    /**
     * In the case of a two-way relationship, both records from
     * both collections must be in sync.
     * This method ensures it for Many to Many relations.
     */
    static refreshTwoWayRelationManyToMany(record, sourceProperty, targetModel, targetProperty, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield targetModel.updateMany({ _id: { $in: record[sourceProperty] } }, { $addToSet: { [targetProperty]: record._id } }, options);
            yield targetModel.updateMany({
                _id: { $nin: record[sourceProperty] },
                [targetProperty]: { $in: record._id },
            }, { $pull: { [targetProperty]: record._id } }, options);
        });
    }
    /**
     * If the record is referenced on other collection,
     * clears the referece from the other collection.
     * This method handles the relatino to many.
     */
    static destroyRelationToMany(recordId, targetModel, targetProperty, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield targetModel.updateMany({ [targetProperty]: recordId }, { $pull: { [targetProperty]: recordId } }, options);
        });
    }
    /**
     * If the record is referenced on other collection,
     * clears the referece from the other collection.
     * This method handles the relatino to one.
     */
    static destroyRelationToOne(recordId, targetModel, targetProperty, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield targetModel.updateMany({ [targetProperty]: recordId }, { [targetProperty]: null }, options);
        });
    }
    static handleUniqueFieldError(error, language, entityName) {
        if (!error || error.code !== 11000) {
            return;
        }
        const uniqueFieldWithError = Object.keys(error.keyPattern).filter((key) => key !== 'tenant')[0];
        throw new Error400_1.default(language, `entities.${entityName}.errors.unique.${uniqueFieldWithError}`);
    }
}
exports.default = MongooseRepository;
//# sourceMappingURL=mongooseRepository.js.map