import { createClient } from "redis";

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err: string) =>
  console.log("❌ Error en Redis:", err)
);

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("🚀 Redis conectado");
};
