"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Utilities to use on Mongoose queries.
 */
class MongooseQueryUtils {
    /**
     * If you pass an invalid uuid to a query, it throws an exception.
     * To hack this behaviour, if the uuid is invalid, it creates a new one,
     * that won't match any of the database.
     * If the uuid is invalid, brings no results.
     */
    static uuid(value) {
        let id = value;
        // If ID is invalid, mongodb throws an error.
        // For that not to happen, if the ObjectID is invalid, it sets
        // some random ObjectID
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            id = mongoose_1.default.Types.ObjectId.createFromTime(+new Date());
        }
        return id;
    }
    /**
     * Some string values may break the RegExp used for queries.
     * This method escapes it.
     */
    static escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Returns the sort clause.
     */
    static sort(orderBy) {
        if (!orderBy) {
            return undefined;
        }
        let [column, order] = orderBy.split('_');
        if (column === 'id') {
            column = '_id';
        }
        return {
            [column]: order === 'ASC' ? 1 : -1,
        };
    }
}
exports.default = MongooseQueryUtils;
//# sourceMappingURL=mongooseQueryUtils.js.map