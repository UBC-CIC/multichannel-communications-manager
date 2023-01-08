/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $email_address: String!
    $phone_address: String
    $postal_code: String
    $province: Province!
    $language: Language!
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    createUser(
      email_address: $email_address
      phone_address: $phone_address
      postal_code: $postal_code
      province: $province
      language: $language
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      email_address
      phone_address
      postal_code
      province
      language
      email_notice
      sms_notice
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
    $language: Language
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    updateUser(
      user_id: $user_id
      email_address: $email_address
      phone_address: $phone_address
      postal_code: $postal_code
      province: $province
      language: $language
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      email_address
      phone_address
      postal_code
      province
      language
      email_notice
      sms_notice
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
    $picture_location: String
    $english_title: String!
    $english_description: String
  ) {
    createCategory(
      picture_location: $picture_location
      english_title: $english_title
      english_description: $english_description
    ) {
      category_id
      language
      title
      description
      picture_location
    }
  }
`;
export const addCategoryDisplayLanguage = /* GraphQL */ `
  mutation AddCategoryDisplayLanguage(
    $category_id: Int!
    $language: Language!
    $title: String!
    $description: String
  ) {
    addCategoryDisplayLanguage(
      category_id: $category_id
      language: $language
      title: $title
      description: $description
    ) {
      category_id
      language
      title
      description
      picture_location
    }
  }
`;
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $category_id: Int!
    $language: String!
    $title: String
    $description: String
    $picture_location: String
  ) {
    updateCategory(
      category_id: $category_id
      language: $language
      title: $title
      description: $description
      picture_location: $picture_location
    ) {
      category_id
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
  mutation CreateTopic($english_name: String!) {
    createTopic(english_name: $english_name) {
      topic_id
      language
      name
    }
  }
`;
export const addTopicDisplayLanguage = /* GraphQL */ `
  mutation AddTopicDisplayLanguage(
    $topic_id: Int!
    $language: Language!
    $name: String!
  ) {
    addTopicDisplayLanguage(
      topic_id: $topic_id
      language: $language
      name: $name
    ) {
      topic_id
      language
      name
    }
  }
`;
export const updateTopic = /* GraphQL */ `
  mutation UpdateTopic($topic_id: Int!, $language: String!, $name: String!) {
    updateTopic(topic_id: $topic_id, language: $language, name: $name) {
      topic_id
      language
      name
    }
  }
`;
export const deleteTopic = /* GraphQL */ `
  mutation DeleteTopic($topic_id: Int!) {
    deleteTopic(topic_id: $topic_id)
  }
`;
export const addTopicToCategory = /* GraphQL */ `
  mutation AddTopicToCategory($category_id: Int!, $topic_id: Int!) {
    addTopicToCategory(category_id: $category_id, topic_id: $topic_id) {
      categoryTopic_id
      category_id
      topic_id
    }
  }
`;
export const deleteCategoryTopic = /* GraphQL */ `
  mutation DeleteCategoryTopic($category_id: Int!, $topic_id: Int!) {
    deleteCategoryTopic(category_id: $category_id, topic_id: $topic_id)
  }
`;
export const userFollowCategoryTopic = /* GraphQL */ `
  mutation UserFollowCategoryTopic(
    $user_id: Int!
    $category_id: Int!
    $topic_id: Int!
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    userFollowCategoryTopic(
      user_id: $user_id
      category_id: $category_id
      topic_id: $topic_id
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      category_id
      topic_id
      email_notice
      sms_notice
    }
  }
`;
export const userUpdateChannelPrefrence = /* GraphQL */ `
  mutation UserUpdateChannelPrefrence(
    $user_id: Int!
    $category_id: Int!
    $topic_id: Int!
    $email_notice: Boolean!
    $sms_notice: Boolean!
  ) {
    userUpdateChannelPrefrence(
      user_id: $user_id
      category_id: $category_id
      topic_id: $topic_id
      email_notice: $email_notice
      sms_notice: $sms_notice
    ) {
      user_id
      category_id
      topic_id
      email_notice
      sms_notice
    }
  }
`;
export const userUnfollowCategoryTopic = /* GraphQL */ `
  mutation UserUnfollowCategoryTopic(
    $user_id: Int!
    $category_id: Int!
    $topic_id: Int!
  ) {
    userUnfollowCategoryTopic(
      user_id: $user_id
      category_id: $category_id
      topic_id: $topic_id
    )
  }
`;
export const userUnfollowCategory = /* GraphQL */ `
  mutation UserUnfollowCategory($user_id: Int!, $category_id: Int!) {
    userUnfollowCategory(user_id: $user_id, category_id: $category_id)
  }
`;
