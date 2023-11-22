/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOrganization = /* GraphQL */ `
  query GetOrganization($id: ID!) {
    getOrganization(id: $id) {
      id
      name
      accessCode
      users {
        items {
          id
          firstName
          lastName
          role
          createdAt
          updatedAt
          organizationUsersId
          owner
          __typename
        }
        nextToken
        __typename
      }
      markers {
        items {
          id
          contact
          address
          position
          images
          type
          createdAt
          updatedAt
          organizationMarkersId
          owner
          __typename
        }
        nextToken
        __typename
      }
      notifications
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listOrganizations = /* GraphQL */ `
  query ListOrganizations(
    $filter: ModelOrganizationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrganizations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        accessCode
        users {
          nextToken
          __typename
        }
        markers {
          nextToken
          __typename
        }
        notifications
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      firstName
      lastName
      role
      organization {
        id
        name
        accessCode
        users {
          nextToken
          __typename
        }
        markers {
          nextToken
          __typename
        }
        notifications
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      organizationUsersId
      owner
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        firstName
        lastName
        role
        organization {
          id
          name
          accessCode
          notifications
          createdAt
          updatedAt
          owner
          __typename
        }
        createdAt
        updatedAt
        organizationUsersId
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMarker = /* GraphQL */ `
  query GetMarker($id: ID!) {
    getMarker(id: $id) {
      id
      contact
      address
      position
      images
      type
      organization {
        id
        name
        accessCode
        users {
          nextToken
          __typename
        }
        markers {
          nextToken
          __typename
        }
        notifications
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      organizationMarkersId
      owner
      __typename
    }
  }
`;
export const listMarkers = /* GraphQL */ `
  query ListMarkers(
    $filter: ModelMarkerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMarkers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        contact
        address
        position
        images
        type
        organization {
          id
          name
          accessCode
          notifications
          createdAt
          updatedAt
          owner
          __typename
        }
        createdAt
        updatedAt
        organizationMarkersId
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
