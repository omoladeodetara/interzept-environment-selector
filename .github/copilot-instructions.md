# Copilot Custom Instructions for Last Price

## OpenAPI-First Development

When you suggest or write code for this project, prefer generating API clients or server stubs from the repository's OpenAPI specification rather than hand-writing endpoint client/server code.

### OpenAPI Specification Locations

Look for OpenAPI specs at these locations:
- `ab-testing-server/openapi.yaml` - A/B Testing Server API
- `paid-api/openapi.yaml` - Paid.ai API specification

### Guidelines

1. **Prefer Code Generation**: When creating API clients or server stubs, generate code from the OpenAPI specifications rather than hand-writing endpoint implementations.

2. **Avoid Duplication**: Do not produce hand-written endpoint implementations that duplicate what can be generated from the OpenAPI specs.

3. **Ask Before Hand-Writing**: If no OpenAPI spec is found for the API you need to work with, ask a clarifying question before creating client/server code.

4. **Keep Specs Updated**: When adding new endpoints, update the OpenAPI specification first, then generate or update the corresponding code.

### Recommended Code Generation Tools

- **OpenAPI Generator**: `npx @openapitools/openapi-generator-cli generate -i <spec.yaml> -g <generator> -o <output>`
- **swagger-codegen**: For Swagger/OpenAPI code generation
- **oapi-codegen**: For Go-specific OpenAPI code generation

### Example Commands

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
# Copilot Instructions

## API Client and Server Code Generation

When suggesting or writing code for this project:

### OpenAPI Specification Preference

**Always prefer generating API clients or server stubs from the repository's OpenAPI specification** rather than hand-writing endpoint client/server code.

### OpenAPI Specification Locations

Check the following common locations for an OpenAPI specification:
- `openapi.yaml`
- `openapi.yml`
- `spec/openapi.yaml`
- `api/openapi.yaml`

### Guidelines

1. **If an OpenAPI spec exists:**
   - Use code generation tools to create API clients and server stubs from the specification
   - Avoid producing hand-written endpoint implementations that duplicate what can be generated
   - Leverage the spec for consistent type definitions and request/response structures

2. **If no OpenAPI spec is found:**
   - Ask a clarifying question before creating client/server code
   - Confirm whether the user wants to create an OpenAPI spec first, or proceed with hand-written code
