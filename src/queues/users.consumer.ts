import { IBuyerDocument, winstonLogger } from "@Akihira77/jobber-shared";
import {
    ELASTIC_SEARCH_URL,
    buyerServiceExchangeNamesAndRoutingKeys,
    chatServiceExchangeNamesAndRoutingKeys,
    gigServiceExchangeNamesAndRoutingKeys,
    reviewServiceExchangeNamesAndRoutingKeys
} from "@users/config";
import { Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";
import { createConnection } from "@users/queues/connection";
import {
    createBuyer,
    getBuyerByUsername,
    updateBuyerPurchasedGigsProp
} from "@users/services/buyer.service";
import {
    getRandomSellers,
    updateSellerCancelJobsProp,
    updateSellerCompletedJobs,
    updateSellerOngoingJobsProp,
    updateSellerReview,
    updateTotalGigCount
} from "@users/services/seller.service";
import { publishDirectMessage } from "./users.producer";
import { authBuyerSchema } from "@users/schemas/consumeBuyer.schema";

const log: Logger = winstonLogger(
    `${ELASTIC_SEARCH_URL}`,
    "usersServiceConsumer",
    "debug"
);

export async function consumeBuyerDirectMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { exchangeName, routingKey } =
            buyerServiceExchangeNamesAndRoutingKeys.buyer;
        const queueName = "user-buyer-queue";

        await channel.assertExchange(exchangeName, "direct");

        // if queue not exist it will create new
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });

        // create path between exchange and queue using routingKey
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                try {
                    const { type } = JSON.parse(msg!.content.toString());

                    if (type === "auth") {
                        const {
                            username,
                            email,
                            profilePicture,
                            country,
                            createdAt
                        } = JSON.parse(msg!.content.toString());

                        const validationError = authBuyerSchema.validate(msg?.content).error
                        if (validationError) {
                            throw new Error(validationError.details[0].message);
                        }

                        const buyerData: IBuyerDocument = {
                            username,
                            email,
                            profilePicture,
                            country,
                            purchasedGigs: [],
                            createdAt
                        };

                        await createBuyer(buyerData);
                        channel.ack(msg!);
                        return;
                    } else if (["cancel-order", "purchased-gigs"].includes(type)) {
                        const { buyerId, purchasedGigs } = JSON.parse(
                            msg!.content.toString()
                        );

                        if (!(buyerId || purchasedGigs)) {
                            throw new Error("required field is null")
                        }

                        await updateBuyerPurchasedGigsProp(
                            buyerId,
                            purchasedGigs,
                            type
                        );
                        channel.ack(msg!);
                        return;
                    }

                    channel.reject(msg!, false);
                } catch (error) {
                    channel.reject(msg!, false);

                    log.error(
                        "consuming message got errors. consumeBuyerDirectMessages() error",
                        error
                    );
                }
            }
        );
    } catch (error) {
        log.error(
            "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
            error
        );
    }
}

export async function consumeSellerDirectMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { exchangeName, routingKey } =
            buyerServiceExchangeNamesAndRoutingKeys.seller;
        const queueName = "user-seller-queue";

        await channel.assertExchange(exchangeName, "direct");

        // if queue not exist it will create new
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });

        // create path between exchange and queue using routingKey
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                try {
                    const {
                        type,
                        sellerId
                    } = JSON.parse(msg!.content.toString());

                    if (type === "create-order") {
                        const { ongoingJobs } = JSON.parse(msg!.content.toString());
                        await updateSellerOngoingJobsProp(sellerId, ongoingJobs);
                        channel.ack(msg!);
                        return;
                    } else if (type === "approve-order") {
                        const { ongoingJobs, completedJobs, totalEarnings, recentDelivery } = JSON.parse(msg!.content.toString());
                        await updateSellerCompletedJobs({
                            sellerId,
                            ongoingJobs,
                            completedJobs,
                            totalEarnings,
                            recentDelivery
                        });
                        channel.ack(msg!);
                        return;
                    } else if (type === "update-gig-count") {
                        const { count } = JSON.parse(msg!.content.toString());
                        await updateTotalGigCount(sellerId, count);
                        channel.ack(msg!);
                        return;
                    } else if (type === "cancel-order") {
                        await updateSellerCancelJobsProp(sellerId);
                        channel.ack(msg!);
                        return;
                    }

                    channel.reject(msg!, false);
                } catch (error) {
                    channel.reject(msg!, false);

                    log.error(
                        "consuming message got errors. consumeSellerDirectMessages() error",
                        error
                    );
                }
            }
        );
    } catch (error) {
        log.error(
            "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
            error
        );
    }
}

export async function consumeReviewFanoutMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { exchangeName } =
            reviewServiceExchangeNamesAndRoutingKeys.review;
        const queueName = "seller-review-queue";

        await channel.assertExchange(exchangeName, "fanout");

        // if queue not exist it will create new
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });

        // create path between exchange and queue using routingKey
        // but this is fanout mode so just empty routingKey / dont need routingKey
        await channel.bindQueue(jobberQueue.queue, exchangeName, "");
        channel.consume(
            jobberQueue.queue,
            async (msg: ConsumeMessage | null) => {
                try {
                    const { type } = JSON.parse(msg!.content.toString());

                    if (type === "addReview") {
                        const gig = gigServiceExchangeNamesAndRoutingKeys.updateGig;
                        const parsedData = JSON.parse(msg!.content.toString());

                        if (parsedData.type === "buyer-review") {
                            await updateSellerReview(parsedData);
                            await publishDirectMessage(
                                channel,
                                gig.exchangeName,
                                gig.routingKey,
                                JSON.stringify({
                                    type: "updateGigReview",
                                    gigReview: parsedData
                                }),
                                "Message sent to gig service."
                            );
                        }
                        channel.ack(msg!);
                        return;
                    }

                    channel.reject(msg!, false);
                } catch (error) {
                    channel.reject(msg!, false);

                    log.error("consuming message got errors. consumeReviewFanoutMessages()", error)
                }
            }
        );
    } catch (error) {
        log.error(
            "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
            error
        );
    }
}

export async function consumeSeedGigDirectMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { exchangeName, routingKey } =
            gigServiceExchangeNamesAndRoutingKeys.getSellers;
        const queueName = "user-gig-queue";

        await channel.assertExchange(exchangeName, "direct");

        // if queue not exist it will create new
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });

        // create path between exchange and queue using routingKey
        await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
        channel.consume(
            jobberQueue.queue,
            async (message: ConsumeMessage | null) => {
                const { type } = JSON.parse(message!.content.toString());

                if (type === "getSellers") {
                    const { count } = JSON.parse(message!.content.toString());
                    const sellers = await getRandomSellers(parseInt(count));
                    const seed = gigServiceExchangeNamesAndRoutingKeys.seed;

                    await publishDirectMessage(
                        channel,
                        seed.exchangeName,
                        seed.routingKey,
                        JSON.stringify({
                            type: "receiveSellers",
                            sellers,
                            count
                        }),
                        "Message sent to gig service."
                    );
                }

                channel.ack(message!);
            }
        );
    } catch (error) {
        log.error(
            "UsersService QueueConsumer consumeBuyerDirectMessages() method error:",
            error
        );
    }
}

// TODO
export async function consumeChatDirectMessages(channel: Channel) {
    try {
        if (!channel) {
            channel = await createConnection();
        }

        const { checkExistingUserForConversation, responseExistingUsersForConversation } =
            chatServiceExchangeNamesAndRoutingKeys;
        const queueName = "user-chat-queue";

        await channel.assertExchange(checkExistingUserForConversation.exchangeName, "direct");

        // if queue not exist it will create new
        const jobberQueue = await channel.assertQueue(queueName, {
            durable: true,
            autoDelete: false
        });

        // create path between exchange and queue using routingKey
        await channel.bindQueue(jobberQueue.queue, checkExistingUserForConversation.exchangeName, checkExistingUserForConversation.routingKey);
        channel.consume(jobberQueue.queue, async (message: ConsumeMessage | null) => {
            const { type } = JSON.parse(message!.content.toString())
            if (type === "validate-users-conversation") {
                const { senderUsername, receiverUsername } = JSON.parse(message!.content.toString())
                const [sender, receiver] = await Promise.all([getBuyerByUsername(senderUsername), getBuyerByUsername(receiverUsername)]);

                let result = false;
                if (sender && receiver) {
                    result = true;
                }

                await publishDirectMessage(channel, responseExistingUsersForConversation.exchangeName, responseExistingUsersForConversation.routingKey, JSON.stringify({
                    type: "response-users-conversation",
                    result
                }), "Message sent to chat service");
            }

            channel.ack(message!)
        })
    } catch (error) {
        log.error(
            "UsersService QueueConsumer consumeChatDirectMessages() method error:",
            error
        );
    }
}
