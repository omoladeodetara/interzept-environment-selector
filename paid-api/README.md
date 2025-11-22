# Paid.ai API Documentation

This folder contains the converted API documentation for Paid.ai.

## Files

- **`openapi.yaml`** - OpenAPI 3.0 specification with all endpoints, schemas, and descriptions
- **`requests.http`** - HTTP request file for REST Client extension testing

## Quick Start

### 1. Set Your API Token

Edit `requests.http` and replace `YOUR_API_TOKEN_HERE` with your actual token:

```
@token = your_actual_token
```

### 2. Test with REST Client

Open `requests.http` in VS Code and click "Send Request" above any request.

### 3. Test with Thunder Client

Import the OpenAPI spec:
1. Open Thunder Client sidebar
2. Click "Collections" → "Import"
3. Select `openapi.yaml`

### 4. Preview API Documentation

With **Swagger Viewer** or **Redocly** installed:
- Right-click `openapi.yaml`
- Select "Preview Swagger" or "Preview OpenAPI"

## API Overview

### Base URL
```
https://api.agentpaid.io/api/v1
```

### Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer YOUR_TOKEN
```

### Available Resources

#### Customers
- List, create, retrieve, update, delete customers
- Support for both internal UUID and external custom IDs

#### Contacts
- Manage contact information for customer accounts
- Link contacts to customer accounts

#### Agents
- Define AI agents with pricing configurations
- Support for various pricing models (flat, tiered, graduated, volume)
- Configurable billing frequencies (monthly, quarterly, annually)

#### Orders
- Create and manage orders for customers
- Add/remove order lines linking to agents
- Activate draft orders for billing

#### Usage Signals
- Record real-time agent usage events
- Attach custom metadata for tracking
- Events are immutable and link to orders

## Example Workflows

### 1. Create a Customer and Order

```http
# 1. Create customer
POST /customers
# Save the returned customer ID

# 2. Create an agent with pricing
POST /agents

# 3. Create an order
POST /orders
# Link to customer accountId

# 4. Add order lines
PUT /orders/{orderId}/lines
# Link to agent IDs

# 5. Activate order
POST /orders/{orderId}/activate
```

### 2. Track Agent Usage

```http
# Record usage signals
POST /usage/signals
{
  "signal": {
    "agentId": "agent_1",
    "eventName": "message_sent",
    "customerId": "customer_123",
    "data": {
      "model": "gpt4",
      "tokens": 450
    }
  }
}
```

## Support

For full documentation, visit: https://docs.paid.ai
