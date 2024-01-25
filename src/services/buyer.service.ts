import { IBuyerDocument } from "@Akihira77/jobber-shared";
import { BuyerModel } from "@users/models/buyer.model";

export async function getBuyerByEmail(
    email: string
): Promise<IBuyerDocument | null> {
    const result = await BuyerModel.findOne({ email }).exec();

    return result;
}

export async function getBuyerByUsername(
    username: string
): Promise<IBuyerDocument | null> {
    const result = await BuyerModel.findOne({ username }).exec();

    return result;
}

export async function getRandomBuyers(size: number): Promise<IBuyerDocument[]> {
    const result = await BuyerModel.aggregate([
        {
            $sample: {
                size
            }
        }
    ]);

    return result;
}

export async function createBuyer(buyerData: IBuyerDocument): Promise<void> {
    const existingBuyer = await getBuyerByEmail(`${buyerData.email}`);

    if (!existingBuyer) {
        await BuyerModel.create(buyerData);
    }
}

export async function updateBuyerIsSellerProp(email: string): Promise<void> {
    await BuyerModel.updateOne(
        {
            email
        },
        {
            $set: { isSeller: true }
        }
    ).exec();
}

export async function updateBuyerPurchasedGigsProp(
    buyerId: string,
    purchasedGigsId: string,
    type: string
): Promise<void> {
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
}
