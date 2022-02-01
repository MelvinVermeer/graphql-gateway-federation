import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { authDirective } from "./auth-directive.js";

const typeDefs = gql`
  directive @auth on OBJECT | FIELD_DEFINITION

  extend type Query {
    product(id: String!): Product!
  }

  type Product @key(fields: "id") {
    id: String!
    name: String!
    owner: String @auth
  }
`;

const resolvers = {
  Query: {
    product: (_, { id }) => {
      return {
        id: id,
        name: "Bike",
      };
    },
  },
  Product: {
    owner: () => {
      console.log("owner resolver");
      return "John Doe";
    },
  },
};

const { authDirectiveTransformer } = authDirective();
const server = new ApolloServer({
  context: ({ req }) => ({ headers: req.headers }),
  schema: authDirectiveTransformer(
    buildSubgraphSchema([{ typeDefs, resolvers }])
  ),
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`📦 Product service ready at ${url}`);
});
