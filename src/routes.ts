import { verifyGatewayRequest } from "@Akihira77/jobber-shared";
import { Application } from "express";

const BUYER_BASE_PATH = "api/v1/buyer";
const SELLER_BASE_PATH = "api/v1/seller";

export function appRoutes(app: Application): void {
    app.use("", () => console.log("Ok"));
    app.use(BUYER_BASE_PATH, verifyGatewayRequest, () => console.log("Buyer"));
    app.use(SELLER_BASE_PATH, verifyGatewayRequest, () =>
        console.log("Seller")
    );
}
