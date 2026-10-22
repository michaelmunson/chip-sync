import type { AttributeValue } from "@aws-sdk/client-dynamodb";

/** Converts a DynamoDB attribute value into a plain JS value. */
export function unmarshallValue(attr: AttributeValue | undefined): unknown {
    if (!attr) return undefined;
    if ("S" in attr) return attr.S;
    if ("N" in attr) return Number(attr.N);
    if ("BOOL" in attr) return attr.BOOL;
    if ("NULL" in attr) return null;
    if ("SS" in attr) return attr.SS;
    if ("NS" in attr) return attr.NS?.map(Number);
    if ("L" in attr) return attr.L?.map(unmarshallValue);
    if ("M" in attr) {
        return Object.fromEntries(Object.entries(attr.M ?? {}).map(([key, value]) => [key, unmarshallValue(value)]));
    }
    return undefined;
}

/**
 * Reads an AWSJSON field. AppSync stores these as native DynamoDB maps, but older rows (or
 * values written another way) can be JSON strings, so accept both.
 */
export function jsonAttribute(attr: AttributeValue | undefined): Record<string, any> {
    let value = unmarshallValue(attr);
    for (let i = 0; i < 2 && typeof value === "string"; i++) {
        try {
            value = JSON.parse(value);
        } catch {
            return {};
        }
    }
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}
