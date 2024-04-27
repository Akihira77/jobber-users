import http from "http";
import "express-async-errors";

import compression from "compression";
import jwt from "jsonwebtoken";
import {
    CustomError,
    IAuthPayload,
    IErrorResponse,
    winstonLogger
} from "@Akihira77/jobber-shared";
import { Logger } from "winston";
import {
    API_GATEWAY_URL,
    ELASTIC_SEARCH_URL,
    JWT_TOKEN,
    PORT
} from "@users/config";
import {
    Application,
    NextFunction,
    Request,
    Response,
    json,
    urlencoded
} from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { checkConnection } from "@users/elasticsearch";
import { appRoutes } from "@users/routes";
import { createConnection } from "@users/queues/connection";
import {
    consumeBuyerDirectMessages,
    consumeReviewFanoutMessages,
    consumeSeedGigDirectMessages,
    consumeSellerDirectMessages
} from "@users/queues/users.consumer";
import { Channel } from "amqplib";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "usersServer",
    "debug"
);

export function start(app: Application): void {
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app);
    startQueues();
    startElasticSearch();
    usersErrorHandler(app);
    startServer(app);
}

function securityMiddleware(app: Application): void {
    app.set("trust proxy", 1);
    app.use(hpp());
    app.use(helmet());
    app.use(
        cors({
            origin: [`${API_GATEWAY_URL}`],
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        })
    );

    app.use((req: Request, _res: Response, next: NextFunction) => {
        // console.log(req.headers);
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            const payload = jwt.verify(token, JWT_TOKEN!) as IAuthPayload;

            req.currentUser = payload;
        }
        next();
    });
}

function standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: "200mb" }));
    app.use(urlencoded({ extended: true, limit: "200mb" }));
}

function routesMiddleware(app: Application): void {
    appRoutes(app);
}

async function startQueues(): Promise<void> {
    const channel = (await createConnection()) as Channel;
    consumeBuyerDirectMessages(channel);
    consumeSellerDirectMessages(channel);
    consumeReviewFanoutMessages(channel);
    consumeSeedGigDirectMessages(channel);
}

function startElasticSearch(): void {
    checkConnection();
}

function usersErrorHandler(app: Application): void {
    app.use(
        (
            error: IErrorResponse,
            _req: Request,
            res: Response,
            next: NextFunction
        ) => {
            log.error(`UsersService ${error.comingFrom}:`, error);

            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        }
    );
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`Users server has started with pid ${process.pid}`);
        httpServer.listen(Number(PORT), () => {
            log.info(`Users server running on port ${PORT}`);
        });
    } catch (error) {
        log.error("UsersService startServer() method error:", error);
    }
}
