import { DATABASE_URL } from "@users/config";
import mongoose, { Mongoose } from "mongoose";
import { Logger } from "winston";

export const databaseConnection = async (
    logger: (moduleName: string) => Logger
): Promise<Mongoose> => {
    try {
        const db = await mongoose.connect(`${DATABASE_URL}`);
        return db;
    } catch (error) {
        logger("database.ts - databaseConnection()").error(
            "UsersService databaseConnection() method error:",
            error
        );
        throw error;
    }
};
