"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is responsible for creating the MongoDB collections.
 * Run it via `npm run db:create`.
 */
require('dotenv').config();
const models_1 = require("../models");
const databaseConnection_1 = require("../databaseConnection");
databaseConnection_1.databaseInit()
    .then(models_1.createCollections)
    .then(() => console.log('Collections successfully created'))
    .then(() => process.exit())
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=create.js.map