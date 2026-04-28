import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { redisClient } from "../../infrastructure/db/redis";

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string) {
    const cacheKey = `user:${id}`;

    // 1. Buscar en Redis (caché)
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      console.log("⚡ Recuperado desde Redis Cache");
      return JSON.parse(cachedUser);
    }

    // 2. Si no está en Redis, buscar en MongoDB
    console.log("🐢 Recuperado desde MongoDB");
    const user = await this.userRepository.findById(id);

    if (!user) throw new Error("Usuario no encontrado");

    // 3. Guardar en Redis para futuras búsquedas (expira en 1 hora = 3600 segundos)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));

    return user;
  }
}
