import {
    IOrderMessage,
    IRatingTypes,
    IReviewMessageDetails,
    ISellerDocument
} from "@Akihira77/jobber-shared";
import { SellerModel } from "@users/models/seller.model";
// import mongoose from "mongoose";
import { updateBuyerIsSellerProp } from "@users/services/buyer.service";

export async function getSellerById(
    id: string
): Promise<ISellerDocument | null> {
    const result = await SellerModel.findById(
        // _id: new mongoose.Types.ObjectId(id)
        id
    )
        .lean()
        .exec();

    return result;
}

export async function getSellerByUsername(
    username: string
): Promise<ISellerDocument | null> {
    const result = await SellerModel.findOne({
        username
    })
        .lean()
        .exec();

    return result;
}

export async function getSellerByEmail(
    email: string
): Promise<ISellerDocument | null> {
    const result = await SellerModel.findOne({
        email
    })
        .lean()
        .exec();

    return result;
}

export async function getRandomSellers(
    size: number
): Promise<ISellerDocument[]> {
    const result = await SellerModel.aggregate([
        {
            $sample: {
                size
            }
        }
    ]);

    return result;
}

export async function createSeller(
    sellerData: ISellerDocument
): Promise<ISellerDocument> {
    const result = await SellerModel.create(sellerData);

    await updateBuyerIsSellerProp(`${result.email}`);

    return result;
}

export async function updateSeller(
    sellerId: string,
    sellerData: ISellerDocument
): Promise<ISellerDocument> {
    const {
        certificates,
        country,
        description,
        education,
        experience,
        fullName,
        languages,
        oneliner,
        responseTime,
        skills,
        socialLinks,
        profilePicture,
        profilePublicId
    } = sellerData;

    const result = (await SellerModel.findOneAndUpdate(
        { _id: sellerId },
        {
            $set: {
                profilePublicId,
                fullName,
                profilePicture,
                description,
                country,
                skills,
                oneliner,
                languages,
                responseTime,
                experience,
                education,
                socialLinks,
                certificates
            }
        },
        { new: true }
    ).exec()) as ISellerDocument;

    return result;
}

export async function updateTotalGigCount(
    sellerId: string,
    count: number
): Promise<void> {
    await SellerModel.updateOne(
        { _id: sellerId },
        {
            $inc: {
                totalGigs: count
            }
        }
    ).exec();
}

export async function updateSellerOngoingJobsProp(
    sellerId: string,
    ongoingJobs: number
): Promise<void> {
    await SellerModel.updateOne(
        { _id: sellerId },
        {
            $inc: {
                ongoingJobs
            }
        }
    ).exec();
}

export async function updateSellerCancelJobsProp(
    sellerId: string
): Promise<void> {
    await SellerModel.updateOne(
        { _id: sellerId },
        {
            $inc: {
                ongoingJobs: -1,
                cancelledJobs: 1
            }
        }
    ).exec();
}

export async function updateSellerCompletedJobs(
    data: IOrderMessage
): Promise<void> {
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
}

export async function updateSellerReview(
    data: IReviewMessageDetails
): Promise<void> {
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
}
