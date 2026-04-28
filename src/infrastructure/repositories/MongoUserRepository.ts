import { CreateUserInput, User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserModel } from "../db/mongoose";

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id);
    if (!userDoc) return null;

    return new User(userDoc._id.toString(), userDoc.name, userDoc.email);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) return null;

    return new User(userDoc._id.toString(), userDoc.name, userDoc.email);
  }

  async create(user: CreateUserInput): Promise<User> {
    const newUser = await UserModel.create(user);

    return new User(newUser._id.toString(), newUser.name, newUser.email);
  }

  async savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });
  }

  async findByValidPasswordResetToken(
    tokenHash: string,
    now: Date
  ): Promise<User | null> {
    const userDoc = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: now },
    });

    if (!userDoc) return null;

    return new User(userDoc._id.toString(), userDoc.name, userDoc.email);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });
  }
}
