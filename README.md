# node-express-GraphQL-MongoDB-Redis-Hexagonal

API GraphQL escrita en TypeScript con una estructura inspirada en arquitectura hexagonal.  
El proyecto expone un flujo simple de usuarios, persiste datos en MongoDB, usa Redis como caché de lectura y ahora incluye un flujo básico de **recuperación de contraseña por email** con Gmail.

> Estado actual: es una base pequeña, funcional para aprendizaje y evolución, no una plantilla productiva cerrada.

## Stack

- Node.js 20+
- TypeScript 6
- Apollo Server 5
- GraphQL
- MongoDB + Mongoose
- Redis
- Nodemailer
- Docker + Docker Compose

## Arquitectura

La estructura del proyecto separa responsabilidades en capas:

```text
src
├── application
│   ├── ports
│   │   └── IEmailService.ts
│   └── use-cases
│       ├── CreateUserUseCase.ts
│       ├── GetUserUseCase.ts
│       ├── RequestPasswordResetUseCase.ts
│       └── ResetPasswordUseCase.ts
├── domain
│   ├── entities
│   │   └── User.ts
│   └── repositories
│       └── IUserRepository.ts
├── infrastructure
│   ├── db
│   │   ├── mongoose.ts
│   │   └── redis.ts
│   ├── email
│   │   └── GmailEmailService.ts
│   ├── repositories
│   │   └── MongoUserRepository.ts
│   └── security
│       └── password.ts
├── presentation
│   └── graphql
│       ├── resolvers.ts
│       └── schema.ts
└── index.ts
```

### Responsabilidad de cada capa

- **application**: casos de uso y puertos del sistema.
- **domain**: entidades y contratos del negocio.
- **infrastructure**: detalles técnicos concretos, como MongoDB, Redis, Gmail y hashing.
- **presentation**: exposición del sistema vía GraphQL.
- **index.ts**: composición y arranque de la app.

## Flujos principales

### `createUser`

1. El resolver GraphQL recibe `name`, `email` y `password`.
2. `CreateUserUseCase` valida reglas mínimas.
3. Hashea la contraseña con `crypto.scrypt`.
4. `MongoUserRepository` persiste el usuario en MongoDB.

### `getUser`

1. El resolver GraphQL recibe `id`.
2. Ejecuta `GetUserUseCase`.
3. Busca primero en Redis.
4. Si encuentra el usuario en caché, lo devuelve.
5. Si no lo encuentra, consulta MongoDB.
6. Si Mongo responde, guarda el resultado en Redis por 1 hora.

### `requestPasswordReset`

1. El resolver recibe `email`.
2. `RequestPasswordResetUseCase` busca el usuario.
3. Si existe:
   - genera token aleatorio
   - guarda **solo el hash** del token en MongoDB
   - define expiración de 1 hora
   - envía email por Gmail con un enlace de reset
4. Si no existe, responde igual `true` para no filtrar existencia de cuentas.

### `resetPassword`

1. El resolver recibe `token` y `newPassword`.
2. `ResetPasswordUseCase` hashea el token recibido.
3. Busca un usuario con token válido y no expirado.
4. Hashea la nueva contraseña.
5. Actualiza la contraseña y limpia los campos de reset.

## API GraphQL

### Schema actual

```graphql
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  getUser(id: ID!): User
}

type Mutation {
  createUser(name: String!, email: String!, password: String!): User
  requestPasswordReset(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
}
```

### Ejemplos

#### Crear usuario

```graphql
mutation {
  createUser(
    name: "Ada Lovelace"
    email: "ada@example.com"
    password: "supersecreta123"
  ) {
    id
    name
    email
  }
}
```

#### Obtener usuario

```graphql
query {
  getUser(id: "USER_ID") {
    id
    name
    email
  }
}
```

#### Solicitar recuperación de contraseña

```graphql
mutation {
  requestPasswordReset(email: "ada@example.com")
}
```

#### Restablecer contraseña

```graphql
mutation {
  resetPassword(
    token: "TOKEN_RECIBIDO_POR_EMAIL"
    newPassword: "nuevaClave123"
  )
}
```

## Variables de entorno

El proyecto requiere estas variables:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/app
REDIS_URL=redis://localhost:6379
PASSWORD_RESET_BASE_URL=http://localhost:3000/reset-password
GMAIL_USER=tu-cuenta@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres
```

### Nota importante sobre Gmail

Según la ayuda oficial de Google, para usar **App Passwords**:

- necesitás **2-Step Verification** activado
- el app password es de **16 caracteres**
- Google no recomienda esto como estrategia ideal para integraciones nuevas; OAuth 2.0 es mejor

En este proyecto se eligió **Gmail + App Password** porque es la forma más simple para aprendizaje o entornos chicos.

### Nota importante sobre URLs

- Cuando corrés la app **fuera de Docker**, usás `localhost`.
- Cuando corrés la app **dentro de Docker Compose**, Mongo y Redis usan hostnames internos:
  - `mongodb`
  - `redis`
- `PASSWORD_RESET_BASE_URL` debe apuntar al frontend o pantalla donde el usuario cambiará su contraseña.

## Ejecución local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear `.env`

Podés copiar `.env.example` y completar valores:

```bash
cp .env.example .env
```

### 3. Configurar Gmail

Para esta implementación necesitás:

1. activar verificación en dos pasos en tu cuenta Google
2. generar un **App Password**
3. ponerlo en `GMAIL_APP_PASSWORD`

### 4. Levantar MongoDB y Redis

```bash
docker compose up mongodb redis
```

### 5. Levantar la app

```bash
npm run dev
```

La API queda disponible en:

```text
http://localhost:4000/
```

## Ejecución con Docker Compose

Para levantar app + MongoDB + Redis:

```bash
docker compose up
```

Antes de eso, asegurate de tener definidas:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `PASSWORD_RESET_BASE_URL`

Servicios:

- App: `http://localhost:4000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## Docker

### `Dockerfile`

El proyecto incluye un `Dockerfile` orientado a desarrollo:

- base `node:20-alpine`
- instala dependencias con `npm ci`
- expone puerto `4000`
- arranca con `npm run dev`

### `.dockerignore`

Excluye archivos innecesarios del contexto de build, por ejemplo:

- `node_modules`
- `.git`
- `.env`
- `dist`

## Scripts disponibles

```json
{
  "dev": "nodemon src/index.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## Configuración TypeScript

El proyecto usa:

- `module: nodenext`
- `moduleResolution: nodenext`
- `target: es2020`
- `strict: true`

## Decisiones técnicas actuales

### 1. Capa de aplicación explícita

Los casos de uso viven dentro de `src/application/use-cases`.

### 2. Carga temprana de envs

La app usa `import "dotenv/config"` al inicio del bootstrap para que las validaciones de variables de entorno no fallen por orden de imports.

### 3. Contraseñas hasheadas

Las contraseñas no se guardan en texto plano.  
Se hashean con `crypto.scrypt`.

### 4. Tokens de reset hasheados

El token enviado por email **no** se guarda en crudo en la base.  
Se guarda solo su hash SHA-256, con expiración.

### 5. Gmail como transporte SMTP

Se usa Nodemailer con `service: "gmail"` y App Password.  
Esto es cómodo para empezar, pero no es lo ideal para producción seria.

## Limitaciones actuales

Acá no te voy a vender humo:

- no hay tests automatizados reales
- no hay login todavía
- no hay verificación de contraseña implementada en un flujo de autenticación
- no hay cola de correos ni retries
- el `Dockerfile` actual es de desarrollo, no multi-stage de producción
- la composición de dependencias está hecha manualmente en `resolvers.ts`
- el modelo de Mongoose vive en el mismo archivo que la conexión Mongo
- Gmail no es un proveedor ideal para workloads productivos

## Próximos pasos recomendados

1. **Implementar login**
2. **Agregar verifyPassword al flujo real de auth**
3. **Separar configuración/env en un módulo dedicado**
4. **Agregar tests**
5. **Mover emails a templates dedicados**
6. **Usar cola async para correos**
7. **Migrar de Gmail a proveedor más serio si el proyecto crece**

## Archivos principales

- `src/index.ts`: arranque de la aplicación.
- `src/application/ports/IEmailService.ts`: puerto de envío de emails.
- `src/application/use-cases/CreateUserUseCase.ts`: alta de usuario con password hasheada.
- `src/application/use-cases/GetUserUseCase.ts`: lectura con caché.
- `src/application/use-cases/RequestPasswordResetUseCase.ts`: solicitud de recuperación.
- `src/application/use-cases/ResetPasswordUseCase.ts`: cambio de contraseña por token.
- `src/domain/entities/User.ts`: entidad pública de usuario.
- `src/domain/repositories/IUserRepository.ts`: contrato del repositorio.
- `src/infrastructure/db/mongoose.ts`: conexión y schema de usuario.
- `src/infrastructure/db/redis.ts`: cliente Redis.
- `src/infrastructure/email/GmailEmailService.ts`: envío por Gmail.
- `src/infrastructure/repositories/MongoUserRepository.ts`: adapter Mongo.
- `src/infrastructure/security/password.ts`: hashing con scrypt.
- `src/presentation/graphql/schema.ts`: schema GraphQL.
- `src/presentation/graphql/resolvers.ts`: wiring de casos de uso.
- `docker-compose.yml`: stack local completa.
- `Dockerfile`: runtime containerizado de desarrollo.

## Licencia

ISC
