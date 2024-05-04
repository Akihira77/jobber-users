import { databaseConnection } from "@users/database"
import { getRandomSellers } from "@users/services/seller.service";

describe("Read / Get Buyer", () => {
    beforeAll(async () => {
        await databaseConnection();
    })

    describe("getRandomBuyers() method", () => {
        it("return some buyers", async () => {
            const result = await getRandomSellers(5);

            expect(result).not.toBeNull();
            expect(result.length).toBe(5);
        })
    })
})
