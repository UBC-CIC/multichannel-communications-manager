/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $email_address: String!
    $phone_address: String
    $postal_code: String
    $province: Province!
  ) {
    createUser(
      email_address: $email_address
      phone_address: $phone_address
      postal_code: $postal_code
      province: $province
    ) {
      user_id
      email_address
      phone_address
      postal_code
      province
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $user_id: Int!
    $email_address: String
    $phone_address: String
    $postal_code: String
    $province: Province
  ) {
    updateUser(
      user_id: $user_id
      email_address: $email_address
      phone_address: $phone_address
      postal_code: $postal_code
      province: $province
    ) {
      user_id
      email_address
      phone_address
      postal_code
      province
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser($user_id: Int!) {
    deleteUser(user_id: $user_id)
  }
`;
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $acronym: String!
    $title: String!
    $description: String
    $picture_location: String
  ) {
    createCategory(
      acronym: $acronym
      title: $title
      description: $description
      picture_location: $picture_location
    ) {
      category_id
      acronym
      title
      description
      picture_location
    }
  }
`;
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $category_id: Int!
    $acronym: String
    $title: String
    $description: String
    $picture_location: String
  ) {
    updateCategory(
      category_id: $category_id
      acronym: $acronym
      title: $title
      description: $description
      picture_location: $picture_location
    ) {
      category_id
      acronym
      title
      description
      picture_location
    }
  }
`;
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory($category_id: Int!) {
    deleteCategory(category_id: $category_id)
  }
`;
export const createTopic = /* GraphQL */ `
  mutation CreateTopic($acronym: String!) {
    createTopic(acronym: $acronym) {
      topic_id
      acronym
    }
  }
`;
export const deleteTopic = /* GraphQL */ `
  mutation DeleteTopic($topic_id: Int!) {
    deleteTopic(topic_id: $topic_id)
  }
`;
export const addTopicToCategory = /* GraphQL */ `
  mutation AddTopicToCategory(
    $category_acronym: String!
    $topic_acronym: String!
  ) {
    addTopicToCategory(
      category_acronym: $category_acronym
      topic_acronym: $topic_acronym
    ) {
      categoryTopic_id
      category_acronym
      topic_acronym
    }
  }
`;
export const deleteCategoryTopic = /* GraphQL */ `
  mutation DeleteCategoryTopic(
    $category_acronym: String!
    $topic_acronym: String!
  ) {
    deleteCategoryTopic(
      category_acronym: $category_acronym
      topic_acronym: $topic_acronym
    )
  }
`;
export const userFollowCategoryTopic = /* GraphQL */ `
  mutation UserFollowCategoryTopic(
    $user_id: Int!
    $category_acronym: String!
    $topic_acronym: String!
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    userFollowCategoryTopic(
      user_id: $user_id
      category_acronym: $category_acronym
      topic_acronym: $topic_acronym
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      categoryTopic_id
      email_notice
      sms_notice
    }
  }
`;
export const userUpdateChannelPrefrence = /* GraphQL */ `
  mutation UserUpdateChannelPrefrence(
    $user_id: Int!
    $category_acronym: String!
    $topic_acronym: String!
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    userUpdateChannelPrefrence(
      user_id: $user_id
      category_acronym: $category_acronym
      topic_acronym: $topic_acronym
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      categoryTopic_id
      email_notice
      sms_notice
    }
  }
`;
export const userUnfollowCategoryTopic = /* GraphQL */ `
  mutation UserUnfollowCategoryTopic(
    $user_id: Int!
    $category_acronym: String!
    $topic_acronym: String!
  ) {
    userUnfollowCategoryTopic(
      user_id: $user_id
      category_acronym: $category_acronym
      topic_acronym: $topic_acronym
    ) {
      user_id
      email_address
      phone_address
      postal_code
      province
    }
  }
`;
export const userUnfollowCategory = /* GraphQL */ `
  mutation UserUnfollowCategory($user_id: Int!, $category_acronym: String!) {
    userUnfollowCategory(user_id: $user_id, category_acronym: $category_acronym)
  }
`;
