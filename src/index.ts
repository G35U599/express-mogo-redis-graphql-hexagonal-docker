import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { connectDB } from "./infrastructure/db/mongoose";
import { connectRedis } from "./infrastructure/db/redis";
import { typeDefs } from "./presentation/graphql/schema";
import { resolvers } from "./presentation/graphql/resolvers";

const startApp = async () => {
  const PORT = Number(process.env.PORT || 4000);

  // 1. Conectar a las bases de datos primero
  await connectDB();
  await connectRedis();

  // 2. Configurar Apollo Server
  const apolloServer = new ApolloServer({ typeDefs, resolvers });

  // 3. Levantar el servidor usando la integración disponible en Apollo Server 5
  const { url } = await startStandaloneServer(apolloServer, {
    listen: { port: PORT },
  });

  console.log(`🚀 Servidor GraphQL listo en ${url}`);
};

startApp();
