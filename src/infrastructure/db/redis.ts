import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("La variable de entorno REDIS_URL es obligatoria");
}

export const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err: Error) =>
  console.log("❌ Error en Redis:", err.message)
);

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("🚀 Redis conectado");
};
