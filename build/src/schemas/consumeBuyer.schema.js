"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authBuyerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authBuyerSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().required().email(),
    profilePicture: joi_1.default.string().required(),
    country: joi_1.default.string().required(),
    createdAt: joi_1.default.string().required()
});
//# sourceMappingURL=consumeBuyer.schema.js.map