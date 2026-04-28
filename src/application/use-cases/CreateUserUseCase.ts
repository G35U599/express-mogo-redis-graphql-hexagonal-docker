import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(name: string, email: string) {
    // Acá podrías validar si el email tiene formato correcto, etc.
    return await this.userRepository.save({ name, email });
  }
}
