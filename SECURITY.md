# Security Guidelines for Last Price

This document outlines security considerations and best practices for the Last Price multi-tenant pricing optimization system.

## Critical Security Items

### 1. API Key Encryption

**Current State**: API keys are stored in plain text in the database (marked with TODOs).

**Required for Production**: 

#### Option A: Application-Level Encryption (Recommended for Flexibility)

Use Node.js crypto module or a dedicated encryption library:

```javascript
const crypto = require('crypto');

// Configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes for AES-256

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return iv:authTag:encrypted format
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptApiKey(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

Update `database.js`:

```javascript
async function createTenant({ name, email, mode, paidApiKey = null, plan = 'free', metadata = {} }) {
  const encryptedKey = paidApiKey ? encryptApiKey(paidApiKey) : null;
  
  const query = `...`;
  const values = [name, email, mode, encryptedKey, plan, metadata];
  // ...
}

async function getTenant(tenantId) {
  const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
  const tenant = result.rows[0];
  
  if (tenant && tenant.paid_api_key) {
    tenant.paid_api_key = decryptApiKey(tenant.paid_api_key);
  }
  
  return tenant;
}
```

#### Option B: Database-Level Encryption with pgcrypto

Enable pgcrypto extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Modify queries to use `pgp_sym_encrypt` and `pgp_sym_decrypt`:

```sql
-- Insert with encryption
INSERT INTO tenants (name, email, mode, paid_api_key, plan)
VALUES ($1, $2, $3, pgp_sym_encrypt($4, 'encryption_passphrase'), $5);

-- Select with decryption
SELECT id, name, email, mode, 
       pgp_sym_decrypt(paid_api_key::bytea, 'encryption_passphrase') as paid_api_key,
       plan
FROM tenants WHERE id = $1;
```

#### Option C: Use a Key Management Service (KMS)

For enterprise deployments, use AWS KMS, Azure Key Vault, or Google Cloud KMS:

- Store encrypted data encryption keys (DEKs) in the database
- Decrypt DEKs using KMS on-demand
- Use DEKs to encrypt/decrypt API keys
- Provides audit logs, key rotation, and access controls

### 2. Webhook Signature Verification

**Current State**: Webhook verification is implemented but not active by default.

**Required for Production**:

1. Set `ENABLE_WEBHOOK_VERIFICATION=true`
2. Configure `WEBHOOK_SECRET` from Paid.ai dashboard
3. Implement signature verification (see example in `server.js`)

```javascript
const crypto = require('crypto');

// In webhook handler
const signature = req.headers['x-paid-signature'];
const computedSignature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== computedSignature) {
  return res.status(401).json({ error: 'Invalid webhook signature' });
}
```

### 3. Database Connection Security

**Required for Production**:

- Use SSL/TLS for database connections
- Enable connection encryption in PostgreSQL
- Configure `pg` client with SSL:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Set to true with proper CA certificate
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString()
  }
});
```

### 4. Input Validation

**Current State**: Basic validation is implemented.

**Best Practices**:

- All user inputs are validated
- SQL injection prevention via parameterized queries ✓
- XSS prevention via proper output encoding ✓
- CSRF protection (implement tokens for state-changing operations)

### 5. Rate Limiting

**Required for Production**:

Install and configure express-rate-limit:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);

// Stricter limit for tenant creation
const createTenantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 tenant creations per hour per IP
  message: 'Too many tenant creation attempts, please try again later.'
});

app.use('/api/tenants', createTenantLimiter);
```

### 6. Authentication & Authorization

**Required for Production**:

Implement JWT-based authentication:

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function authenticateTenant(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Apply to protected routes
app.use('/api/tenants', authenticateTenant);
```

### 7. CORS Configuration

**Required for Production**:

```bash
npm install cors
```

```javascript
const cors = require('cors');

// Allow specific origins only
app.use(cors({
  origin: ['https://yourapp.com', 'https://app.yourapp.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 8. HTTPS Enforcement

**Required for Production**:

- Use a reverse proxy (Nginx, Caddy) to handle HTTPS
- Redirect HTTP to HTTPS
- Set secure headers:

```javascript
const helmet = require('helmet');
app.use(helmet());

// Force HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### 9. Secrets Management

**Best Practices**:

1. Never commit secrets to version control
2. Use environment variables for all secrets
3. Use a secrets management service:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - Docker secrets

4. Rotate secrets regularly
5. Use different secrets for each environment

### 10. Logging & Monitoring

**Required for Production**:

- Log all authentication attempts
- Log all tenant creation/modification
- Monitor for unusual patterns (many failed logins, rapid API calls)
- Use a logging service (CloudWatch, Datadog, Sentry)
- Never log sensitive data (passwords, API keys, tokens)

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Sanitize logs - never log sensitive fields
function sanitizeForLog(obj) {
  const sanitized = { ...obj };
  delete sanitized.paid_api_key;
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
}

logger.info('Tenant created', sanitizeForLog(tenant));
```

## Security Checklist for Production

### Pre-Deployment

- [ ] Implement API key encryption (application-level or database-level)
- [ ] Enable webhook signature verification
- [ ] Configure SSL/TLS for database connections
- [ ] Implement authentication (JWT or similar)
- [ ] Add rate limiting to all endpoints
- [ ] Configure CORS with specific allowed origins
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure security headers (helmet.js)
- [ ] Implement CSRF protection
- [ ] Set up comprehensive logging (without sensitive data)
- [ ] Configure error handling (don't expose stack traces)
- [ ] Review and test input validation
- [ ] Set up monitoring and alerting
- [ ] Configure database backups
- [ ] Document incident response procedures

### Regular Maintenance

- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Audit database access permissions
- [ ] Test backup restoration procedures
- [ ] Review and update security policies
- [ ] Conduct security assessments
- [ ] Keep OpenAPI spec up to date

## Incident Response

If a security breach is suspected:

1. **Immediate Actions**:
   - Rotate all API keys and secrets
   - Review access logs for unauthorized activity
   - Notify affected tenants
   - Document the incident

2. **Investigation**:
   - Identify the scope of the breach
   - Determine what data was accessed
   - Review system logs and audit trails

3. **Remediation**:
   - Patch vulnerabilities
   - Implement additional security controls
   - Update documentation and procedures

4. **Communication**:
   - Notify users as required by law
   - Provide clear guidance on next steps
   - Be transparent about the incident

## Compliance

Depending on your region and industry, you may need to comply with:

- **GDPR** (EU): Data protection and privacy
- **CCPA** (California): Consumer privacy rights
- **PCI DSS**: Payment card data security (if handling cards)
- **SOC 2**: Security, availability, and confidentiality
- **HIPAA**: Healthcare data (if applicable)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Support

For security concerns or to report vulnerabilities:
- Email: security@lastprice.example.com
- Use responsible disclosure practices
- Allow reasonable time for fixes before public disclosure
