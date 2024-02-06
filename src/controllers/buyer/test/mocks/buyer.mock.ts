import { IAuthPayload, IBuyerDocument } from "@Akihira77/jobber-shared";
import { Response } from "express";

export const buyerMockRequest = (
    sessionData: IJWT,
    currentUser?: IAuthPayload | null,
    params?: IParams
) => {
    return {
        session: sessionData,
        params,
        currentUser
    };
};

export const buyerMockResponse = (): Response => {
    const res: Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

export interface IJWT {
    jwt?: string;
}

export interface IParams {
    username?: string;
}

export const authUserPayload: IAuthPayload = {
    id: 1,
    username: "Dika",
    email: "dika@test.com",
    iat: 12312321
};

export const buyerMock: IBuyerDocument = {
    _id: "1237129832171231aw",
    username: "Andika",
    email: "andika@test.com",
    country: "Indonesia",
    profilePicture: "",
    isSeller: false,
    purchasedGigs: [],
    createdAt: new Date()
};
