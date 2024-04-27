import { IBuyerDocument, winstonLogger } from "@Akihira77/jobber-shared";
import { ELASTIC_SEARCH_URL } from "@users/config";
import { BuyerModel } from "@users/models/buyer.model";
import { Logger } from "winston";

const logger: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "buyerService",
    "debug"
);

export async function getBuyerByEmail(
    email: string
): Promise<IBuyerDocument | null> {
    try {
        return await BuyerModel.findOne({ email }).lean().exec();
    } catch (error) {
        logger.error("UsersService getBuyerByEmail() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function getBuyerByUsername(
    username: string
): Promise<IBuyerDocument | null> {
    try {
        return await BuyerModel.findOne({ username }).lean().exec();
    } catch (error) {
        logger.error("UsersService getBuyerByUsername() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function getRandomBuyers(size: number): Promise<IBuyerDocument[]> {
    try {
        return await BuyerModel.aggregate([
            {
                $sample: {
                    size
                }
            }
        ]);
    } catch (error) {
        logger.error("UsersService getRandomBuyers() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function createBuyer(buyerData: IBuyerDocument): Promise<void> {
    try {
        const existingBuyer =
            (await getBuyerByEmail(buyerData.email ?? "")) ??
            (await getBuyerByUsername(buyerData.username ?? ""));

        if (!existingBuyer) {
            await BuyerModel.create(buyerData);
        }
    } catch (error) {
        logger.error("UsersService createBuyer() method error", error);
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateBuyerIsSellerProp(email: string): Promise<void> {
    try {
        await BuyerModel.updateOne(
            {
                email
            },
            {
                $set: { isSeller: true }
            }
        ).exec();
    } catch (error) {
        logger.error(
            "UsersService updateBuyerIsSellerProp() method error",
            error
        );
        throw new Error("Unexpected error occured. Please try again.");
    }
}

export async function updateBuyerPurchasedGigsProp(
    buyerId: string,
    purchasedGigsId: string,
    type: string
): Promise<void> {
    try {
        await BuyerModel.updateOne(
            {
                _id: buyerId
            },
            type === "purchased-gigs"
                ? {
                      $push: {
                          purchasedGigs: purchasedGigsId
                      }
                  }
                : {
                      $pull: {
                          purchasedGigs: purchasedGigsId
                      }
                  }
        ).exec();
    } catch (error) {
        logger.error(
            "UsersService updateBuyerPurchasedGigsProp() method error",
            error
        );
        throw new Error("Unexpected error occured. Please try again.");
    }
}
