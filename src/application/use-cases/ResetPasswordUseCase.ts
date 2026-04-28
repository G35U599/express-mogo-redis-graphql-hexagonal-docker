import { createHash } from "crypto";
import { hashPassword } from "../../infrastructure/security/password";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class ResetPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(token: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByValidPasswordResetToken(
      tokenHash,
      new Date()
    );

    if (!user) {
      throw new Error("Token inválido o expirado");
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);

    return true;
  }
}
