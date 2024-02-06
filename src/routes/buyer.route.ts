import express from "express";
import * as get from "@users/controllers/buyer/get";

const router = express.Router();

export function buyerRoutes() {
    router.get("/email", get.byEmail);
    router.get("/username", get.byCurrentUsername);
    router.get("/:username", get.byUsername);

    return router;
}
