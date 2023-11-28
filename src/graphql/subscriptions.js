/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateOrganization = /* GraphQL */ `
  subscription OnCreateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onCreateOrganization(filter: $filter) {
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
export const onUpdateOrganization = /* GraphQL */ `
  subscription OnUpdateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onUpdateOrganization(filter: $filter) {
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
export const onDeleteOrganization = /* GraphQL */ `
  subscription OnDeleteOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
  ) {
    onDeleteOrganization(filter: $filter) {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateMarker = /* GraphQL */ `
  subscription OnCreateMarker($filter: ModelSubscriptionMarkerFilterInput) {
    onCreateMarker(filter: $filter) {
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
export const onUpdateMarker = /* GraphQL */ `
  subscription OnUpdateMarker($filter: ModelSubscriptionMarkerFilterInput) {
    onUpdateMarker(filter: $filter) {
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
export const onDeleteMarker = /* GraphQL */ `
  subscription OnDeleteMarker($filter: ModelSubscriptionMarkerFilterInput) {
    onDeleteMarker(filter: $filter) {
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
export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onCreateNotification(filter: $filter) {
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
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onUpdateNotification(filter: $filter) {
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
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
  ) {
    onDeleteNotification(filter: $filter) {
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
export const onCreateGardnerMarker = /* GraphQL */ `
  subscription OnCreateGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
  ) {
    onCreateGardnerMarker(filter: $filter) {
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
export const onUpdateGardnerMarker = /* GraphQL */ `
  subscription OnUpdateGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
  ) {
    onUpdateGardnerMarker(filter: $filter) {
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
export const onDeleteGardnerMarker = /* GraphQL */ `
  subscription OnDeleteGardnerMarker(
    $filter: ModelSubscriptionGardnerMarkerFilterInput
  ) {
    onDeleteGardnerMarker(filter: $filter) {
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
