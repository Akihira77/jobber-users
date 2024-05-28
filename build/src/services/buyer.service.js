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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBuyerPurchasedGigsProp = exports.updateBuyerIsSellerProp = exports.createBuyer = exports.getRandomBuyers = exports.getBuyerByUsername = exports.getBuyerByEmail = void 0;
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const config_1 = require("../config");
const buyer_model_1 = require("../models/buyer.model");
const logger = (0, jobber_shared_1.winstonLogger)(`${config_1.ELASTIC_SEARCH_URL}`, "buyerService", "debug");
function getBuyerByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield buyer_model_1.BuyerModel.findOne({ email }).lean().exec();
        }
        catch (error) {
            logger.error("UsersService getBuyerByEmail() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getBuyerByEmail = getBuyerByEmail;
function getBuyerByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield buyer_model_1.BuyerModel.findOne({ username }).lean().exec();
        }
        catch (error) {
            logger.error("UsersService getBuyerByUsername() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getBuyerByUsername = getBuyerByUsername;
function getRandomBuyers(size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield buyer_model_1.BuyerModel.aggregate([
                {
                    $sample: {
                        size
                    }
                }
            ]);
        }
        catch (error) {
            logger.error("UsersService getRandomBuyers() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getRandomBuyers = getRandomBuyers;
function createBuyer(buyerData) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingBuyer = (_b = (yield getBuyerByEmail((_a = buyerData.email) !== null && _a !== void 0 ? _a : ""))) !== null && _b !== void 0 ? _b : (yield getBuyerByUsername((_c = buyerData.username) !== null && _c !== void 0 ? _c : ""));
            if (!existingBuyer) {
                yield buyer_model_1.BuyerModel.create(buyerData);
            }
        }
        catch (error) {
            logger.error("UsersService createBuyer() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.createBuyer = createBuyer;
function updateBuyerIsSellerProp(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield buyer_model_1.BuyerModel.updateOne({
                email
            }, {
                $set: { isSeller: true }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateBuyerIsSellerProp() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateBuyerIsSellerProp = updateBuyerIsSellerProp;
function updateBuyerPurchasedGigsProp(buyerId, purchasedGigsId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield buyer_model_1.BuyerModel.updateOne({
                _id: buyerId
            }, type === "purchased-gigs"
                ? {
                    $push: {
                        purchasedGigs: purchasedGigsId
                    }
                }
                : {
                    $pull: {
                        purchasedGigs: purchasedGigsId
                    }
                }).exec();
        }
        catch (error) {
            logger.error("UsersService updateBuyerPurchasedGigsProp() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateBuyerPurchasedGigsProp = updateBuyerPurchasedGigsProp;
//# sourceMappingURL=buyer.service.js.map