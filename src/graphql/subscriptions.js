/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateOrganization = /* GraphQL */ `
  subscription OnCreateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
    $owner: String
  ) {
    onCreateOrganization(filter: $filter, owner: $owner) {
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
          owner
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
export const onUpdateOrganization = /* GraphQL */ `
  subscription OnUpdateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
    $owner: String
  ) {
    onUpdateOrganization(filter: $filter, owner: $owner) {
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
          owner
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
export const onDeleteOrganization = /* GraphQL */ `
  subscription OnDeleteOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
    $owner: String
  ) {
    onDeleteOrganization(filter: $filter, owner: $owner) {
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
          owner
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
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
export const onCreateMarker = /* GraphQL */ `
  subscription OnCreateMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onCreateMarker(filter: $filter, owner: $owner) {
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
export const onUpdateMarker = /* GraphQL */ `
  subscription OnUpdateMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onUpdateMarker(filter: $filter, owner: $owner) {
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
export const onDeleteMarker = /* GraphQL */ `
  subscription OnDeleteMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onDeleteMarker(filter: $filter, owner: $owner) {
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
export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onCreateNotification(filter: $filter, owner: $owner) {
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
        mapChoice
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
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onUpdateNotification(filter: $filter, owner: $owner) {
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
        mapChoice
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
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onDeleteNotification(filter: $filter, owner: $owner) {
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
        mapChoice
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
export const onCreateGardnerMarker = /* GraphQL */ `
  subscription OnCreateGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
    $owner: String
  ) {
    onCreateGardnerMarker(filter: $filter, owner: $owner) {
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
          owner
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
export const onUpdateGardnerMarker = /* GraphQL */ `
  subscription OnUpdateGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
    $owner: String
  ) {
    onUpdateGardnerMarker(filter: $filter, owner: $owner) {
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
          owner
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
export const onDeleteGardnerMarker = /* GraphQL */ `
  subscription OnDeleteGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
    $owner: String
  ) {
    onDeleteGardnerMarker(filter: $filter, owner: $owner) {
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
          owner
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
