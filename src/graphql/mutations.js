/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createOrganization = /* GraphQL */ `
  mutation CreateOrganization(
    $input: CreateOrganizationInput!
    $condition: ModelOrganizationConditionInput
  ) {
    createOrganization(input: $input, condition: $condition) {
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
export const updateOrganization = /* GraphQL */ `
  mutation UpdateOrganization(
    $input: UpdateOrganizationInput!
    $condition: ModelOrganizationConditionInput
  ) {
    updateOrganization(input: $input, condition: $condition) {
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
export const deleteOrganization = /* GraphQL */ `
  mutation DeleteOrganization(
    $input: DeleteOrganizationInput!
    $condition: ModelOrganizationConditionInput
  ) {
    deleteOrganization(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createMarker = /* GraphQL */ `
  mutation CreateMarker(
    $input: CreateMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    createMarker(input: $input, condition: $condition) {
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
export const updateMarker = /* GraphQL */ `
  mutation UpdateMarker(
    $input: UpdateMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    updateMarker(input: $input, condition: $condition) {
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
export const deleteMarker = /* GraphQL */ `
  mutation DeleteMarker(
    $input: DeleteMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    deleteMarker(input: $input, condition: $condition) {
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
export const createNotification = /* GraphQL */ `
  mutation CreateNotification(
    $input: CreateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    createNotification(input: $input, condition: $condition) {
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
export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
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
export const deleteNotification = /* GraphQL */ `
  mutation DeleteNotification(
    $input: DeleteNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    deleteNotification(input: $input, condition: $condition) {
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
export const createGardnerMarker = /* GraphQL */ `
  mutation CreateGardnerMarker(
    $input: CreateGardnerMarkerInput!
    $condition: ModelGardnerMarkerConditionInput
  ) {
    createGardnerMarker(input: $input, condition: $condition) {
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
export const updateGardnerMarker = /* GraphQL */ `
  mutation UpdateGardnerMarker(
    $input: UpdateGardnerMarkerInput!
    $condition: ModelGardnerMarkerConditionInput
  ) {
    updateGardnerMarker(input: $input, condition: $condition) {
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
export const deleteGardnerMarker = /* GraphQL */ `
  mutation DeleteGardnerMarker(
    $input: DeleteGardnerMarkerInput!
    $condition: ModelGardnerMarkerConditionInput
  ) {
    deleteGardnerMarker(input: $input, condition: $condition) {
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
