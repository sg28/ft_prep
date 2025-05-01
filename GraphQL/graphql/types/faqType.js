const { gql } = require("apollo-server-express");

const faqType = gql`
  type Question {
    id: ID!
    question: String!
    answer: String!
  }

  type Topic {
    id: ID!
    name: String!
    questions: [Question] # List of questions within a topic
  }

  extend type Query {
    faqs(populate: Boolean): [Topic]
    faq(id: ID!): Topic
  }
`;

module.exports = faqType;
