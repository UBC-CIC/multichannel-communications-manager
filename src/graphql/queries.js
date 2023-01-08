/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUserById = /* GraphQL */ `
  query GetUserById($user_id: Int!) {
    getUserById(user_id: $user_id) {
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
export const getUserByEmail = /* GraphQL */ `
  query GetUserByEmail($user_email: String!) {
    getUserByEmail(user_email: $user_email) {
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
export const getUserCategoryTopicByUserId = /* GraphQL */ `
  query GetUserCategoryTopicByUserId($user_id: Int!) {
    getUserCategoryTopicByUserId(user_id: $user_id) {
      user_id
      category_id
      topic_id
      email_notice
      sms_notice
    }
  }
`;
export const getCategoriesByUserId = /* GraphQL */ `
  query GetCategoriesByUserId($user_id: Int!, $language: String) {
    getCategoriesByUserId(user_id: $user_id, language: $language) {
      id
      language
      title
      description
      email_notice
      sms_notice
      picture_location
    }
  }
`;
export const getCategoryTopicById = /* GraphQL */ `
  query GetCategoryTopicById($categoryTopic_id: Int!) {
    getCategoryTopicById(categoryTopic_id: $categoryTopic_id) {
      categoryTopic_id
      category_id
      topic_id
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($category_id: Int!) {
    getCategory(category_id: $category_id) {
      category_id
      language
      title
      description
      picture_location
    }
  }
`;
export const getTopicsOfCategory = /* GraphQL */ `
  query GetTopicsOfCategory($category_id: Int!) {
    getTopicsOfCategory(category_id: $category_id) {
      topic_id
      language
      name
    }
  }
`;
export const getTopic = /* GraphQL */ `
  query GetTopic($topic_id: Int!) {
    getTopic(topic_id: $topic_id) {
      topic_id
      language
      name
    }
  }
`;
export const getAllCategoriesForLanguage = /* GraphQL */ `
  query GetAllCategoriesForLanguage($language: String!) {
    getAllCategoriesForLanguage(language: $language) {
      category_id
      language
      title
      description
      picture_location
    }
  }
`;
export const getAllTopicsForLanguage = /* GraphQL */ `
  query GetAllTopicsForLanguage($language: String!) {
    getAllTopicsForLanguage(language: $language) {
      topic_id
      language
      name
    }
  }
`;
export const getAllCategoryTopics = /* GraphQL */ `
  query GetAllCategoryTopics {
    getAllCategoryTopics {
      categoryTopic_id
      category_id
      topic_id
    }
  }
`;
export const testSQL = /* GraphQL */ `
  query TestSQL {
    testSQL
  }
`;
