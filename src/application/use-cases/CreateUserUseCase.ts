import { hashPassword } from "../../infrastructure/security/password";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, email: string, password: string) {
    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Ya existe un usuario con ese email");
    }

    const passwordHash = await hashPassword(password);

    return await this.userRepository.create({ name, email, passwordHash });
  }
}
