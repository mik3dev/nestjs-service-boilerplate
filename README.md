# NestJS Service Boilerplate

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A modern, production-ready NestJS boilerplate with authentication, MongoDB integration via repository pattern, and comprehensive testing setup.</p>

## Features

- ✅ Ready-to-use authentication with [nestjs-authentication-module](https://www.npmjs.com/package/nestjs-authentication-module) for JWT validation
- 📦 MongoDB integration with [nestjs-mongoose-repository-module](https://www.npmjs.com/package/nestjs-mongoose-repository-module) implementing the repository pattern
- 🔍 Built-in health check endpoints using @nestjs/terminus
- 🐳 Production-ready Dockerfile with optimizations and security best practices
- 📋 Comprehensive unit and e2e testing setup with Jest
- 🧹 Modern ESLint and Prettier configuration

## Quick Start

The fastest way to start a new project is with [degit](https://github.com/Rich-Harris/degit). Make sure you have degit installed from npmjs.com:

```bash
# Install degit globally (if not already installed)
npm install -g degit

# Create a new project from the boilerplate
degit mik3dev/nestjs-service-boilerplate my-new-project
cd my-new-project
npm install
npm run start:dev
```

Alternatively, you can use npx without installing degit globally:

```bash
npx degit mik3dev/nestjs-service-boilerplate my-new-project
cd my-new-project
npm install
npm run start:dev
```

## Installation

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server
NODE_ENV=development
PORT=3000       # default
API_PREFIX=api  # default

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nestjs-boilerplate

# Authentication (for JWT validation)
JWT_ISSUER="https://your-authentication-service.com"
JWT_AUDIENCE="api"

# jwks url or public key 
JWKS_URL="https://your-authentication-service.com/api/.well-known/jwks.json"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----"
```

## Docker Support

This boilerplate includes a production-ready Dockerfile with:
- Multi-stage builds for smaller image size
- Non-root user for security
- Proper dependency handling and caching
- Health check configuration

```bash
# Build the Docker image
docker build -t nestjs-boilerplate .

# Run container
docker run -p 3000:3000 nestjs-boilerplate
```

## Health Checks

The application provides two health check endpoints:

- `/health` - Comprehensive health check including MongoDB, disk, and memory checks
- `/health/liveness` - Simple liveness check for container orchestration platforms

## Testing

The boilerplate includes a comprehensive testing setup:

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

## Project Structure

```
.
├── src/
│   ├── app.controller.ts    # Main application controller
│   ├── app.module.ts        # Main application module
│   ├── app.service.ts       # Main application service
│   ├── health/              # Health check module
│   ├── main.ts              # Application entry point
│   └── config/              # Application configuration
├── test/                    # End-to-end tests
├── Dockerfile               # Docker configuration
└── nest-cli.json           # NestJS configuration
```

## Authentication

This boilerplate uses [nestjs-authentication-module](https://www.npmjs.com/package/nestjs-authentication-module) to validate JWTs. To protect a route:

```typescript
import { UseGuards } from '@nestjs/common';
import { GetUser, JwtClientAuthGuard } from 'nestjs-authentication-module';
import { UserPayload } from 'src/interfaces/user-payload.interface';

@UseGuards(JwtClientAuthGuard)
@Get('protected-route')
async getProtectedData(@GetUser<UserPayload>() user: UserPayload) {
  // Only authenticated users can access this
}
```

## MongoDB Repository Pattern

For data access, the boilerplate uses [nestjs-mongoose-repository-module](https://www.npmjs.com/package/nestjs-mongoose-repository-module) which provides a clean repository pattern implementation:

Module:
```typescript
@Module({
  imports: [
    // For feature
    MongooseRepositoryModule.forFeature({
      name: 'Entity',
      schema: EntitySchema,
    }),
    // For feature async
    MongooseRepositoryModule.forFeatureAsync({
      name: 'Entity',
      imports: [],
      inject: [],
      useFactory: () => {
        const schema = EntitySchema;
        // Some hooks
        return schema;
      },
    }),
  ],
  providers: [SomeService],
})
export class SomeModule {}
```

Service:
```typescript
@Injectable()
export class SomeService {
  constructor(
    @InjectRepository('EntityName')
    private readonly repository: RepositoryService<EntityDocument>,
  ) {}

  async findAll(filter: FilterQuery<EntityDocument>) {
    return this.repository.find(filter);
  }
}
```

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests to the GitHub repository.

## License

This project is [MIT licensed](LICENSE).

## Links

- [GitHub Repository](https://github.com/mik3dev/nestjs-service-boilerplate)
- [NestJS Documentation](https://docs.nestjs.com/)

