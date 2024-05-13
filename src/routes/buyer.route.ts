import express from "express";
import * as buyerController from "@users/controllers/buyer.controller";

const router = express.Router();

export function buyerRoutes() {
    router.get("/email", buyerController.getBuyerByEmail);
    router.get("/username", buyerController.getCurrentBuyer);
    router.get("/:username", buyerController.getBuyerByUsername);

    return router;
}
