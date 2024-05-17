import { logger, RABBITMQ_ENDPOINT } from "@users/config";
import client, { Connection, Channel } from "amqplib";

export async function createConnection(): Promise<Channel> {
    try {
        const connection: Connection = await client.connect(
            `${RABBITMQ_ENDPOINT}`
        );
        const channel: Channel = await connection.createChannel();
        logger("queues/connection.ts - createConnection()").info(
            "UsersService connected to RabbitMQ successfully..."
        );
        closeConnection(channel, connection);

        return channel;
    } catch (error) {
        logger("queues/connection.ts - createConnection()").error(
            "UsersService createConnection() method error:",
            error
        );
        process.exit(1);
    }
}

function closeConnection(channel: Channel, connection: Connection): void {
    process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
    });
}
