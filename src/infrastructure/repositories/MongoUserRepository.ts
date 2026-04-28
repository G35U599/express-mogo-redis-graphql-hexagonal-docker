import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../db/mongoose";

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id);
    if (!userDoc) return null;
    return new User(userDoc._id.toString(), userDoc.name, userDoc.email);
  }

  async save(userData: Omit<User, "id">): Promise<User> {
    const newUser = await UserModel.create(userData);
    return new User(newUser._id.toString(), newUser.name, newUser.email);
  }
}
