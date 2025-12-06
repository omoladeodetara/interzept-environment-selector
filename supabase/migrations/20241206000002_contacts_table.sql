-- Contacts table for customer contact records

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  external_id TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_id, external_id)
);

CREATE INDEX idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX idx_contacts_external_id ON contacts(external_id);
CREATE INDEX idx_contacts_email ON contacts(email);
