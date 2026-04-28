import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { connectDB } from "./infrastructure/db/mongoose";
import { connectRedis } from "./infrastructure/db/redis";
import { typeDefs } from "./presentation/graphql/schema";
import { resolvers } from "./presentation/graphql/resolvers";

dotenv.config();

const server = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/graphql", expressMiddleware(server));
  const PORT = process.env.PORT || 4000;

  //conectar a MongoDB y Redis
  await connectDB();
  await connectRedis();

  //configurar apollo server
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  await server.start();

  app.listen(PORT, () => {
    console.log(
      `🚀 Servidor GraphQL listo en http://localhost:${PORT}/graphql`
    );
  });
};

server();
