export interface PasswordResetEmailInput {
  to: string;
  name: string;
  resetUrl: string;
}

export interface IEmailService {
  sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void>;
}
