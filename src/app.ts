import { databaseConnection } from "@users/database"
import { start } from "@users/server"
import cloudinary from "cloudinary"
import { winstonLogger } from "@Akihira77/jobber-shared"
import { Logger } from "winston"
import { Hono } from "hono"

import {
    CLOUD_API_KEY,
    CLOUD_API_SECRET,
    CLOUD_NAME,
    ELASTIC_SEARCH_URL
} from "./config"

const main = async (): Promise<void> => {
    const logger = (moduleName?: string): Logger =>
        winstonLogger(
            `${ELASTIC_SEARCH_URL}`,
            moduleName ?? "Users Service",
            "debug"
        )
    try {
        cloudinary.v2.config({
            cloud_name: CLOUD_NAME,
            api_key: CLOUD_API_KEY,
            api_secret: CLOUD_API_SECRET
        })
        const db = await databaseConnection()
        logger("app.ts - main()").info("UsersService MongoDB is connected.")
        const app = new Hono()
        start(app, logger)

        process.once("exit", async () => {
            await db.connection.close()
        })
    } catch (error) {
        logger("app.ts - main()").error(error)
        process.exit(1)
    }
}

main()
