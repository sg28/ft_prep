const { gql } = require('apollo-server-express');

const userType = gql`
  type Role {
    id: ID!
    name: String
    description: String
    type: String
    createdAt: String
    updatedAt: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
    password: String
    confirmed: Boolean
    blocked: Boolean
    role: Role
  }

  extend type Query {
    users: [User]
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(
      username: String!
      email: String!
      password: String
      confirmed: Boolean
      blocked: Boolean
      role: Int!
    ): User
  }
`;

module.exports = userType;
