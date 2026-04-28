import { User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: Omit<User, "id">): Promise<User>;
}
