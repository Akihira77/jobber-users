import { Logger } from "winston"
import jwt from "jsonwebtoken"
import { Context, Hono, Next } from "hono"
import { StatusCodes } from "http-status-codes"
import { NotAuthorizedError } from "@Akihira77/jobber-shared"

import { UsersService } from "./services/users.service"
import { BuyerHandler } from "./handler/buyer.handler"
import { SellerHandler } from "./handler/seller.handler"
import { GATEWAY_JWT_TOKEN } from "./config"

const BUYER_BASE_PATH = "/api/v1/buyer"
// const BUYER_BASE_PATH = "/buyer"
const SELLER_BASE_PATH = "/api/v1/seller"
// const SELLER_BASE_PATH = "/seller"

export function appRoutes(
    app: Hono,
    logger: (moduleName: string) => Logger
): void {
    app.get("/users-health", (c: Context) => {
        return c.text("Users service is healthy and OK.", StatusCodes.OK)
    })

    const usersSvc = new UsersService(logger)
    const buyerHndlr = new BuyerHandler(usersSvc.buyerService)
    const sellerHndlr = new SellerHandler(
        usersSvc.sellerService,
        usersSvc.buyerService
    )

    const buyerAPI = app.basePath(BUYER_BASE_PATH)
    const sellerAPI = app.basePath(SELLER_BASE_PATH)

    buyerAPI.use(verifyGatewayRequest, authOnly)
    sellerAPI.use(verifyGatewayRequest, authOnly)

    buyerRoute(buyerAPI, buyerHndlr)
    sellerRoute(sellerAPI, sellerHndlr)
    // buyerAPI.use(verifyGatewayRequest, authOnly)
    // sellerAPI.use(verifyGatewayRequest, authOnly)
}

function buyerRoute(
    api: Hono<
        Record<string, never>,
        Record<string, never>,
        typeof BUYER_BASE_PATH
    >,
    buyerHndlr: BuyerHandler
): void {
    api.get("/email", authOnly, async (c: Context) => {
        const currUser = c.get("currentUser")
        const buyer =
            await buyerHndlr.getBuyerByEmail.bind(buyerHndlr)(currUser)

        return c.json(
            { message: "Buyer profile", buyer },
            buyer ? StatusCodes.OK : StatusCodes.NOT_FOUND
        )
    })

    api.get("/username", authOnly, async (c: Context) => {
        const currUser = c.get("currentUser")
        const buyer =
            await buyerHndlr.getCurrentBuyer.bind(buyerHndlr)(currUser)

        return c.json(
            { message: "Buyer profile", buyer },
            buyer ? StatusCodes.OK : StatusCodes.NOT_FOUND
        )
    })

    api.get("/:username", async (c: Context) => {
        const username = c.req.param("username")
        const buyer =
            await buyerHndlr.getBuyerByUsername.bind(buyerHndlr)(username)

        return c.json(
            { message: "Buyer profile", buyer },
            buyer ? StatusCodes.OK : StatusCodes.NOT_FOUND
        )
    })
}

function sellerRoute(
    api: Hono<
        Record<string, never>,
        Record<string, never>,
        typeof SELLER_BASE_PATH
    >,
    sellerHndlr: SellerHandler
): void {
    api.get("/id/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId")
        const seller =
            await sellerHndlr.getSellerById.bind(sellerHndlr)(sellerId)

        return c.json(
            { message: "Seller profile", seller },
            seller ? StatusCodes.OK : StatusCodes.NOT_FOUND
        )
    })

    api.get("/username/:username", async (c: Context) => {
        const username = c.req.param("username")
        const seller =
            await sellerHndlr.getSellerByUsername.bind(sellerHndlr)(username)

        return c.json(
            { message: "Seller profile", seller },
            seller ? StatusCodes.OK : StatusCodes.NOT_FOUND
        )
    })

    api.get("/random/:count", async (c: Context) => {
        const count = c.req.param("count")
        const sellers = await sellerHndlr.getRandomSellers.bind(sellerHndlr)(
            parseInt(count, 10)
        )

        return c.json(
            {
                message: "Random sellers profile",
                sellers
            },
            StatusCodes.OK
        )
    })

    api.post("/create", async (c: Context) => {
        const jsonBody = await c.req.json()
        const seller =
            await sellerHndlr.createSeller.bind(sellerHndlr)(jsonBody)

        return c.json(
            {
                message: "Seller created successfully.",
                seller
            },
            StatusCodes.CREATED
        )
    })

    api.put("/:sellerId", async (c: Context) => {
        const sellerId = c.req.param("sellerId")
        const jsonBody = await c.req.json()
        const seller = await sellerHndlr.updateSeller.bind(sellerHndlr)(
            sellerId,
            jsonBody
        )

        return c.json(
            {
                message: "Seller updated successfully.",
                seller
            },
            StatusCodes.OK
        )
    })

    api.put("/seed/:count", (c: Context) => {
        const count = c.req.param("count")
        sellerHndlr.populateSeller.bind(sellerHndlr)(parseInt(count, 10))

        return c.json(
            {
                message: "Sellers created successfully",
                total: count
            },
            StatusCodes.CREATED
        )
    })
}

async function verifyGatewayRequest(c: Context, next: Next): Promise<void> {
    const token = c.req.header("gatewayToken")
    if (!token) {
        throw new NotAuthorizedError(
            "Invalid request",
            "verifyGatewayRequest() method: Request not coming from api gateway"
        )
    }

    try {
        const payload: { id: string; iat: number } = jwt.verify(
            token,
            GATEWAY_JWT_TOKEN!
        ) as {
            id: string
            iat: number
        }

        c.set("gatewayToken", payload)
        await next()
    } catch (error) {
        throw new NotAuthorizedError(
            "Invalid request",
            "verifyGatewayRequest() method: Request not coming from api gateway"
        )
    }
}

async function authOnly(c: Context, next: Next): Promise<void> {
    const currUser = c.get("currentUser")
    if (currUser && Object.keys(currUser).length > 0) {
        return await next()
    }

    throw new NotAuthorizedError(
        "User is not authenticated. Please signin first.",
        "routes.ts - authOnly() method"
    )
}
