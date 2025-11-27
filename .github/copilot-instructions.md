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
