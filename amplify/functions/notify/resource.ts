import { defineFunction } from "@aws-amplify/backend";

/**
 * Sends text / email notifications through the H2H API. Triggered by the Notification
 * table's DynamoDB stream (wired up in amplify/backend.ts).
 *
 * Grouped with `data` so the stream event source and table grants live in the same
 * stack as the tables (otherwise the function and data stacks reference each other).
 */
export const notify = defineFunction({
    name: "notify",
    entry: "./handler.ts",
    runtime: 22,
    timeoutSeconds: 30,
    resourceGroupName: "data",
});
