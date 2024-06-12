import { DATABASE_URL } from "@users/config"
import mongoose, { Mongoose } from "mongoose"

export const databaseConnection = async (): Promise<Mongoose> => {
    const db = await mongoose.connect(`${DATABASE_URL}`)
    return db
}
