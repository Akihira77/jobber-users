import { winstonLogger } from "@Akihira77/jobber-shared"
import { ELASTIC_SEARCH_URL } from "@users/config"
import { databaseConnection } from "@users/database"
import { UsersService } from "@users/services/users.service"
import { Logger } from "winston"

let usersService: UsersService
let db: any
beforeAll(async () => {
    const logger = (moduleName?: string): Logger =>
        winstonLogger(
            `${ELASTIC_SEARCH_URL}`,
            moduleName ?? "Users Service",
            "debug"
        )
    db = await databaseConnection()
    usersService = new UsersService(logger)
})

afterAll(async () => {
    db.connection.close()
})

describe("buyer.service.ts - getRandomBuyers() method", () => {
    it("Should return random buyers account from database", async () => {
        const accountsFromDb =
            await usersService.buyerService.getRandomBuyers(5)

        expect(accountsFromDb.length).toBe(5)

        for (let i = 0; i < accountsFromDb.length; i++) {
            const buyerAccount = accountsFromDb[i]
            const buyerFromDb = await usersService.buyerService.getBuyerByEmail(
                buyerAccount.email!
            )
            expect(buyerFromDb).toEqual(buyerAccount)
        }
    })
})

describe("seller.service.ts - getRandomSellers() method", () => {
    it("Should return random sellers account from database", async () => {
        const accountsFromDb =
            await usersService.sellerService.getRandomSellers(5)

        expect(accountsFromDb.length).toBe(5)

        for (let i = 0; i < accountsFromDb.length; i++) {
            const sellerAccount = accountsFromDb[i]
            const sellerFromDb =
                await usersService.sellerService.getSellerByEmail(
                    sellerAccount.email!
                )
            expect(sellerFromDb).toEqual(sellerAccount)
        }
    })
})
