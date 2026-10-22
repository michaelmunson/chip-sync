// @vitest-environment node
import { describe, expect, it } from "vitest";
import { jsonAttribute, unmarshallValue } from "./attributes";

describe("DynamoDB attribute helpers", () => {
    it("unmarshalls nested maps the way AppSync stores AWSJSON", () => {
        const attr = {
            M: {
                email: { S: "a@b.co" },
                events: { M: { newMessage: { M: { sms: { BOOL: true }, email: { BOOL: false } } } } },
                count: { N: "3" },
                list: { L: [{ S: "x" }, { NULL: true }] },
            },
        };
        expect(unmarshallValue(attr)).toEqual({
            email: "a@b.co",
            events: { newMessage: { sms: true, email: false } },
            count: 3,
            list: ["x", null],
        });
    });

    it("reads JSON text, double-encoded JSON text, and missing values", () => {
        expect(jsonAttribute({ S: '{"a":1}' })).toEqual({ a: 1 });
        expect(jsonAttribute({ S: JSON.stringify(JSON.stringify({ a: 1 })) })).toEqual({ a: 1 });
        expect(jsonAttribute({ S: "nope" })).toEqual({});
        expect(jsonAttribute(undefined)).toEqual({});
    });
});
