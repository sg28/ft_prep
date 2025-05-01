const { gql } = require("apollo-server-express");
const userType = require("./types/userType");
const faqType = require("./types/faqType");

const schema = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  ${userType}
  ${faqType}
`;

module.exports = schema;
