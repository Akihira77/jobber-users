"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomEducations = exports.randomExperiences = exports.populateSeller = exports.updateSeller = exports.getRandomSellers = exports.getSellerByUsername = exports.getSellerById = exports.createSeller = void 0;
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const faker_1 = require("@faker-js/faker");
const seller_schema_1 = require("../schemas/seller.schema");
const sellerService = __importStar(require("../services/seller.service"));
const buyerService = __importStar(require("../services/buyer.service"));
const http_status_codes_1 = require("http-status-codes");
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
function createSeller(req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = seller_schema_1.sellerSchema.validate(req.body);
        if (error === null || error === void 0 ? void 0 : error.details) {
            throw new jobber_shared_1.BadRequestError(error.details[0].message, "Create seller() method error");
        }
        const existedSeller = (_b = (yield sellerService.getSellerByEmail((_a = req.body.email) !== null && _a !== void 0 ? _a : ""))) !== null && _b !== void 0 ? _b : (yield sellerService.getSellerByUsername((_c = req.body.username) !== null && _c !== void 0 ? _c : ""));
        if (existedSeller) {
            throw new jobber_shared_1.BadRequestError("Seller already exist. Go to your account page to update", "Create seller() method error");
        }
        const sellerData = {
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
        const createdSeller = yield sellerService.createSeller(sellerData);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Seller created successfully.",
            seller: createdSeller
        });
    });
}
exports.createSeller = createSeller;
function getSellerById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const seller = yield sellerService.getSellerById(req.params.sellerId);
        res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Seller profile", seller });
    });
}
exports.getSellerById = getSellerById;
function getSellerByUsername(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const seller = yield sellerService.getSellerByUsername(req.params.username);
        res.status(http_status_codes_1.StatusCodes.OK).json({ message: "Seller profile", seller });
    });
}
exports.getSellerByUsername = getSellerByUsername;
function getRandomSellers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const sellers = yield sellerService.getRandomSellers(parseInt(req.params.count));
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Random sellers profile",
            sellers
        });
    });
}
exports.getRandomSellers = getRandomSellers;
function updateSeller(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const existedSeller = yield sellerService.getSellerById(req.params.sellerId);
        if (!existedSeller) {
            throw new jobber_shared_1.BadRequestError("Seller is not found", "Update seller() method");
        }
        const { error } = seller_schema_1.sellerSchema.validate(req.body);
        if (error === null || error === void 0 ? void 0 : error.details) {
            throw new jobber_shared_1.BadRequestError(error.details[0].message, "Update seller() method error");
        }
        const sellerData = {
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
        const updatedSeller = yield sellerService.updateSeller(req.params.sellerId, sellerData);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Seller updated successfully.",
            seller: updatedSeller
        });
    });
}
exports.updateSeller = updateSeller;
function populateSeller(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { count } = req.params;
        const buyers = yield buyerService.getRandomBuyers(parseInt(count));
        for (let i = 0; i < buyers.length; i++) {
            const buyer = buyers[i];
            const existedSeller = yield sellerService.getSellerByEmail(buyer.email);
            if (existedSeller) {
                throw new jobber_shared_1.BadRequestError("Seller already exist.", "SellerSeed seller() method error");
            }
            const basicDescription = faker_1.faker.commerce.productDescription();
            const skills = [
                "Programming",
                "Web development",
                "Mobile development",
                "Proof reading",
                "UI/UX",
                "Data Science",
                "Financial modeling",
                "Data analysis"
            ];
            const sellerData = {
                profilePublicId: (0, uuid_1.v4)(),
                fullName: faker_1.faker.person.fullName(),
                username: buyer.username,
                email: buyer.email,
                country: faker_1.faker.location.country(),
                profilePicture: buyer.profilePicture,
                description: basicDescription.length <= 250
                    ? basicDescription
                    : basicDescription.slice(0, 250),
                oneliner: faker_1.faker.word.words({ count: { min: 5, max: 10 } }),
                skills: (0, lodash_1.sampleSize)(skills, (0, lodash_1.sample)([1, 4])),
                languages: [
                    { language: "English", level: "Native" },
                    { language: "Indonesia", level: "Native" },
                    { language: "Japan", level: "Native" }
                ],
                responseTime: parseInt(faker_1.faker.commerce.price({ min: 1, max: 5, dec: 0 })),
                experience: randomExperiences(parseInt(faker_1.faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
                education: randomEducations(parseInt(faker_1.faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
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
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "Sellers created successfully",
            total: count
        });
    });
}
exports.populateSeller = populateSeller;
function randomExperiences(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025];
        const randomEndYear = ["Present", "2024", "2025", "2026", "2027"];
        const endYear = randomEndYear[(0, lodash_1.floor)((0, lodash_1.random)(0.9) * randomEndYear.length)];
        const experience = {
            company: faker_1.faker.company.name(),
            title: faker_1.faker.person.jobTitle(),
            startDate: `${faker_1.faker.date.month()} ${randomStartYear[(0, lodash_1.floor)((0, lodash_1.random)(0.9) * randomStartYear.length)]}`,
            endDate: endYear === "Present"
                ? "Present"
                : `${faker_1.faker.date.month()} ${endYear}`,
            description: faker_1.faker.commerce.productDescription().slice(0, 100),
            currentlyWorkingHere: endYear === "Present"
        };
        result.push(experience);
    }
    return result;
}
exports.randomExperiences = randomExperiences;
function randomEducations(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        const randomYear = [2020, 2021, 2022, 2023, 2024, 2025];
        const education = {
            country: faker_1.faker.location.country(),
            university: faker_1.faker.person.jobTitle(),
            title: faker_1.faker.person.jobTitle(),
            major: `${faker_1.faker.person.jobArea()} ${faker_1.faker.person.jobDescriptor()}`,
            year: `${randomYear[(0, lodash_1.floor)((0, lodash_1.random)(0.9) * randomYear.length)]}`
        };
        result.push(education);
    }
    return result;
}
exports.randomEducations = randomEducations;
//# sourceMappingURL=seller.controller.js.map