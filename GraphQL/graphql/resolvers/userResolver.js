const userModel = require("../../models/userModel");

const resolvers = {
  Query: {
    users: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized! Token required.");
        }
        return await userModel.getUsers();
      } catch (error) {
        throw new Error('Error fetching users');
      }
    },
    user: async (_, { id }) => {
      return await userModel.getUserById(id);
    }
  },
  Mutation: {
    createUser: async (_, { username, email, password, confirmed, blocked, role }) => {
      const newUser = {
        username,
        email,
        password,
        confirmed,
        blocked,
        role: {
          connect: [{ id: role }]
        }
      };
      return await userModel.createUser(newUser);
    }
  }
};

module.exports = resolvers;
