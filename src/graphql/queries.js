/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOrganization = /* GraphQL */ `
  query GetOrganization($id: ID!) {
    getOrganization(id: $id) {
      id
      name
      tier
      accessCode
      location
      users {
        items {
          id
          firstName
          lastName
          role
          mapChoice
          contact
          createdAt
          updatedAt
          organizationUsersId
          __typename
        }
        nextToken
        __typename
      }
      markers {
        items {
          id
          name
          description
          contact
          address
          latitude
          longitude
          images
          type
          createdAt
          updatedAt
          organizationMarkersId
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
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
        tier
        accessCode
        location
        users {
            items {
                id
                firstName
                lastName
                role
                mapChoice
                contact
                createdAt
                updatedAt
                organizationUsersId
                __typename
            }
            nextToken
            __typename
        }
        markers {
          nextToken
          __typename
        }
        createdAt
        updatedAt
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
      notifications {
        items {
          id
          timestamp
          type
          data
          opened
          createdAt
          updatedAt
          userNotificationsId
          __typename
        }
        nextToken
        __typename
      }
      organization {
        id
        name
        tier
        accessCode
        location
        users {
            items {
                id
                firstName
                lastName
                role
                mapChoice
                contact
                createdAt
                updatedAt
                organizationUsersId
                __typename
            }
            nextToken
            __typename
        }
      markers {
        items {
          id
          name
          description
          contact
          address
          latitude
          longitude
          images
          type
          createdAt
          updatedAt
          organizationMarkersId
          __typename
        }
        nextToken
        __typename
      }
        createdAt
        updatedAt
        __typename
      }
      mapChoice
      contact
      markers {
        items {
          id
          description
          address
          latitude
          longitude
          images
          type
          createdAt
          updatedAt
          userMarkersId
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      organizationUsersId
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
        notifications {
          nextToken
          __typename
        }
        organization {
          id
          name
          tier
          accessCode
          location
          createdAt
          updatedAt
          __typename
        }
        mapChoice
        contact
        markers {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        organizationUsersId
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
      name
      description
      contact
      address
      latitude
      longitude
      images
      type
      organization {
        id
        name
        tier
        accessCode
        location
        users {
          nextToken
          __typename
        }
        markers {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      organizationMarkersId
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
        name
        description
        contact
        address
        latitude
        longitude
        images
        type
        organization {
          id
          name
          tier
          accessCode
          location
          createdAt
          updatedAt
          __typename
        }
        createdAt
        updatedAt
        organizationMarkersId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getNotification = /* GraphQL */ `
  query GetNotification($id: ID!) {
    getNotification(id: $id) {
      id
      timestamp
      type
      data
      opened
      user {
        id
        firstName
        lastName
        role
        notifications {
          nextToken
          __typename
        }
        organization {
          id
          name
          tier
          accessCode
          location
          createdAt
          updatedAt
          __typename
        }
        mapChoice
        contact
        markers {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        organizationUsersId
        __typename
      }
      createdAt
      updatedAt
      userNotificationsId
      __typename
    }
  }
`;
export const listNotifications = /* GraphQL */ `
  query ListNotifications(
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        timestamp
        type
        data
        opened
        user {
          id
          firstName
          lastName
          role
          mapChoice
          contact
          createdAt
          updatedAt
          organizationUsersId
          __typename
        }
        createdAt
        updatedAt
        userNotificationsId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getGardnerMarker = /* GraphQL */ `
  query GetGardnerMarker($id: ID!) {
    getGardnerMarker(id: $id) {
      id
      description
      address
      latitude
      longitude
      images
      type
      user {
        id
        firstName
        lastName
        role
        notifications {
          nextToken
          __typename
        }
        organization {
          id
          name
          tier
          accessCode
          location
          createdAt
          updatedAt
          __typename
        }
        mapChoice
        contact
        markers {
          nextToken
          __typename
        }
        createdAt
        updatedAt
        organizationUsersId
        __typename
      }
      createdAt
      updatedAt
      userMarkersId
      __typename
    }
  }
`;
export const listGardnerMarkers = /* GraphQL */ `
  query ListGardnerMarkers(
    $filter: ModelGardnerMarkerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGardnerMarkers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        description
        address
        latitude
        longitude
        images
        type
        user {
          id
          firstName
          lastName
          role
          mapChoice
          contact
          createdAt
          updatedAt
          organizationUsersId
          __typename
        }
        createdAt
        updatedAt
        userMarkersId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
