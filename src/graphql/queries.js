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
    }
  }
`;
export const getUserCategoryTopicByUserId = /* GraphQL */ `
  query GetUserCategoryTopicByUserId($user_id: Int!) {
    getUserCategoryTopicByUserId(user_id: $user_id) {
      user_id
      category_acronym
      topic_acronym
      email_notice
      sms_notice
    }
  }
`;
export const getCategoryTopicById = /* GraphQL */ `
  query GetCategoryTopicById($categoryTopic_id: Int!) {
    getCategoryTopicById(categoryTopic_id: $categoryTopic_id) {
      categoryTopic_id
      category_acronym
      topic_acronym
    }
  }
`;
export const getCategoryByAcronym = /* GraphQL */ `
  query GetCategoryByAcronym($acronym: String!) {
    getCategoryByAcronym(acronym: $acronym) {
      category_id
      acronym
      title
      description
    }
  }
`;
export const getTopicsOfCategoryByAcronym = /* GraphQL */ `
  query GetTopicsOfCategoryByAcronym($category_acronym: String!) {
    getTopicsOfCategoryByAcronym(category_acronym: $category_acronym) {
      topic_id
      acronym
    }
  }
`;
export const getTopicByAcronym = /* GraphQL */ `
  query GetTopicByAcronym($topic_acronym: String!) {
    getTopicByAcronym(topic_acronym: $topic_acronym) {
      topic_id
      acronym
    }
  }
`;
export const getAllCategories = /* GraphQL */ `
  query GetAllCategories {
    getAllCategories {
      category_id
      acronym
      title
      description
    }
  }
`;
export const getAllTopics = /* GraphQL */ `
  query GetAllTopics {
    getAllTopics {
      topic_id
      acronym
    }
  }
`;
export const getAllCategoryTopics = /* GraphQL */ `
  query GetAllCategoryTopics {
    getAllCategoryTopics {
      categoryTopic_id
      category_acronym
      topic_acronym
    }
  }
`;
export const testSQL = /* GraphQL */ `
  query TestSQL {
    testSQL
  }
`;
