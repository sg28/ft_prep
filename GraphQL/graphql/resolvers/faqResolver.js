const faqModel = require("../../models/faqModel");

const resolvers = {
  Query: {
    faqs: async (parent, args, context, { populate }) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized! Token required.");
        }
        const topics = await faqModel.getTopics(populate);
        return topics;
      } catch (error) {
        throw new Error("Error fetching FAQs");
      }
    },
    faq: async (_, { id }) => {
      try {
        const topic = await faqModel.getTopicById(id);
        return topic;
      } catch (error) {
        throw new Error("Error fetching FAQ by ID");
      }
    },
  },
};

module.exports = resolvers;
