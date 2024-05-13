import * as buyerService from "@users/services/buyer.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function getBuyerByEmail(req: Request, res: Response): Promise<void> {
    const buyer = await buyerService.getBuyerByEmail(req.currentUser!.email);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}

export async function getCurrentBuyer(
    req: Request,
    res: Response
): Promise<void> {
    const buyer = await buyerService.getBuyerByUsername(req.currentUser!.username);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}

export async function getBuyerByUsername(req: Request, res: Response): Promise<void> {
    const buyer = await buyerService.getBuyerByUsername(req.params.username);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}
