import { IAuthPayload, IBuyerDocument } from "@Akihira77/jobber-shared";
import { BuyerService } from "@users/services/buyer.service";

export class BuyerHandler {
    constructor(private buyerService: BuyerService) {}

    async getBuyerByEmail(
        currUser: IAuthPayload
    ): Promise<IBuyerDocument | null> {
        const buyer = await this.buyerService.getBuyerByEmail(currUser.email);

        return buyer;
    }

    async getCurrentBuyer(
        currUser: IAuthPayload
    ): Promise<IBuyerDocument | null> {
        const buyer = await this.buyerService.getBuyerByUsername(
            currUser.username
        );

        return buyer;
    }

    async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
        const buyer = await this.buyerService.getBuyerByUsername(username);

        return buyer;
    }
}
