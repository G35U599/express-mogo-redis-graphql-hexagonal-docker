export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}
