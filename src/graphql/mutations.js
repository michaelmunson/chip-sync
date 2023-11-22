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
export const updateOrganization = /* GraphQL */ `
  mutation UpdateOrganization(
    $input: UpdateOrganizationInput!
    $condition: ModelOrganizationConditionInput
  ) {
    updateOrganization(input: $input, condition: $condition) {
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
export const deleteOrganization = /* GraphQL */ `
  mutation DeleteOrganization(
    $input: DeleteOrganizationInput!
    $condition: ModelOrganizationConditionInput
  ) {
    deleteOrganization(input: $input, condition: $condition) {
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
export const createMarker = /* GraphQL */ `
  mutation CreateMarker(
    $input: CreateMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    createMarker(input: $input, condition: $condition) {
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
export const updateMarker = /* GraphQL */ `
  mutation UpdateMarker(
    $input: UpdateMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    updateMarker(input: $input, condition: $condition) {
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
export const deleteMarker = /* GraphQL */ `
  mutation DeleteMarker(
    $input: DeleteMarkerInput!
    $condition: ModelMarkerConditionInput
  ) {
    deleteMarker(input: $input, condition: $condition) {
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
