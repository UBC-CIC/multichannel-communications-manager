/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($owner: String) {
    onCreateUser(owner: $owner) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($owner: String) {
    onUpdateUser(owner: $owner) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($owner: String) {
    onDeleteUser(owner: $owner) {
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
export const onCreateTopic = /* GraphQL */ `
  subscription OnCreateTopic {
    onCreateTopic {
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
export const onUpdateTopic = /* GraphQL */ `
  subscription OnUpdateTopic {
    onUpdateTopic {
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
export const onDeleteTopic = /* GraphQL */ `
  subscription OnDeleteTopic {
    onDeleteTopic {
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
export const onCreateFollow = /* GraphQL */ `
  subscription OnCreateFollow($owner: String) {
    onCreateFollow(owner: $owner) {
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
export const onUpdateFollow = /* GraphQL */ `
  subscription OnUpdateFollow($owner: String) {
    onUpdateFollow(owner: $owner) {
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
export const onDeleteFollow = /* GraphQL */ `
  subscription OnDeleteFollow($owner: String) {
    onDeleteFollow(owner: $owner) {
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
