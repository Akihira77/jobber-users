import express from "express";
import { seller as createSeller } from "@users/controllers/seller/create";
import { seller as updateSeller } from "@users/controllers/seller/update";
import * as get from "@users/controllers/seller/get";
import * as seed from "@users/controllers/seller/seed";

const router = express.Router();

export function sellerRoutes() {
    router.get("/id/:sellerId", get.byId);
    router.get("/username/:username", get.byUsername);
    router.get("/random/:count", get.randomSellers);
    router.post("/create", createSeller);
    router.put("/seed/:count", seed.seller);
    router.put("/:sellerId", updateSeller);

    return router;
}
