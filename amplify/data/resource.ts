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

  # A gardener's pin on the map asking crews for a service. Only the gardener
  # who posted it can change it; every signed-in crew can read it.
  type ServiceRequest
    @model
    @auth(rules: [{ allow: owner }, { allow: private, operations: [read] }]) {
    id: ID!
    userId: ID!
      @index(name: "byUser", sortKeyFields: ["createdAt"], queryField: "serviceRequestsByUser")
    requesterName: String!
    status: String!
      @index(name: "byStatus", sortKeyFields: ["createdAt"], queryField: "serviceRequestsByStatus")
    services: [String!]!
    description: String
    address: String!
    latitude: Float!
    longitude: Float!
    images: [String]
    timing: String!
    preferredDate: AWSDate
    contact: AWSJSON
    acceptedOfferId: ID
    acceptedOrganizationId: ID
      @index(
        name: "byAcceptedOrganization"
        sortKeyFields: ["createdAt"]
        queryField: "serviceRequestsByAcceptedOrganization"
      )
    closedAt: AWSDateTime
    createdAt: AWSDateTime!
  }

  type Offer @model @auth(rules: [{ allow: private }]) {
    id: ID!
    serviceRequestId: ID!
      @index(name: "byServiceRequest", sortKeyFields: ["createdAt"], queryField: "offersByServiceRequest")
    organizationId: ID!
      @index(name: "byOrganization", sortKeyFields: ["createdAt"], queryField: "offersByOrganization")
    organizationName: String!
    createdById: ID!
    createdByName: String
    pricing: String!
    price: Float
    chipsYards: Float
    logLoads: Float
    availableDate: AWSDate
    message: String
    status: String!
    responseNote: String
    respondedAt: AWSDateTime
    createdAt: AWSDateTime!
  }

  type Conversation @model @auth(rules: [{ allow: private }]) {
    id: ID!
    serviceRequestId: ID!
      @index(name: "byServiceRequest", queryField: "conversationsByServiceRequest")
    offerId: ID!
    gardenerId: ID!
      @index(name: "byGardener", sortKeyFields: ["lastMessageAt"], queryField: "conversationsByGardener")
    gardenerName: String!
    organizationId: ID!
      @index(name: "byOrganization", sortKeyFields: ["lastMessageAt"], queryField: "conversationsByOrganization")
    organizationName: String!
    summary: String
    lastMessageAt: AWSDateTime!
    lastMessagePreview: String
    lastMessageSenderSide: String
  }

  type Message @model @auth(rules: [{ allow: private }]) {
    id: ID!
    conversationId: ID!
      @index(name: "byConversation", sortKeyFields: ["createdAt"], queryField: "messagesByConversation")
    senderId: ID!
    senderName: String!
    senderSide: String!
    body: String!
    createdAt: AWSDateTime!
  }
`;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
