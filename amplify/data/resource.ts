import { defineData } from '@aws-amplify/backend';

/** Preserved Gen 1 GraphQL schema (shared DynamoDB tables after stack refactor). */
const schema = /* GraphQL */ `
  type Organization @model @auth(rules: [{ allow: private }]) {
    id: ID!
    name: String!
    tier: String!
    accessCode: String!
    location: String!
    users: [User] @hasMany
    markers: [Marker] @hasMany
  }

  type User @model @auth(rules: [{ allow: private }]) {
    id: ID!
    firstName: String!
    lastName: String!
    role: String!
    notifications: [Notification] @hasMany
    organization: Organization @belongsTo
    mapChoice: String @default(value: "apple")
    contact: AWSJSON
    markers: [GardnerMarker] @hasMany
  }

  type Marker @model @auth(rules: [{ allow: private }]) {
    id: ID!
    name: String!
    description: String
    contact: AWSJSON
    address: String!
    latitude: Float!
    longitude: Float!
    images: [String]
    type: String!
    organization: Organization @belongsTo
  }

  type Notification @model @auth(rules: [{ allow: private }]) {
    id: ID!
    timestamp: Int!
    type: String!
    data: AWSJSON
    opened: Boolean
    user: User @belongsTo
  }

  type GardnerMarker @model @auth(rules: [{ allow: private }]) {
    id: ID!
    description: String
    address: String!
    latitude: Float!
    longitude: Float!
    images: [String]
    type: String!
    user: User! @belongsTo
  }
`;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
