import {
    IOrderMessage,
    IRatingTypes,
    IReviewMessageDetails,
    ISellerDocument,
    winstonLogger
} from "@Akihira77/jobber-shared";
import { ELASTIC_SEARCH_URL } from "@users/config";
import { SellerModel } from "@users/models/seller.model";
import { updateBuyerIsSellerProp } from "@users/services/buyer.service";
import { Logger } from "winston";

const logger: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "sellerService",
    "debug"
);

export async function getSellerById(
    id: string
): Promise<ISellerDocument | null> {
    try {
        return await SellerModel.findById(id).lean().exec();
    } catch (error) {
        logger.error("UsersService getSellerById() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function getSellerByUsername(
    username: string
): Promise<ISellerDocument | null> {
    try {
        return await SellerModel.findOne({
            username
        })
            .lean()
            .exec();
    } catch (error) {
        logger.error("UsersService getSellerByUsername() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function getSellerByEmail(
    email: string
): Promise<ISellerDocument | null> {
    try {
        return await SellerModel.findOne({
            email
        })
            .lean()
            .exec();
    } catch (error) {
        logger.error("UsersService getSellerByEmail() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function getRandomSellers(
    size: number
): Promise<ISellerDocument[]> {
    try {
        return await SellerModel.aggregate([
            {
                $sample: {
                    size
                }
            }
        ]);
    } catch (error) {
        logger.error("UsersService getRandomSellers() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function createSeller(
    sellerData: ISellerDocument
): Promise<ISellerDocument> {
    try {
        const result = await SellerModel.create(sellerData);

        await updateBuyerIsSellerProp(result.email!);

        return result;
    } catch (error) {
        logger.error("UsersService createSeller() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateTotalGigCount(
    sellerId: string,
    count: number
): Promise<void> {
    try {
        await SellerModel.updateOne(
            { _id: sellerId },
            {
                $inc: {
                    totalGigs: count
                }
            }
        ).exec();
    } catch (error) {
        logger.error("UsersService updateTotalGigCount() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateSellerOngoingJobsProp(
    sellerId: string,
    ongoingJobs: number
): Promise<void> {
    try {
        await SellerModel.updateOne(
            { _id: sellerId },
            {
                $inc: {
                    ongoingJobs
                }
            }
        ).exec();
    } catch (error) {
        logger.error(
            "UsersService updateSellerOngoingJobsProp() method error",
            error
        );
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateSellerCancelJobsProp(
    sellerId: string
): Promise<void> {
    try {
        await SellerModel.updateOne(
            { _id: sellerId },
            {
                $inc: {
                    ongoingJobs: -1,
                    cancelledJobs: 1
                }
            }
        ).exec();
    } catch (error) {
        logger.error(
            "UsersService updateSellerCancelJobsProp() method error",
            error
        );
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateSellerCompletedJobs(
    data: IOrderMessage
): Promise<void> {
    try {
        const {
            sellerId,
            ongoingJobs,
            totalEarnings,
            recentDelivery,
            completedJobs
        } = data;

        await SellerModel.updateOne(
            { _id: sellerId },
            {
                $inc: {
                    ongoingJobs,
                    completedJobs,
                    totalEarnings
                },
                $set: {
                    recentDelivery: new Date(recentDelivery!)
                }
            }
        ).exec();
    } catch (error) {
        logger.error(
            "UsersService updateSellerCompletedJobs() method error",
            error
        );
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateSellerReview(
    data: IReviewMessageDetails
): Promise<void> {
    try {
        const ratingTypes: IRatingTypes = {
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five"
        };
        const ratingKey: string = ratingTypes[`${data.rating}`];

        await SellerModel.updateOne(
            { _id: data.sellerId },
            {
                $inc: {
                    ratingsCount: 1, // sum of user rating
                    ratingSum: data.rating, // sum of star
                    [`ratingCategories.${ratingKey}.value`]: data.rating,
                    [`ratingCategories.${ratingKey}.count`]: 1
                }
            }
        ).exec();
    } catch (error) {
        logger.error("UsersService updateSellerReview() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateSeller(
    sellerId: string,
    sellerData: ISellerDocument
): Promise<ISellerDocument | null> {
    try {
        return await SellerModel.findOneAndUpdate(
            { _id: sellerId },
            sellerData,
            { new: true }
        )
            .lean()
            .exec();
    } catch (error) {
        logger.error("UsersService updateSeller() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}
