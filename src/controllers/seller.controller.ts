import {
    BadRequestError,
    IBuyerDocument,
    IEducation,
    IExperience,
    ISellerDocument
} from "@Akihira77/jobber-shared";
import { faker } from "@faker-js/faker";
import { sellerSchema } from "@users/schemas/seller.schema";
import * as sellerService from "@users/services/seller.service";
import * as buyerService from "@users/services/buyer.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sampleSize, sample, floor, random } from "lodash";
import { v4 as uuidv4 } from "uuid";

export async function createSeller(req: Request, res: Response): Promise<void> {
    const { error } = sellerSchema.validate(req.body);

    if (error?.details) {
        throw new BadRequestError(
            error.details[0].message,
            "Create seller() method error"
        );
    }

    const existedSeller =
        (await sellerService.getSellerByEmail(req.body.email ?? "")) ??
        (await sellerService.getSellerByUsername(req.body.username ?? ""));

    if (existedSeller) {
        throw new BadRequestError(
            "Seller already exist. Go to your account page to update",
            "Create seller() method error"
        );
    }

    const sellerData: ISellerDocument = {
        fullName: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
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
    const createdSeller = await sellerService.createSeller(sellerData);

    res.status(StatusCodes.CREATED).json({
        message: "Seller created successfully.",
        seller: createdSeller
    });
}

export async function getSellerById(
    req: Request,
    res: Response
): Promise<void> {
    const seller = await sellerService.getSellerById(req.params.sellerId);

    res.status(StatusCodes.OK).json({ message: "Seller profile", seller });
}

export async function getSellerByUsername(
    req: Request,
    res: Response
): Promise<void> {
    const seller = await sellerService.getSellerByUsername(req.params.username);

    res.status(StatusCodes.OK).json({ message: "Seller profile", seller });
}

export async function getRandomSellers(
    req: Request,
    res: Response
): Promise<void> {
    const sellers = await sellerService.getRandomSellers(
        parseInt(req.params.count)
    );

    res.status(StatusCodes.OK).json({
        message: "Random sellers profile",
        sellers
    });
}

export async function updateSeller(req: Request, res: Response): Promise<void> {
    const existedSeller = await sellerService.getSellerById(
        req.params.sellerId
    );
    if (!existedSeller) {
        throw new BadRequestError(
            "Seller is not found",
            "Update seller() method"
        );
    }

    const { error } = sellerSchema.validate(req.body);

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

    const updatedSeller = await sellerService.updateSeller(
        req.params.sellerId,
        sellerData
    );

    res.status(StatusCodes.OK).json({
        message: "Seller updated successfully.",
        seller: updatedSeller
    });
}

export async function populateSeller(
    req: Request,
    res: Response
): Promise<void> {
    const { count } = req.params;
    const buyers: IBuyerDocument[] = await buyerService.getRandomBuyers(
        parseInt(count)
    );

    for (let i = 0; i < buyers.length; i++) {
        const buyer: IBuyerDocument = buyers[i];
        const existedSeller: ISellerDocument | null =
            await sellerService.getSellerByEmail(buyer.email!);

        if (existedSeller) {
            throw new BadRequestError(
                "Seller already exist.",
                "SellerSeed seller() method error"
            );
        }

        const basicDescription: string = faker.commerce.productDescription();
        const skills: string[] = [
            "Programming",
            "Web development",
            "Mobile development",
            "Proof reading",
            "UI/UX",
            "Data Science",
            "Financial modeling",
            "Data analysis"
        ];
        const sellerData: ISellerDocument = {
            profilePublicId: uuidv4(),
            fullName: faker.person.fullName(),
            username: buyer.username,
            email: buyer.email,
            country: faker.location.country(),
            profilePicture: buyer.profilePicture,
            description:
                basicDescription.length <= 250
                    ? basicDescription
                    : basicDescription.slice(0, 250),
            oneliner: faker.word.words({ count: { min: 5, max: 10 } }),
            skills: sampleSize(skills, sample([1, 4])),
            languages: [
                { language: "English", level: "Native" },
                { language: "Indonesia", level: "Native" },
                { language: "Japan", level: "Native" }
            ],
            responseTime: parseInt(
                faker.commerce.price({ min: 1, max: 5, dec: 0 })
            ),
            experience: randomExperiences(
                parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))
            ),
            education: randomEducations(
                parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))
            ),
            socialLinks: [
                "https://facebook.com",
                "https://twitter.com",
                "https://instagram.com",
                "https://linkedin.com"
            ],
            certificates: [
                {
                    name: "Flutter App Developer",
                    from: "Flutter Academy",
                    year: 2021
                },
                {
                    name: "Android App Developer",
                    from: "2019",
                    year: 2020
                },
                {
                    name: "IOS App Developer",
                    from: "Apple Inc.",
                    year: 2019
                }
            ]
        };

        sellerService.createSeller(sellerData);
    }

    res.status(StatusCodes.CREATED).json({
        message: "Sellers created successfully",
        total: count
    });
}

export function randomExperiences(count: number): IExperience[] {
    const result: IExperience[] = [];

    for (let i = 0; i < count; i++) {
        const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025];
        const randomEndYear = ["Present", "2024", "2025", "2026", "2027"];
        const endYear =
            randomEndYear[floor(random(0.9) * randomEndYear.length)];
        const experience: IExperience = {
            company: faker.company.name(),
            title: faker.person.jobTitle(),
            startDate: `${faker.date.month()} ${randomStartYear[floor(random(0.9) * randomStartYear.length)]}`,
            endDate:
                endYear === "Present"
                    ? "Present"
                    : `${faker.date.month()} ${endYear}`,
            description: faker.commerce.productDescription().slice(0, 100),
            currentlyWorkingHere: endYear === "Present"
        };

        result.push(experience);
    }

    return result;
}

export function randomEducations(count: number): IEducation[] {
    const result: IEducation[] = [];

    for (let i = 0; i < count; i++) {
        const randomYear = [2020, 2021, 2022, 2023, 2024, 2025];
        const education: IEducation = {
            country: faker.location.country(),
            university: faker.person.jobTitle(),
            title: faker.person.jobTitle(),
            major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
            year: `${randomYear[floor(random(0.9) * randomYear.length)]}`
        };

        result.push(education);
    }

    return result;
}
