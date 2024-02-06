import { BadRequestError, ISellerDocument } from "@Akihira77/jobber-shared";
import { sellerSchema } from "@users/schemas/seller.schema";
import { updateSeller } from "@users/services/seller.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function seller(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(sellerSchema.validate(req.body));

    if (error?.details) {
        throw new BadRequestError(
            error.details[0].message,
            "Update seller() method error"
        );
    }

    const sellerData: ISellerDocument = {
        fullName: req.body.fullName,
        profilePicture: req.body.profilePicture,
        description: req.body.description,
        country: req.body.country,
        skills: req.body.skills,
        languages: req.body.languages,
        profilePublicId: req.body.profilePublicId,
        oneliner: req.body.oneliner,
        responseTime: req.body.responseTime,
        experience: req.body.experience,
        education: req.body.education,
        socialLinks: req.body.socialLinks,
        certificates: req.body.certificates
    };
    const updatedSeller = await updateSeller(req.params.sellerId, sellerData);

    res.status(StatusCodes.OK).json({
        message: "Seller updated successfully.",
        seller: updatedSeller
    });
}