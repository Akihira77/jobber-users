import {
    BadRequestError,
    IBuyerDocument,
    IEducation,
    IExperience,
    ISellerDocument,
    NotFoundError
} from "@Akihira77/jobber-shared"
import { faker } from "@faker-js/faker"
import { sellerSchema } from "@users/schemas/seller.schema"
import { BuyerService } from "@users/services/buyer.service"
import { SellerService } from "@users/services/seller.service"
import { sampleSize, sample, floor, random } from "lodash"
import { v4 as uuidv4 } from "uuid"

export class SellerHandler {
    constructor(
        private sellerService: SellerService,
        private buyerService: BuyerService
    ) {}

    async createSeller(reqBody: any): Promise<ISellerDocument> {
        const { error, value } = sellerSchema.validate(reqBody)

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Create seller() method error"
            )
        }

        const existedSeller =
            (await this.sellerService.getSellerByEmail(value.email ?? "")) ??
            (await this.sellerService.getSellerByUsername(value.username ?? ""))

        if (existedSeller) {
            throw new BadRequestError(
                "Seller already exist. Go to your account page to update",
                "Create seller() method error"
            )
        }

        const sellerData: ISellerDocument = {
            fullName: value.fullName,
            username: value.username,
            email: value.email,
            profilePicture: value.profilePicture,
            description: value.description,
            country: value.country,
            skills: value.skills,
            languages: value.languages,
            profilePublicId: value.profilePublicId,
            oneliner: value.oneliner,
            responseTime: value.responseTime,
            experience: value.experience,
            education: value.education,
            socialLinks: value.socialLinks,
            certificates: value.certificates
        }
        const createdSeller = await this.sellerService.createSeller(sellerData)

        return createdSeller
    }

    async getSellerById(sellerId: string): Promise<ISellerDocument | null> {
        const seller = await this.sellerService.getSellerById(sellerId)

        return seller
    }

    async getSellerByUsername(
        username: string
    ): Promise<ISellerDocument | null> {
        const seller = await this.sellerService.getSellerByUsername(username)

        return seller
    }

    async getRandomSellers(count: number): Promise<ISellerDocument[]> {
        const sellers = await this.sellerService.getRandomSellers(count)

        return sellers
    }

    async updateSeller(
        sellerId: string,
        reqBody: any
    ): Promise<ISellerDocument | null> {
        const existedSeller = await this.sellerService.getSellerById(sellerId)
        if (!existedSeller) {
            throw new NotFoundError(
                "Seller account did not found.",
                "Update seller() method"
            )
        }

        const { error, value } = sellerSchema.validate(reqBody)

        if (error?.details) {
            throw new BadRequestError(
                error.details[0].message,
                "Update seller() method error"
            )
        }

        const sellerData: ISellerDocument = {
            fullName: value.fullName,
            profilePicture: value.profilePicture,
            description: value.description,
            country: value.country,
            skills: value.skills,
            languages: value.languages,
            profilePublicId: value.profilePublicId,
            oneliner: value.oneliner,
            responseTime: value.responseTime,
            experience: value.experience,
            education: value.education,
            socialLinks: value.socialLinks,
            certificates: value.certificates
        }

        const updatedSeller = await this.sellerService.updateSeller(
            sellerId,
            sellerData
        )

        return updatedSeller
    }

    async populateSeller(count: number): Promise<void> {
        const buyers: IBuyerDocument[] =
            await this.buyerService.getRandomBuyers(count)

        for (let i = 0; i < buyers.length; i++) {
            const buyer: IBuyerDocument = buyers[i]
            const existedSeller: ISellerDocument | null =
                await this.sellerService.getSellerByEmail(buyer.email!)

            if (existedSeller) {
                throw new BadRequestError(
                    "Seller already exist.",
                    "SellerSeed seller() method error"
                )
            }

            const basicDescription: string = faker.commerce.productDescription()
            const skills: string[] = [
                "Programming",
                "Web development",
                "Mobile development",
                "Proof reading",
                "UI/UX",
                "Data Science",
                "Financial modeling",
                "Data analysis"
            ]
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
                experience: this.randomExperiences(
                    parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))
                ),
                education: this.randomEducations(
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
            }

            this.sellerService.createSeller(sellerData)
        }
    }

    randomExperiences(count: number): IExperience[] {
        const result: IExperience[] = []

        for (let i = 0; i < count; i++) {
            const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025]
            const randomEndYear = ["Present", "2024", "2025", "2026", "2027"]
            const endYear =
                randomEndYear[floor(random(0.9) * randomEndYear.length)]
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
            }

            result.push(experience)
        }

        return result
    }

    randomEducations(count: number): IEducation[] {
        const result: IEducation[] = []

        for (let i = 0; i < count; i++) {
            const randomYear = [2020, 2021, 2022, 2023, 2024, 2025]
            const education: IEducation = {
                country: faker.location.country(),
                university: faker.person.jobTitle(),
                title: faker.person.jobTitle(),
                major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
                year: `${randomYear[floor(random(0.9) * randomYear.length)]}`
            }

            result.push(education)
        }

        return result
    }
}
