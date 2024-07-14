import { IAuthPayload, IBuyerDocument } from "@Akihira77/jobber-shared"
import { BuyerService } from "@users/services/buyer.service"

export class BuyerHandler {
    constructor(private buyerService: BuyerService) {}

    getBuyerByEmail(currUser: IAuthPayload): Promise<IBuyerDocument | null> {
        return this.buyerService.getBuyerByEmail(currUser.email)
    }

    getCurrentBuyer(currUser: IAuthPayload): Promise<IBuyerDocument | null> {
        return this.buyerService.getBuyerByUsername(currUser.username)
    }

    getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
        return this.buyerService.getBuyerByUsername(username)
    }
}
