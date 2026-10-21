/* Hand-written operations for the gardener service-request feature
   (ServiceRequest, Offer, Conversation, Message in amplify/data/resource.ts). */

const REQUEST_FIELDS = `
  id
  userId
  requesterName
  status
  services
  description
  address
  latitude
  longitude
  images
  timing
  preferredDate
  contact
  acceptedOfferId
  acceptedOrganizationId
  closedAt
  createdAt
  updatedAt
`;

const OFFER_FIELDS = `
  id
  serviceRequestId
  organizationId
  organizationName
  createdById
  createdByName
  pricing
  price
  chipsYards
  logLoads
  availableDate
  message
  status
  responseNote
  respondedAt
  createdAt
  updatedAt
`;

const CONVERSATION_FIELDS = `
  id
  serviceRequestId
  offerId
  gardenerId
  gardenerName
  organizationId
  organizationName
  summary
  lastMessageAt
  lastMessagePreview
  lastMessageSenderSide
  createdAt
`;

const MESSAGE_FIELDS = `
  id
  conversationId
  senderId
  senderName
  senderSide
  body
  createdAt
`;

/* ---------- Service requests ---------- */
export const getServiceRequest = /* GraphQL */ `
  query GetServiceRequest($id: ID!) {
    getServiceRequest(id: $id) { ${REQUEST_FIELDS} }
  }
`;
export const serviceRequestsByUser = /* GraphQL */ `
  query ServiceRequestsByUser($userId: ID!, $limit: Int, $nextToken: String) {
    serviceRequestsByUser(userId: $userId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${REQUEST_FIELDS} }
      nextToken
    }
  }
`;
export const serviceRequestsByStatus = /* GraphQL */ `
  query ServiceRequestsByStatus($status: String!, $limit: Int, $nextToken: String) {
    serviceRequestsByStatus(status: $status, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${REQUEST_FIELDS} }
      nextToken
    }
  }
`;
export const serviceRequestsByAcceptedOrganization = /* GraphQL */ `
  query ServiceRequestsByAcceptedOrganization($acceptedOrganizationId: ID!, $limit: Int, $nextToken: String) {
    serviceRequestsByAcceptedOrganization(
      acceptedOrganizationId: $acceptedOrganizationId
      sortDirection: DESC
      limit: $limit
      nextToken: $nextToken
    ) {
      items { ${REQUEST_FIELDS} }
      nextToken
    }
  }
`;
export const createServiceRequest = /* GraphQL */ `
  mutation CreateServiceRequest($input: CreateServiceRequestInput!) {
    createServiceRequest(input: $input) { ${REQUEST_FIELDS} }
  }
`;
export const updateServiceRequest = /* GraphQL */ `
  mutation UpdateServiceRequest($input: UpdateServiceRequestInput!, $condition: ModelServiceRequestConditionInput) {
    updateServiceRequest(input: $input, condition: $condition) { ${REQUEST_FIELDS} }
  }
`;

/* ---------- Offers ---------- */
export const offersByServiceRequest = /* GraphQL */ `
  query OffersByServiceRequest($serviceRequestId: ID!, $limit: Int, $nextToken: String) {
    offersByServiceRequest(serviceRequestId: $serviceRequestId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${OFFER_FIELDS} }
      nextToken
    }
  }
`;
export const offersByOrganization = /* GraphQL */ `
  query OffersByOrganization($organizationId: ID!, $limit: Int, $nextToken: String) {
    offersByOrganization(organizationId: $organizationId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${OFFER_FIELDS} }
      nextToken
    }
  }
`;
export const createOffer = /* GraphQL */ `
  mutation CreateOffer($input: CreateOfferInput!) {
    createOffer(input: $input) { ${OFFER_FIELDS} }
  }
`;
export const updateOffer = /* GraphQL */ `
  mutation UpdateOffer($input: UpdateOfferInput!, $condition: ModelOfferConditionInput) {
    updateOffer(input: $input, condition: $condition) { ${OFFER_FIELDS} }
  }
`;

/* ---------- Conversations ---------- */
export const getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) { ${CONVERSATION_FIELDS} }
  }
`;
export const conversationsByGardener = /* GraphQL */ `
  query ConversationsByGardener($gardenerId: ID!, $limit: Int, $nextToken: String) {
    conversationsByGardener(gardenerId: $gardenerId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${CONVERSATION_FIELDS} }
      nextToken
    }
  }
`;
export const conversationsByOrganization = /* GraphQL */ `
  query ConversationsByOrganization($organizationId: ID!, $limit: Int, $nextToken: String) {
    conversationsByOrganization(organizationId: $organizationId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${CONVERSATION_FIELDS} }
      nextToken
    }
  }
`;
export const conversationsByServiceRequest = /* GraphQL */ `
  query ConversationsByServiceRequest($serviceRequestId: ID!) {
    conversationsByServiceRequest(serviceRequestId: $serviceRequestId) {
      items { ${CONVERSATION_FIELDS} }
      nextToken
    }
  }
`;
export const createConversation = /* GraphQL */ `
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) { ${CONVERSATION_FIELDS} }
  }
`;
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation($input: UpdateConversationInput!) {
    updateConversation(input: $input) { ${CONVERSATION_FIELDS} }
  }
`;

/* ---------- Messages ---------- */
export const messagesByConversation = /* GraphQL */ `
  query MessagesByConversation($conversationId: ID!, $limit: Int, $nextToken: String) {
    messagesByConversation(conversationId: $conversationId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${MESSAGE_FIELDS} }
      nextToken
    }
  }
`;
export const createMessage = /* GraphQL */ `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) { ${MESSAGE_FIELDS} }
  }
`;
