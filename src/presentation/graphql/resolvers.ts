import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { GetUserUseCase } from "../../application/use-cases/GetUserUseCase";
import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository";

// Instanciamos nuestras dependencias (inyección de dependencias manual)
const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserUseCase = new GetUserUseCase(userRepository);

export const resolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      return await getUserUseCase.execute(id);
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      { name, email }: { name: string; email: string }
    ) => {
      return await createUserUseCase.execute(name, email);
    },
  },
};
