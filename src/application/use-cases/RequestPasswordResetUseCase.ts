import { createHash, randomBytes } from "crypto";
import { IEmailService } from "../ports/IEmailService";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

const getPasswordResetBaseUrl = () => {
  const baseUrl = process.env.PASSWORD_RESET_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "La variable de entorno PASSWORD_RESET_BASE_URL es obligatoria"
    );
  }

  return baseUrl;
};

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);

    // No revelar si el email existe o no
    if (!user) {
      return true;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.userRepository.savePasswordResetToken(
      user.id,
      tokenHash,
      expiresAt
    );

    const resetUrl = new URL(getPasswordResetBaseUrl());
    resetUrl.searchParams.set("token", rawToken);

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: resetUrl.toString(),
    });

    return true;
  }
}
