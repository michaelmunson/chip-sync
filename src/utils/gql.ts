export {}
/* ADDED

users {
  items {
    id
    firstName
    lastName
    role
    contact
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
    latitude
    longitude
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
*/


/* OLD

export const getOrganization = `
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
        contact
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
        latitude
        longitude
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
    createdAt
    updatedAt
    owner
    __typename
  }
}
`;
export const listOrganizations = `
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
        nextToken
        __typename
      }
      markers {
        nextToken
        __typename
      }
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
export const getUser = `
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
        owner
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
        nextToken
        __typename
      }
      markers {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
    contact
    markers {
      items {
        id
        address
        latitude
        longitude
        images
        type
        createdAt
        updatedAt
        userMarkersId
        owner
        __typename
      }
      nextToken
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
export const listUsers = `
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
        owner
        __typename
      }
      contact
      markers {
        nextToken
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
export const getMarker = `
query GetMarker($id: ID!) {
  getMarker(id: $id) {
    id
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
export const listMarkers = `
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
export const getNotification = `
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
        owner
        __typename
      }
      contact
      markers {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      organizationUsersId
      owner
      __typename
    }
    createdAt
    updatedAt
    userNotificationsId
    owner
    __typename
  }
}
`;
export const listNotifications = `
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
        contact
        createdAt
        updatedAt
        organizationUsersId
        owner
        __typename
      }
      createdAt
      updatedAt
      userNotificationsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
`;
export const getGardnerMarker = `
query GetGardnerMarker($id: ID!) {
  getGardnerMarker(id: $id) {
    id
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
        owner
        __typename
      }
      contact
      markers {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      organizationUsersId
      owner
      __typename
    }
    createdAt
    updatedAt
    userMarkersId
    owner
    __typename
  }
}
`;
export const listGardnerMarkers = `
query ListGardnerMarkers(
  $filter: ModelGardnerMarkerFilterInput
  $limit: Int
  $nextToken: String
) {
  listGardnerMarkers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
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
        contact
        createdAt
        updatedAt
        organizationUsersId
        owner
        __typename
      }
      createdAt
      updatedAt
      userMarkersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
`;
*/