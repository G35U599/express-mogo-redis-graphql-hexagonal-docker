import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
// Revisa si tu carpeta se llama "infrastructure" o "infraestructure" y ajusta esto:
import { connectDB } from "./infrastructure/db/mongoose";
import { connectRedis } from "./infrastructure/db/redis";
import { typeDefs } from "./presentation/graphql/schema";
import { resolvers } from "./presentation/graphql/resolvers";

dotenv.config();

const startApp = async () => {
  const app = express();
  const PORT = process.env.PORT || 4000;

  // 1. Conectar a las bases de datos primero
  await connectDB();
  await connectRedis();

  // 2. Configurar Apollo Server
  const apolloServer = new ApolloServer({ typeDefs, resolvers });

  // 3. ¡MUY IMPORTANTE! Arrancar Apollo Server ANTES de dárselo a Express
  await apolloServer.start();

  // 4. Configurar Middlewares de Express
  app.use(cors());
  app.use(express.json());

  // 5. Unir Apollo con Express (AQUÍ pasamos apolloServer, no la función)
  app.use("/graphql", expressMiddleware(apolloServer));

  // 6. Levantar el servidor
  app.listen(PORT, () => {
    console.log(
      `🚀 Servidor GraphQL listo en http://localhost:${PORT}/graphql`
    );
  });
};

startApp();
