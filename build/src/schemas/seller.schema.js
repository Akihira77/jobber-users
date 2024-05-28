"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sellerSchema = joi_1.default.object().keys({
    _id: joi_1.default.string().optional(),
    id: joi_1.default.string().optional(),
    fullName: joi_1.default.string().required().messages({
        "string.base": "Fullname must be of type string",
        "string.empty": "Fullname is required",
        "any.required": "Fullname is required"
    }),
    username: joi_1.default.string().required(),
    email: joi_1.default.string().required().email(),
    profilePublicId: joi_1.default.string().optional().allow(null, ""),
    profilePicture: joi_1.default.string().required().messages({
        "string.base": "Please add a profile picture",
        "string.empty": "Profile picture is required",
        "any.required": "Profile picture is required"
    }),
    description: joi_1.default.string().required().messages({
        "string.base": "Please add a seller description",
        "string.empty": "Seller description is required",
        "any.required": "Seller description is required"
    }),
    country: joi_1.default.string().required().messages({
        "string.base": "Please select a country",
        "string.empty": "Country field is required",
        "any.required": "Country field is required"
    }),
    oneliner: joi_1.default.string().required().messages({
        "string.base": "Please add your oneliner",
        "string.empty": "Oneliner field is required",
        "any.required": "Oneliner field is required"
    }),
    skills: joi_1.default.array().items(joi_1.default.string()).required().min(1).messages({
        "string.base": "Please add at least one skill",
        "string.empty": "Skills are required",
        "any.required": "Skills are required",
        "array.min": "Please add at least one skill"
    }),
    languages: joi_1.default.array()
        .items(joi_1.default.object({
        _id: joi_1.default.string().optional(),
        language: joi_1.default.string(),
        level: joi_1.default.string()
    }))
        .required()
        .min(1)
        .messages({
        "string.base": "Please add at least one language",
        "string.empty": "Languages are required",
        "any.required": "Languages are required",
        "array.min": "Please add at least one language"
    }),
    responseTime: joi_1.default.number().required().greater(0).messages({
        "string.base": "Please add a response time",
        "string.empty": "Response time is required",
        "any.required": "Response time is required",
        "number.greater": "Response time must be greater than zero"
    }),
    experience: joi_1.default.array()
        .items(joi_1.default.object({
        _id: joi_1.default.string().optional(),
        company: joi_1.default.string(),
        title: joi_1.default.string(),
        startDate: joi_1.default.string(),
        endDate: joi_1.default.string(),
        description: joi_1.default.string(),
        currentlyWorkingHere: joi_1.default.boolean()
    }))
        .required()
        .min(1)
        .messages({
        "string.base": "Please add at least one work experience",
        "string.empty": "Experience is required",
        "any.required": "Experience is required",
        "array.min": "Please add at least one work experience"
    }),
    education: joi_1.default.array()
        .items(joi_1.default.object({
        _id: joi_1.default.string().optional(),
        country: joi_1.default.string(),
        university: joi_1.default.string(),
        title: joi_1.default.string(),
        major: joi_1.default.string(),
        year: joi_1.default.string()
    }))
        .required()
        .min(1)
        .messages({
        "string.base": "Please add at least one education",
        "string.empty": "Education is required",
        "any.required": "Education is required",
        "array.min": "Please add at least one education"
    }),
    socialLinks: joi_1.default.array().optional().allow(null, ""),
    certificates: joi_1.default.array()
        .items(joi_1.default.object({
        _id: joi_1.default.string().optional(),
        name: joi_1.default.string(),
        from: joi_1.default.string(),
        year: joi_1.default.number()
    }))
        .optional()
        .allow(null, ""),
    ratingsCount: joi_1.default.number().optional(),
    ratingCategories: joi_1.default.object({
        five: { value: joi_1.default.number(), count: joi_1.default.number() },
        four: { value: joi_1.default.number(), count: joi_1.default.number() },
        three: { value: joi_1.default.number(), count: joi_1.default.number() },
        two: { value: joi_1.default.number(), count: joi_1.default.number() },
        one: { value: joi_1.default.number(), count: joi_1.default.number() }
    }).optional(),
    ratingSum: joi_1.default.number().optional(),
    recentDelivery: joi_1.default.string().optional().allow(null, ""),
    ongoingJobs: joi_1.default.number().optional(),
    completedJobs: joi_1.default.number().optional(),
    cancelledJobs: joi_1.default.number().optional(),
    totalEarnings: joi_1.default.number().optional(),
    totalGigs: joi_1.default.number().optional(),
    createdAt: joi_1.default.string().optional()
});
//# sourceMappingURL=seller.schema.js.map