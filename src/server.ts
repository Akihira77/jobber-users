import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    NotAuthorizedError
} from "@Akihira77/jobber-shared";
import { API_GATEWAY_URL, JWT_TOKEN, PORT } from "@users/config";
import { appRoutes } from "@users/routes";
import { Logger } from "winston";
import { Context, Hono, Next } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { timeout } from "hono/timeout";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { rateLimiter } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";
import { StatusCode } from "hono/utils/http-status";
import { serve } from "@hono/node-server";

import { ElasticSearchClient } from "./elasticsearch";
import { UsersQueue } from "./queues/users.queue";

const LIMIT_TIMEOUT = 2 * 1000; // 2s

export async function start(
    app: Hono,
    logger: (moduleName: string) => Logger
): Promise<void> {
    await startQueues(logger);
    startElasticSearch(logger);
    usersErrorHandler(app);
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app, logger);
    startServer(app, logger);
}

function securityMiddleware(app: Hono): void {
    app.use(
        timeout(LIMIT_TIMEOUT, () => {
            return new HTTPException(StatusCodes.REQUEST_TIMEOUT, {
                message: `Request timeout after waiting ${LIMIT_TIMEOUT}ms. Please try again later.`
            });
        })
    );
    app.use(secureHeaders());
    app.use(csrf());
    app.use(
        cors({
            origin: [`${API_GATEWAY_URL}`],
            credentials: true,
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        })
    );

    app.use(async (c: Context, next: Next) => {
        if (c.req.path == "/users-health") {
            await next();
            return;
        }

        const authorization = c.req.header("authorization");
        if (!authorization || authorization === "") {
            throw new NotAuthorizedError(
                "unauthenticated request",
                "Users Service"
            );
        }

        const token = authorization.split(" ")[1];
        const payload = jwt.verify(token, JWT_TOKEN!) as IAuthPayload;

        c.set("currentUser", payload);
        await next();
    });
}

function standardMiddleware(app: Hono): void {
    app.use(compress());
    app.use(
        bodyLimit({
            maxSize: 2 * 100 * 1000 * 1024, //200mb
            onError(c: Context) {
                return c.text(
                    "Your request is too big",
                    StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE
                );
            }
        })
    );

    const generateRandomNumber = (length: number): number => {
        return (
            Math.floor(Math.random() * (9 * Math.pow(10, length - 1))) +
            Math.pow(10, length - 1)
        );
    };

    app.use(
        rateLimiter({
            windowMs: 1 * 60 * 1000, //60s
            limit: 10,
            standardHeaders: "draft-6",
            keyGenerator: () => generateRandomNumber(12).toString()
        })
    );
}

function routesMiddleware(
    app: Hono,
    logger: (moduleName: string) => Logger
): void {
    appRoutes(app, logger);
}

async function startQueues(
    logger: (moduleName: string) => Logger
): Promise<UsersQueue> {
    const queue = new UsersQueue(null, logger);
    await queue.createConnection();
    queue.consumeBuyerDirectMessages();
    queue.consumeSellerDirectMessages();
    queue.consumeReviewFanoutMessages();
    queue.consumeSeedGigDirectMessages();

    return queue;
}

async function startElasticSearch(
    logger: (moduleName: string) => Logger
): Promise<void> {
    const elastic = new ElasticSearchClient(logger);
    await elastic.checkConnection();
}

function usersErrorHandler(app: Hono): void {
    app.notFound((c) => {
        return c.text("Route path is not found", StatusCodes.NOT_FOUND);
    });

    app.onError((err: Error, c: Context) => {
        if (err instanceof CustomError) {
            return c.json(
                err.serializeErrors(),
                (err.statusCode as StatusCode) ??
                    StatusCodes.INTERNAL_SERVER_ERROR
            );
        } else if (err instanceof HTTPException) {
            return err.getResponse();
        }

        return c.text(
            "Unexpected error occured. Please try again",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    });
}

function startServer(hono: Hono, logger: (moduleName: string) => Logger): void {
    try {
        logger("server.ts - startServer()").info(
            `UsersService has started with pid ${process.pid}`
        );

        serve({ fetch: hono.fetch, port: Number(PORT) }, (info) => {
            logger("server.ts - startServer()").info(
                `UsersService running on port ${info.port}`
            );
        });
    } catch (error) {
        logger("server.ts - startServer()").error(
            "UsersService startServer() method error:",
            error
        );
    }
}
