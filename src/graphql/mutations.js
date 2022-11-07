/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      phoneNumber
      phoneId
      province
      postalCode
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
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
      email
      phoneNumber
      phoneId
      province
      postalCode
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
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
      email
      phoneNumber
      phoneId
      province
      postalCode
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createTopic = /* GraphQL */ `
  mutation CreateTopic(
    $input: CreateTopicInput!
    $condition: ModelTopicConditionInput
  ) {
    createTopic(input: $input, condition: $condition) {
      id
      title
      description
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateTopic = /* GraphQL */ `
  mutation UpdateTopic(
    $input: UpdateTopicInput!
    $condition: ModelTopicConditionInput
  ) {
    updateTopic(input: $input, condition: $condition) {
      id
      title
      description
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteTopic = /* GraphQL */ `
  mutation DeleteTopic(
    $input: DeleteTopicInput!
    $condition: ModelTopicConditionInput
  ) {
    deleteTopic(input: $input, condition: $condition) {
      id
      title
      description
      follows {
        items {
          id
          emailNotice
          textNotice
          createdAt
          updatedAt
          userFollowsId
          topicFollowsId
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const createFollow = /* GraphQL */ `
  mutation CreateFollow(
    $input: CreateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    createFollow(input: $input, condition: $condition) {
      id
      user {
        id
        email
        phoneNumber
        phoneId
        province
        postalCode
        follows {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      topic {
        id
        title
        description
        follows {
          nextToken
        }
        createdAt
        updatedAt
      }
      emailNotice
      textNotice
      createdAt
      updatedAt
      userFollowsId
      topicFollowsId
      owner
    }
  }
`;
export const updateFollow = /* GraphQL */ `
  mutation UpdateFollow(
    $input: UpdateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    updateFollow(input: $input, condition: $condition) {
      id
      user {
        id
        email
        phoneNumber
        phoneId
        province
        postalCode
        follows {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      topic {
        id
        title
        description
        follows {
          nextToken
        }
        createdAt
        updatedAt
      }
      emailNotice
      textNotice
      createdAt
      updatedAt
      userFollowsId
      topicFollowsId
      owner
    }
  }
`;
export const deleteFollow = /* GraphQL */ `
  mutation DeleteFollow(
    $input: DeleteFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    deleteFollow(input: $input, condition: $condition) {
      id
      user {
        id
        email
        phoneNumber
        phoneId
        province
        postalCode
        follows {
          nextToken
        }
        createdAt
        updatedAt
        owner
      }
      topic {
        id
        title
        description
        follows {
          nextToken
        }
        createdAt
        updatedAt
      }
      emailNotice
      textNotice
      createdAt
      updatedAt
      userFollowsId
      topicFollowsId
      owner
    }
  }
`;
