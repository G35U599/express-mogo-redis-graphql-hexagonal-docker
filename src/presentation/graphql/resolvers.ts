import { MongoUserRepository } from "../../infraestructure/repositories/MongoUserRepository";
import { CreateUserUseCase } from "../../useCases/CreateUserUseCase";
import { GetUserUseCase } from "../../useCases/GetUserUseCase";

// Instanciamos nuestras dependencias (Inyección de dependencias manual)
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
