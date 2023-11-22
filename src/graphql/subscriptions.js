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
export const onUpdateOrganization = /* GraphQL */ `
  subscription OnUpdateOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
    $owner: String
  ) {
    onUpdateOrganization(filter: $filter, owner: $owner) {
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
export const onDeleteOrganization = /* GraphQL */ `
  subscription OnDeleteOrganization(
    $filter: ModelSubscriptionOrganizationFilterInput
    $owner: String
  ) {
    onDeleteOrganization(filter: $filter, owner: $owner) {
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
export const onCreateMarker = /* GraphQL */ `
  subscription OnCreateMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onCreateMarker(filter: $filter, owner: $owner) {
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
export const onUpdateMarker = /* GraphQL */ `
  subscription OnUpdateMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onUpdateMarker(filter: $filter, owner: $owner) {
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
export const onDeleteMarker = /* GraphQL */ `
  subscription OnDeleteMarker(
    $filter: ModelSubscriptionMarkerFilterInput
    $owner: String
  ) {
    onDeleteMarker(filter: $filter, owner: $owner) {
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
