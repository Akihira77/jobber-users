import express from "express";
import * as sellerController from "@users/controllers/seller.controller"

const router = express.Router();

export function sellerRoutes() {
    router.get("/id/:sellerId", sellerController.getSellerById);
    router.get("/username/:username", sellerController.getSellerByUsername);
    router.get("/random/:count", sellerController.getRandomSellers);
    router.post("/create", sellerController.createSeller);
    router.put("/seed/:count", sellerController.populateSeller);
    router.put("/:sellerId", sellerController.updateSeller);

    return router;
}
