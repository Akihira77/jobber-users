import { Request } from "express";
import {
    authUserPayload,
    buyerMock,
    buyerMockRequest,
    buyerMockResponse
} from "@users/controllers/buyer/test/mocks/buyer.mock";
import * as buyer from "@users/services/buyer.service";
import * as get from "@users/controllers/buyer/get";

jest.mock("@users/services/buyer.service");
jest.mock("@Akihira77/jobber-shared");
jest.mock("@elastic/elasticsearch");

describe("Buyer Controller", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Email method", () => {
        it("Should return buyer profile data", async () => {
            const req = buyerMockRequest(
                {},
                authUserPayload
            ) as unknown as Request;
            const res = buyerMockResponse();

            jest.spyOn(buyer, "getBuyerByEmail").mockResolvedValue(buyerMock);

            await get.byEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Buyer profile",
                buyer: buyerMock
            });
        });

        it("Should return null", async () => {
            const req = buyerMockRequest(
                {},
                authUserPayload
            ) as unknown as Request;
            const res = buyerMockResponse();

            jest.spyOn(buyer, "getBuyerByEmail").mockResolvedValue(null);

            await get.byEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Buyer profile",
                buyer: null
            });
        });
    });

    describe("Username method", () => {
        it("Should return buyer profile data", async () => {
            const req = buyerMockRequest({}, authUserPayload, {
                username: "Dika"
            }) as unknown as Request;
            const res = buyerMockResponse();

            jest.spyOn(buyer, "getBuyerByUsername").mockResolvedValue(
                buyerMock
            );

            await get.byUsername(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Buyer profile",
                buyer: buyerMock
            });
        });

        it("Should return null", async () => {
            const req = buyerMockRequest({}, authUserPayload, {
                username: "Diki"
            }) as unknown as Request;
            const res = buyerMockResponse();

            jest.spyOn(buyer, "getBuyerByUsername").mockResolvedValue(null);

            await get.byUsername(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Buyer profile",
                buyer: null
            });
        });
    });

    describe("CurrentUser method", () => {
        it("Should return buyer profile data", async () => {
            const req = buyerMockRequest(
                {},
                authUserPayload
            ) as unknown as Request;
            const res = buyerMockResponse();

            jest.spyOn(buyer, "getBuyerByUsername").mockResolvedValue(
                buyerMock
            );

            await get.byCurrentUsername(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Buyer profile",
                buyer: buyerMock
            });
        });
    });
});
