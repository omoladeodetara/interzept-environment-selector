# Contributing Guidelines

Thank you for your interest in contributing to the Last Price A/B Testing project!

## API Development Guidelines

### OpenAPI-First Development

This project follows an **OpenAPI-first** approach to API development. When adding or modifying API endpoints:

#### OpenAPI Specification Locations

The repository contains OpenAPI specifications at:

- `ab-testing-server/openapi.yaml` - A/B Testing Server API specification
- `paid-api/openapi.yaml` - Paid.ai API specification

#### Guidelines for API Code

1. **Prefer Code Generation Over Hand-Writing**
   
   When creating API clients or server stubs, prefer generating code from the OpenAPI specifications rather than hand-writing endpoint implementations.

   **Recommended code generation tools:**
   - **[OpenAPI Generator](https://openapi-generator.tech/)** - Generates clients and servers for 50+ languages
   - **[swagger-codegen](https://swagger.io/tools/swagger-codegen/)** - Official Swagger code generator
   - **[oapi-codegen](https://github.com/deepmap/oapi-codegen)** - Go-specific OpenAPI code generator

   **Example using OpenAPI Generator:**
   ```bash
   # Generate a Node.js/Express server stub
   npx @openapitools/openapi-generator-cli generate \
     -i ab-testing-server/openapi.yaml \
     -g nodejs-express-server \
     -o generated/server

   # Generate a TypeScript client
   npx @openapitools/openapi-generator-cli generate \
     -i paid-api/openapi.yaml \
     -g typescript-fetch \
     -o generated/client
   ```

2. **Avoid Duplicating OpenAPI-Defined Endpoints**
   
   If an endpoint is defined in an OpenAPI specification, avoid hand-writing the request/response handling code. Instead:
   - Use generated types for request and response validation
   - Implement only the business logic, not the HTTP layer
   - Keep the OpenAPI spec as the source of truth

3. **Update OpenAPI Spec First**
   
   When adding new endpoints:
   1. First, add the endpoint to the appropriate OpenAPI specification
   2. Validate the spec using tools like `swagger-cli validate`
   3. Generate or update the corresponding code
   4. Implement the business logic

4. **No Spec? Ask First**
   
   If you need to create API client or server code and no OpenAPI specification exists:
   - Open an issue or discussion asking about the preferred approach
   - Consider creating an OpenAPI specification first
   - Document why hand-written code is necessary if generation isn't feasible

### Existing Hand-Written Code

The current `ab-testing-server/server.js` was implemented before these guidelines were established. Future modifications should:
- Keep the OpenAPI specification (`ab-testing-server/openapi.yaml`) in sync
- Consider migrating to generated code when making significant changes
- Use the OpenAPI spec for documentation and client generation

## General Contribution Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test your changes locally
5. Submit a pull request

### Code Style

- Follow existing code style and conventions
- Include comments for complex logic
- Update documentation when adding features

### Testing

- Test all API endpoints using the Swagger UI at `/api-docs`
- Verify OpenAPI specification validity before submitting PRs

### Documentation

- Update README files when adding features
- Keep OpenAPI specifications up to date
- Document any non-obvious design decisions

## Questions?

If you have questions about contributing, please open an issue or discussion.
