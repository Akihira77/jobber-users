import {
    getRandomSellers,
    getSellerById,
    getSellerByUsername
} from "@users/services/seller.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function byId(req: Request, res: Response): Promise<void> {
    const seller = await getSellerById(req.params.sellerId);

    res.status(StatusCodes.OK).json({ message: "Seller profile", seller });
}

export async function byUsername(req: Request, res: Response): Promise<void> {
    const seller = await getSellerByUsername(req.params.username);

    res.status(StatusCodes.OK).json({ message: "Seller profile", seller });
}

export async function randomSellers(
    req: Request,
    res: Response
): Promise<void> {
    const sellers = await getRandomSellers(parseInt(req.params.count));

    res.status(StatusCodes.OK).json({
        message: "Random sellers profile",
        sellers
    });
}
