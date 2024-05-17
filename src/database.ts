import { DATABASE_URL, logger } from "@users/config";
import mongoose from "mongoose";

export const databaseConnection = async (): Promise<void> => {
    try {
        await mongoose.connect(`${DATABASE_URL}`);
        logger("database.ts - databaseConnection()").info(
            "UsersService MongoDB is connected."
        );
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "UsersService databaseConnection() method error:",
            error
        );
    }
};
