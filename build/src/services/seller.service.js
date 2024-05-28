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
exports.updateSeller = exports.updateSellerReview = exports.updateSellerCompletedJobs = exports.updateSellerCancelJobsProp = exports.updateSellerOngoingJobsProp = exports.updateTotalGigCount = exports.createSeller = exports.getRandomSellers = exports.getSellerByEmail = exports.getSellerByUsername = exports.getSellerById = void 0;
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const config_1 = require("../config");
const seller_model_1 = require("../models/seller.model");
const buyer_service_1 = require("../services/buyer.service");
const logger = (0, jobber_shared_1.winstonLogger)(`${config_1.ELASTIC_SEARCH_URL}`, "sellerService", "debug");
function getSellerById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield seller_model_1.SellerModel.findById(id).lean().exec();
        }
        catch (error) {
            logger.error("UsersService getSellerById() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getSellerById = getSellerById;
function getSellerByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield seller_model_1.SellerModel.findOne({
                username
            })
                .lean()
                .exec();
        }
        catch (error) {
            logger.error("UsersService getSellerByUsername() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getSellerByUsername = getSellerByUsername;
function getSellerByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield seller_model_1.SellerModel.findOne({
                email
            })
                .lean()
                .exec();
        }
        catch (error) {
            logger.error("UsersService getSellerByEmail() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getSellerByEmail = getSellerByEmail;
function getRandomSellers(size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield seller_model_1.SellerModel.aggregate([
                {
                    $sample: {
                        size
                    }
                }
            ]);
        }
        catch (error) {
            logger.error("UsersService getRandomSellers() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.getRandomSellers = getRandomSellers;
function createSeller(sellerData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield seller_model_1.SellerModel.create(sellerData);
            yield (0, buyer_service_1.updateBuyerIsSellerProp)(result.email);
            return result;
        }
        catch (error) {
            logger.error("UsersService createSeller() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.createSeller = createSeller;
function updateTotalGigCount(sellerId, count) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield seller_model_1.SellerModel.updateOne({ _id: sellerId }, {
                $inc: {
                    totalGigs: count
                }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateTotalGigCount() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateTotalGigCount = updateTotalGigCount;
function updateSellerOngoingJobsProp(sellerId, ongoingJobs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield seller_model_1.SellerModel.updateOne({ _id: sellerId }, {
                $inc: {
                    ongoingJobs
                }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateSellerOngoingJobsProp() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateSellerOngoingJobsProp = updateSellerOngoingJobsProp;
function updateSellerCancelJobsProp(sellerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield seller_model_1.SellerModel.updateOne({ _id: sellerId }, {
                $inc: {
                    ongoingJobs: -1,
                    cancelledJobs: 1
                }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateSellerCancelJobsProp() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateSellerCancelJobsProp = updateSellerCancelJobsProp;
function updateSellerCompletedJobs(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { sellerId, ongoingJobs, totalEarnings, recentDelivery, completedJobs } = data;
            yield seller_model_1.SellerModel.updateOne({ _id: sellerId }, {
                $inc: {
                    ongoingJobs,
                    completedJobs,
                    totalEarnings
                },
                $set: {
                    recentDelivery: new Date(recentDelivery)
                }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateSellerCompletedJobs() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateSellerCompletedJobs = updateSellerCompletedJobs;
function updateSellerReview(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ratingTypes = {
                "1": "one",
                "2": "two",
                "3": "three",
                "4": "four",
                "5": "five"
            };
            const ratingKey = ratingTypes[`${data.rating}`];
            yield seller_model_1.SellerModel.updateOne({ _id: data.sellerId }, {
                $inc: {
                    ratingsCount: 1, // sum of user rating
                    ratingSum: data.rating, // sum of star
                    [`ratingCategories.${ratingKey}.value`]: data.rating,
                    [`ratingCategories.${ratingKey}.count`]: 1
                }
            }).exec();
        }
        catch (error) {
            logger.error("UsersService updateSellerReview() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateSellerReview = updateSellerReview;
function updateSeller(sellerId, sellerData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield seller_model_1.SellerModel.findOneAndUpdate({ _id: sellerId }, sellerData, { new: true })
                .lean()
                .exec();
        }
        catch (error) {
            logger.error("UsersService updateSeller() method error", error);
            throw new Error("Unexpected error occured. Please try again.");
        }
    });
}
exports.updateSeller = updateSeller;
//# sourceMappingURL=seller.service.js.map