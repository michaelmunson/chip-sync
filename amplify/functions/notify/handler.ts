import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import type { DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import {
    audienceForRole,
    eventForNotification,
    parseNotificationSettings,
    resolveDelivery,
    type NotificationSettings,
} from "../../../src/utils/notificationSettings";
import { jsonAttribute } from "./attributes";
import { createH2HClient, parseCredentials, type H2HClient } from "./h2h";
import { buildMessage } from "./message";

/** A user's role and notification preferences, as stored in the User table. */
export interface Recipient {
    role: string;
    settings: NotificationSettings;
}

export interface Dependencies {
    getRecipient(userId: string): Promise<Recipient | undefined>;
    h2h: H2HClient;
    appUrl: string;
}

type Image = Record<string, AttributeValue> | undefined;
const str = (image: Image, key: string) => image?.[key]?.S;

/**
 * Handles one Notification table record: when a new in-app notification maps to an
 * event the recipient turned on, sends them a text and / or email. Returns a short
 * outcome for logs (never includes phone numbers, emails or message text).
 */
export async function processRecord(record: DynamoDBRecord, deps: Dependencies): Promise<string> {
    if (record.eventName !== "INSERT") return "skipped: not an insert";
    const image = record.dynamodb?.NewImage as Image;
    const userId = str(image, "userNotificationsId");
    const type = str(image, "type");
    if (!userId || !type) return "skipped: missing user or type";

    const data = jsonAttribute(image?.data);
    const event = eventForNotification(type, data);
    if (!event) return `skipped: ${type} is not configurable`;
    // e.g. the person who added a drop site doesn't need a text about their own action.
    if (data.createdById && data.createdById === userId) return "skipped: own action";

    const recipient = await deps.getRecipient(userId);
    if (!recipient) return "skipped: unknown user";

    const delivery = resolveDelivery(recipient.settings, audienceForRole(recipient.role), event);
    if (!delivery.sms && !delivery.email) return `skipped: ${event} off`;

    const message = buildMessage(type, event, data, deps.appUrl);
    // Each channel is attempted independently so a failed text doesn't block the email.
    const results = await Promise.allSettled([
        delivery.sms ? deps.h2h.sendText(delivery.sms, message.sms) : undefined,
        delivery.email ? deps.h2h.sendEmail(delivery.email, message.subject, message.body) : undefined,
    ]);
    const labels = ["sms", "email"];
    const sent: string[] = [];
    const failed: string[] = [];
    results.forEach((result, index) => {
        if (!(index === 0 ? delivery.sms : delivery.email)) return;
        if (result.status === "fulfilled") sent.push(labels[index]);
        else {
            failed.push(labels[index]);
            console.error(`Notify: ${labels[index]} for ${event} to user ${userId} failed`, result.reason?.message ?? result.reason);
        }
    });
    return `${event}: sent [${sent.join(", ")}]${failed.length ? ` failed [${failed.join(", ")}]` : ""}`;
}

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable ${name}`);
    return value;
}

let cached: Dependencies | undefined;

function liveDependencies(): Dependencies {
    if (cached) return cached;
    const dynamo = new DynamoDBClient({});
    const secrets = new SecretsManagerClient({});
    const userTable = requiredEnv("USER_TABLE_NAME");
    const secretId = requiredEnv("H2H_SECRET_ARN");

    cached = {
        appUrl: process.env.APP_URL || "https://chipsync.co",
        h2h: createH2HClient(async () => {
            const secret = await secrets.send(new GetSecretValueCommand({ SecretId: secretId }));
            return parseCredentials(secret.SecretString);
        }),
        async getRecipient(userId) {
            const { Item } = await dynamo.send(
                new GetItemCommand({
                    TableName: userTable,
                    Key: { id: { S: userId } },
                    ProjectionExpression: "#role, notificationSettings",
                    ExpressionAttributeNames: { "#role": "role" },
                }),
            );
            if (!Item) return undefined;
            return {
                role: str(Item, "role") ?? "",
                settings: parseNotificationSettings(jsonAttribute(Item.notificationSettings)),
            };
        },
    };
    return cached;
}

/**
 * DynamoDB stream on the Notification table. The app already writes one Notification row per
 * recipient for every in-app event, so texts / emails ride on the same rows and respect the
 * user's settings (all off by default). Errors are logged, not thrown, so a bad record never
 * makes the stream retry and re-send messages that already went out.
 */
export const handler: DynamoDBStreamHandler = async (event) => {
    const deps = liveDependencies();
    for (const record of event.Records) {
        try {
            console.log("Notify:", await processRecord(record, deps));
        } catch (error) {
            console.error("Notify: record failed", (error as Error)?.message ?? error);
        }
    }
};
