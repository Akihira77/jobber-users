import {
    getBuyerByEmail,
    getBuyerByUsername
} from "@users/services/buyer.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function byEmail(req: Request, res: Response): Promise<void> {
    const buyer = await getBuyerByEmail(req.currentUser!.email);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}

export async function byCurrentUsername(
    req: Request,
    res: Response
): Promise<void> {
    const buyer = await getBuyerByUsername(req.currentUser!.username);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}

export async function byUsername(req: Request, res: Response): Promise<void> {
    const buyer = await getBuyerByUsername(req.params.username);

    res.status(StatusCodes.OK).json({ message: "Buyer profile", buyer });
}
