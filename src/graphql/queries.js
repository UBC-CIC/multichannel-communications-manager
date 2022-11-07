/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($email: String!) {
    getUser(email: $email) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $email: String
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      email: $email
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
    }
  }
`;
export const getTopic = /* GraphQL */ `
  query GetTopic($id: ID!) {
    getTopic(id: $id) {
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
export const listTopics = /* GraphQL */ `
  query ListTopics(
    $id: ID
    $filter: ModelTopicFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTopics(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        title
        description
        follows {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFollow = /* GraphQL */ `
  query GetFollow($id: ID!) {
    getFollow(id: $id) {
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
export const listFollows = /* GraphQL */ `
  query ListFollows(
    $filter: ModelFollowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFollows(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        user {
          id
          email
          phoneNumber
          phoneId
          province
          postalCode
          createdAt
          updatedAt
          owner
        }
        topic {
          id
          title
          description
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
      nextToken
    }
  }
`;
