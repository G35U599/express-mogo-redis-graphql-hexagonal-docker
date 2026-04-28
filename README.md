# node-express-GraphQL-MongoDB-Redis-Hexagonal

API GraphQL escrita en TypeScript con una estructura inspirada en arquitectura hexagonal.  
El proyecto expone un flujo simple de usuarios, persiste datos en MongoDB y usa Redis como caché de lectura.

> Estado actual: es una base pequeña, funcional para aprendizaje y evolución, no una plantilla productiva cerrada.

## Stack

- Node.js 20+
- TypeScript 6
- Apollo Server 5
- GraphQL
- MongoDB + Mongoose
- Redis
- Docker + Docker Compose

## Arquitectura

La estructura del proyecto separa responsabilidades en capas:

```text
src
├── application
│   └── use-cases
│       ├── CreateUserUseCase.ts
│       └── GetUserUseCase.ts
├── domain
│   ├── entities
│   │   └── User.ts
│   └── repositories
│       └── IUserRepository.ts
├── infrastructure
│   ├── db
│   │   ├── mongoose.ts
│   │   └── redis.ts
│   └── repositories
│       └── MongoUserRepository.ts
├── presentation
│   └── graphql
│       ├── resolvers.ts
│       └── schema.ts
└── index.ts
```

### Responsabilidad de cada capa

- **application**: casos de uso y orquestación del sistema.
- **domain**: entidades y contratos del negocio.
- **infrastructure**: detalles técnicos concretos, como MongoDB y Redis.
- **presentation**: exposición del sistema vía GraphQL.
- **index.ts**: composición y arranque de la app.

## Flujo actual

### `createUser`

1. El resolver GraphQL recibe `name` y `email`.
2. Ejecuta `CreateUserUseCase`.
3. El caso de uso delega en `IUserRepository`.
4. `MongoUserRepository` persiste el usuario en MongoDB.

### `getUser`

1. El resolver GraphQL recibe `id`.
2. Ejecuta `GetUserUseCase`.
3. El caso de uso busca primero en Redis.
4. Si encuentra el usuario en caché, lo devuelve.
5. Si no lo encuentra, consulta MongoDB.
6. Si Mongo responde, guarda el resultado en Redis por 1 hora.

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
  createUser(name: String!, email: String!): User
}
```

### Ejemplos

#### Crear usuario

```graphql
mutation {
  createUser(name: "Ada Lovelace", email: "ada@example.com") {
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

## Variables de entorno

El proyecto requiere estas variables:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/app
REDIS_URL=redis://localhost:6379
```

### Nota importante

- Cuando corrés la app **fuera de Docker**, usás `localhost`.
- Cuando corrés la app **dentro de Docker Compose**, la app usa hostnames internos:
  - `mongodb`
  - `redis`

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

### 3. Levantar MongoDB y Redis

```bash
docker compose up mongodb redis
```

### 4. Levantar la app

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

Esto alinea la resolución de módulos con Node moderno y evita problemas de editor con dependencias como `dotenv`.

## Decisiones técnicas actuales

### 1. Capa de aplicación explícita

Los casos de uso viven dentro de `src/application/use-cases`.  
Eso deja claro que su responsabilidad es orquestar el sistema, no modelar el dominio ni resolver infraestructura.

### 2. Apollo Server standalone

La app hoy arranca con `startStandaloneServer` de Apollo Server 5.  
Eso significa que el runtime real actual no monta Express como middleware principal, aunque `express` siga instalado como dependencia.

### 3. Validación temprana de envs

`MONGO_URI` y `REDIS_URL` se validan al inicializar los adapters de infraestructura.  
Si faltan, la app falla rápido.

### 4. Caché de lectura

`GetUserUseCase` usa Redis como caché de lectura para `getUser`.

## Limitaciones actuales

Acá no te voy a vender humo:

- no hay tests automatizados reales
- no hay pipeline de build productivo
- el `Dockerfile` actual es de desarrollo, no multi-stage de producción
- la composición de dependencias está hecha manualmente en `resolvers.ts`
- el modelo de Mongoose vive en el mismo archivo que la conexión Mongo

## Próximos pasos recomendados

Si querés llevar este proyecto a un siguiente nivel, yo priorizaría así:

1. **Agregar tests**
2. **Separar configuración/env en un módulo dedicado**
3. **Crear build productiva**
4. **Pasar a un Dockerfile multi-stage**
5. **Mejorar composición de dependencias**
6. **Separar schemas/modelos de la conexión de base**

## Archivos principales

- `src/index.ts`: arranque de la aplicación.
- `src/application/use-cases/CreateUserUseCase.ts`: caso de uso de escritura.
- `src/application/use-cases/GetUserUseCase.ts`: caso de uso de lectura con caché.
- `src/domain/entities/User.ts`: entidad de dominio.
- `src/domain/repositories/IUserRepository.ts`: puerto del repositorio.
- `src/infrastructure/db/mongoose.ts`: conexión a MongoDB + modelo.
- `src/infrastructure/db/redis.ts`: cliente Redis.
- `src/infrastructure/repositories/MongoUserRepository.ts`: adapter de persistencia.
- `src/presentation/graphql/schema.ts`: schema GraphQL.
- `src/presentation/graphql/resolvers.ts`: resolvers GraphQL.
- `docker-compose.yml`: stack local completa.
- `Dockerfile`: runtime containerizado de desarrollo.

## Licencia

ISC
