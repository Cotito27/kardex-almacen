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
const fileStorage_1 = __importDefault(require("../../services/file/fileStorage"));
class FileRepository {
    static fillDownloadUrl(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files) {
                return files;
            }
            return yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                let downloadUrl;
                if (file.publicUrl) {
                    downloadUrl = file.publicUrl;
                }
                else {
                    downloadUrl = yield fileStorage_1.default.downloadUrl(file.privateUrl);
                }
                return Object.assign(Object.assign({}, file), { downloadUrl });
            })));
        });
    }
}
exports.default = FileRepository;
//# sourceMappingURL=fileRepository.js.map