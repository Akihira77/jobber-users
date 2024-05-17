import { databaseConnection } from "@users/database";
import { getRandomBuyers } from "@users/services/buyer.service";

describe("Read / Get Buyer", () => {
    beforeAll(async () => {
        await databaseConnection();
    });

    describe("getRandomBuyers() method", () => {
        it("return some buyers", async () => {
            const result = await getRandomBuyers(5);

            expect(result).not.toBeNull();
            expect(result.length).toBe(5);
        });
    });
});
