import { IBuyerDocument, winstonLogger } from "@Akihira77/jobber-shared";
import {
    ELASTIC_SEARCH_URL,
    buyerServiceExchangeNamesAndRoutingKeys,
    gigServiceExchangeNamesAndRoutingKeys,
    reviewServiceExchangeNamesAndRoutingKeys
} from "@users/config";
import { Channel, ConsumeMessage } from "amqplib";
import { Logger } from "winston";
import { createConnection } from "@users/queues/connection";
import {
    createBuyer,
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
            channel = (await createConnection()) as Channel;
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
            async (message: ConsumeMessage | null) => {
                const { type } = JSON.parse(message!.content.toString());

                if (type === "auth") {
                    const {
                        username,
                        email,
                        profilePicture,
                        country,
                        createdAt
                    } = JSON.parse(message!.content.toString());
                    const buyerData: IBuyerDocument = {
                        username,
                        email,
                        profilePicture,
                        country,
                        purchasedGigs: [],
                        createdAt
                    };

                    await createBuyer(buyerData);
                } else {
                    const { buyerId, purchasedGigs } = JSON.parse(
                        message!.content.toString()
                    );

                    await updateBuyerPurchasedGigsProp(
                        buyerId,
                        purchasedGigs,
                        type
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

export async function consumeSellerDirectMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
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
            async (message: ConsumeMessage | null) => {
                const {
                    type,
                    sellerId,
                    ongoingJobs,
                    completedJobs,
                    totalEarnings,
                    recentDelivery,
                    gigSellerId,
                    count
                } = JSON.parse(message!.content.toString());

                if (type === "create-order") {
                    await updateSellerOngoingJobsProp(sellerId, ongoingJobs);
                } else if (type === "approve-order") {
                    await updateSellerCompletedJobs({
                        sellerId,
                        ongoingJobs,
                        completedJobs,
                        totalEarnings,
                        recentDelivery
                    });
                } else if (type === "update-gig-count") {
                    await updateTotalGigCount(`${gigSellerId}`, count);
                } else if (type === "cancel-order") {
                    await updateSellerCancelJobsProp(sellerId);
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

export async function consumeReviewFanoutMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
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
            async (message: ConsumeMessage | null) => {
                const { type } = JSON.parse(message!.content.toString());

                if (type === "buyer-review") {
                    const gig = gigServiceExchangeNamesAndRoutingKeys.updateGig;
                    const parsedData = JSON.parse(message!.content.toString());

                    await updateSellerReview(parsedData);
                    await publishDirectMessage(
                        channel,
                        gig.exchangeName,
                        gig.routingKey,
                        JSON.stringify({
                            type: "updateGig",
                            gigReview: message!.content.toString()
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

export async function consumeSeedGigDirectMessages(
    channel: Channel
): Promise<void> {
    try {
        if (!channel) {
            channel = (await createConnection()) as Channel;
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
