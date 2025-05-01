require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const userResolvers = require("./graphql/resolvers/userResolver");
const faqResolvers = require("./graphql/resolvers/faqResolver");
const routes = require("./routes");
const createContext = require("./utils/authentication/authContext");

const STRAPI_WRAPPER_CONEXT_PATH = process.env.API_CONTEXT_PATH;

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(`/${STRAPI_WRAPPER_CONEXT_PATH}`, routes);

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers: [userResolvers, faqResolvers],
    context: createContext,
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 GraphQL API running on http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(`🚀 REST API running at http://localhost:${PORT}/${STRAPI_WRAPPER_CONEXT_PATH}`);
  });
};

startServer();
