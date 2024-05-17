import { Channel } from "amqplib";
import { createConnection } from "@users/queues/connection";
import { logger } from "@users/config";

export async function publishDirectMessage(
    channel: Channel,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
        }

        await channel.assertExchange(exchangeName, "direct");
        channel.publish(exchangeName, routingKey, Buffer.from(message));
        logger("queues/users.producer.ts - publishDirectMessage()").info(
            logMessage
        );
    } catch (error) {
        logger("queues/users.producer.ts - publishDirectMessage()").error(
            "UsersService QueueProducer publishDirectMessage() method error:",
            error
        );
    }
}
