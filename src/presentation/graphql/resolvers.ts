import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { GetUserUseCase } from "../../application/use-cases/GetUserUseCase";
import { RequestPasswordResetUseCase } from "../../application/use-cases/RequestPasswordResetUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { GmailEmailService } from "../../infrastructure/email/GmailEmailService";
import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository";

// Instanciamos nuestras dependencias (inyección de dependencias manual)
const userRepository = new MongoUserRepository();
const emailService = new GmailEmailService();

const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserUseCase = new GetUserUseCase(userRepository);
const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
  userRepository,
  emailService
);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);

export const resolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      return await getUserUseCase.execute(id);
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      {
        name,
        email,
        password,
      }: { name: string; email: string; password: string }
    ) => {
      return await createUserUseCase.execute(name, email, password);
    },
    requestPasswordReset: async (_: any, { email }: { email: string }) => {
      return await requestPasswordResetUseCase.execute(email);
    },
    resetPassword: async (
      _: any,
      { token, newPassword }: { token: string; newPassword: string }
    ) => {
      return await resetPasswordUseCase.execute(token, newPassword);
    },
  },
};
