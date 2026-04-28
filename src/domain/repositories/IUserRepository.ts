import { CreateUserInput, User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserInput): Promise<User>;
  savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void>;
  findByValidPasswordResetToken(
    tokenHash: string,
    now: Date
  ): Promise<User | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
