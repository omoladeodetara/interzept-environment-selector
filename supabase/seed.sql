-- Dev seed data for local Supabase. Safe to re-run; guarded by existence checks.

DO $$
DECLARE
  demo_tenant UUID;
  byok_tenant UUID;
  demo_agent UUID;
  demo_customer UUID;
  demo_contact UUID;
  demo_order UUID;
  demo_payment UUID;
  demo_invoice UUID;
  demo_dispute UUID;
  demo_credit UUID;
  demo_cost UUID;
  demo_usage_signal UUID;
  demo_experiment UUID;
  demo_assignment UUID;
  demo_view UUID;
  demo_conversion UUID;
  demo_recommendation UUID;
  demo_usage_row UUID;
  demo_customer2 UUID;
  demo_contact2 UUID;
  demo_order2 UUID;
  demo_payment2 UUID;
  demo_invoice2 UUID;
  demo_usage_signal2 UUID;
  demo_cost2 UUID;
  byok_agent UUID;
  byok_customer UUID;
  byok_contact UUID;
  byok_order UUID;
  byok_payment UUID;
  byok_invoice UUID;
  byok_usage_signal UUID;
  byok_usage_row UUID;
  byok_experiment UUID;
  byok_assignment UUID;
  byok_view UUID;
  byok_conversion UUID;
  byok_recommendation UUID;
BEGIN
  -- Ensure demo tenants exist (aligns with migration inserts)
  SELECT id INTO demo_tenant FROM tenants WHERE email = 'demo@example.com';
  IF demo_tenant IS NULL THEN
    INSERT INTO tenants (name, email, mode, plan)
    VALUES ('Demo Company', 'demo@example.com', 'managed', 'starter')
    RETURNING id INTO demo_tenant;
  END IF;

  SELECT id INTO byok_tenant FROM tenants WHERE email = 'byok@example.com';
  IF byok_tenant IS NULL THEN
    INSERT INTO tenants (name, email, mode, plan, paid_api_key)
    VALUES ('BYOK Company', 'byok@example.com', 'byok', 'pro', 'sk_test_example_key_encrypted')
    RETURNING id INTO byok_tenant;
  END IF;

  -- Demo agent
  SELECT id INTO demo_agent FROM agents WHERE tenant_id = demo_tenant AND name = 'Demo Pricing Agent';
  IF demo_agent IS NULL THEN
    INSERT INTO agents (
      tenant_id, external_id, name, description, pricing_model, base_price, currency, status, metadata
    ) VALUES (
      demo_tenant, 'agent-demo-001', 'Demo Pricing Agent', 'Sample agent for local testing',
      'subscription', 99.00, 'USD', 'active', '{"features": ["ab-testing", "usage-tracking"]}'::jsonb
    ) RETURNING id INTO demo_agent;
  END IF;

  -- Demo customer
  SELECT id INTO demo_customer FROM customers WHERE tenant_id = demo_tenant AND email = 'customer@example.com';
  IF demo_customer IS NULL THEN
    INSERT INTO customers (
      tenant_id, external_id, name, email, phone, status, balance, currency, metadata
    ) VALUES (
      demo_tenant, 'cust-demo-001', 'Acme Demo', 'customer@example.com', '+1-555-0100', 'active',
      0.00, 'USD', '{"tier": "starter"}'::jsonb
    ) RETURNING id INTO demo_customer;
  END IF;

  -- Second demo customer (extra coverage)
  SELECT id INTO demo_customer2 FROM customers WHERE tenant_id = demo_tenant AND email = 'customer+2@example.com';
  IF demo_customer2 IS NULL THEN
    INSERT INTO customers (
      tenant_id, external_id, name, email, phone, status, balance, currency, metadata
    ) VALUES (
      demo_tenant, 'cust-demo-002', 'Beta Demo', 'customer+2@example.com', '+1-555-0102', 'active',
      10.00, 'USD', '{"tier": "pro"}'::jsonb
    ) RETURNING id INTO demo_customer2;
  END IF;

  -- Demo contact for customer
  SELECT id INTO demo_contact FROM contacts WHERE customer_id = demo_customer AND email = 'contact@example.com';
  IF demo_contact IS NULL THEN
    INSERT INTO contacts (
      customer_id, external_id, email, phone, address, metadata
    ) VALUES (
      demo_customer, 'contact-demo-001', 'contact@example.com', '+1-555-0101',
      '{"line1": "123 Demo St", "city": "Demo City", "country": "US"}'::jsonb,
      '{"role": "billing"}'::jsonb
    ) RETURNING id INTO demo_contact;
  END IF;

  -- Demo contact for second customer
  SELECT id INTO demo_contact2 FROM contacts WHERE customer_id = demo_customer2 AND email = 'contact+2@example.com';
  IF demo_contact2 IS NULL THEN
    INSERT INTO contacts (
      customer_id, external_id, email, phone, address, metadata
    ) VALUES (
      demo_customer2, 'contact-demo-002', 'contact+2@example.com', '+1-555-0103',
      '{"line1": "456 Beta Ave", "city": "Demo City", "country": "US"}'::jsonb,
      '{"role": "technical"}'::jsonb
    ) RETURNING id INTO demo_contact2;
  END IF;

  -- Demo experiment
  SELECT id INTO demo_experiment FROM experiments WHERE tenant_id = demo_tenant AND key = 'pricing_test_001';
  IF demo_experiment IS NULL THEN
    INSERT INTO experiments (
      tenant_id, key, name, description, variants, status, start_date, metadata
    ) VALUES (
      demo_tenant,
      'pricing_test_001',
      'Demo Pricing Experiment',
      'Sample A/B test for local development',
      '[{"name":"A","price":99,"weight":0.5},{"name":"B","price":129,"weight":0.5}]'::jsonb,
      'active',
      now() - INTERVAL '1 day',
      '{"objective":"revenue"}'::jsonb
    ) RETURNING id INTO demo_experiment;
  END IF;

  -- Demo assignment
  SELECT id INTO demo_assignment FROM assignments WHERE experiment_id = demo_experiment AND user_id = 'user_demo_001';
  IF demo_assignment IS NULL THEN
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES (demo_experiment, 'user_demo_001', 'A')
    RETURNING id INTO demo_assignment;
  END IF;

  -- Second assignment for coverage
  PERFORM 1 FROM assignments WHERE experiment_id = demo_experiment AND user_id = 'user_demo_002';
  IF NOT FOUND THEN
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES (demo_experiment, 'user_demo_002', 'B')
    RETURNING id INTO demo_assignment;
  END IF;

  -- Demo view
  SELECT id INTO demo_view FROM views WHERE experiment_id = demo_experiment AND user_id = 'user_demo_001';
  IF demo_view IS NULL THEN
    INSERT INTO views (experiment_id, user_id, variant, metadata)
    VALUES (demo_experiment, 'user_demo_001', 'A', '{"source":"ui"}'::jsonb)
    RETURNING id INTO demo_view;
  END IF;

  -- Second view
  PERFORM 1 FROM views WHERE experiment_id = demo_experiment AND user_id = 'user_demo_002';
  IF NOT FOUND THEN
    INSERT INTO views (experiment_id, user_id, variant, metadata)
    VALUES (demo_experiment, 'user_demo_002', 'B', '{"source":"ui"}'::jsonb)
    RETURNING id INTO demo_view;
  END IF;

  -- Demo conversion
  SELECT id INTO demo_conversion FROM conversions WHERE experiment_id = demo_experiment AND user_id = 'user_demo_001';
  IF demo_conversion IS NULL THEN
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, paid_order_id, metadata)
    VALUES (demo_experiment, 'user_demo_001', 'A', 199.00, 'paid-order-demo-001', '{"channel":"web"}'::jsonb)
    RETURNING id INTO demo_conversion;
  END IF;

  -- Second conversion
  PERFORM 1 FROM conversions WHERE experiment_id = demo_experiment AND user_id = 'user_demo_002';
  IF NOT FOUND THEN
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, paid_order_id, metadata)
    VALUES (demo_experiment, 'user_demo_002', 'B', 149.00, 'paid-order-demo-002', '{"channel":"web"}'::jsonb)
    RETURNING id INTO demo_conversion;
  END IF;

  -- Demo order
  SELECT id INTO demo_order FROM orders WHERE tenant_id = demo_tenant AND external_id = 'order-demo-001';
  IF demo_order IS NULL THEN
    INSERT INTO orders (
      tenant_id, customer_id, agent_id, external_id, status, amount, currency, items, metadata
    ) VALUES (
      demo_tenant, demo_customer, demo_agent, 'order-demo-001', 'completed', 199.00, 'USD',
      '[{"sku":"agent-setup","qty":1,"price":199}]'::jsonb,
      '{"channel":"ui"}'::jsonb
    ) RETURNING id INTO demo_order;
  END IF;

  -- Second demo order tied to second customer
  SELECT id INTO demo_order2 FROM orders WHERE tenant_id = demo_tenant AND external_id = 'order-demo-002';
  IF demo_order2 IS NULL THEN
    INSERT INTO orders (
      tenant_id, customer_id, agent_id, external_id, status, amount, currency, items, metadata
    ) VALUES (
      demo_tenant, demo_customer2, demo_agent, 'order-demo-002', 'processing', 89.00, 'USD',
      '[{"sku":"agent-upgrade","qty":1,"price":89}]'::jsonb,
      '{"channel":"api"}'::jsonb
    ) RETURNING id INTO demo_order2;
  END IF;

  -- Demo payment
  SELECT id INTO demo_payment FROM payments WHERE tenant_id = demo_tenant AND external_id = 'payment-demo-001';
  IF demo_payment IS NULL THEN
    INSERT INTO payments (
      tenant_id, customer_id, order_id, external_id, status, amount, currency, payment_method, refunded_amount, metadata
    ) VALUES (
      demo_tenant, demo_customer, demo_order, 'payment-demo-001', 'succeeded', 199.00, 'USD', 'card', 0.00,
      '{"processor":"demo-pay"}'::jsonb
    ) RETURNING id INTO demo_payment;
  END IF;

  -- Second demo payment for second order
  SELECT id INTO demo_payment2 FROM payments WHERE tenant_id = demo_tenant AND external_id = 'payment-demo-002';
  IF demo_payment2 IS NULL THEN
    INSERT INTO payments (
      tenant_id, customer_id, order_id, external_id, status, amount, currency, payment_method, refunded_amount, metadata
    ) VALUES (
      demo_tenant, demo_customer2, demo_order2, 'payment-demo-002', 'processing', 89.00, 'USD', 'card', 0.00,
      '{"processor":"demo-pay"}'::jsonb
    ) RETURNING id INTO demo_payment2;
  END IF;

  -- Demo invoice
  SELECT id INTO demo_invoice FROM invoices WHERE tenant_id = demo_tenant AND invoice_number = 'INV-1001';
  IF demo_invoice IS NULL THEN
    INSERT INTO invoices (
      tenant_id, customer_id, external_id, invoice_number, status, amount, amount_paid, amount_due, currency, due_date, paid_at, line_items, metadata
    ) VALUES (
      demo_tenant, demo_customer, 'invoice-demo-001', 'INV-1001', 'paid', 199.00, 199.00, 0.00, 'USD',
      now() - INTERVAL '1 day', now(), '[{"description":"Agent setup","amount":199}]'::jsonb,
      '{"note":"Paid in full"}'::jsonb
    ) RETURNING id INTO demo_invoice;
  END IF;

  -- Second demo invoice
  SELECT id INTO demo_invoice2 FROM invoices WHERE tenant_id = demo_tenant AND invoice_number = 'INV-1002';
  IF demo_invoice2 IS NULL THEN
    INSERT INTO invoices (
      tenant_id, customer_id, external_id, invoice_number, status, amount, amount_paid, amount_due, currency, due_date, paid_at, line_items, metadata
    ) VALUES (
      demo_tenant, demo_customer2, 'invoice-demo-002', 'INV-1002', 'open', 89.00, 0.00, 89.00, 'USD',
      now() + INTERVAL '7 days', NULL, '[{"description":"Agent upgrade","amount":89}]'::jsonb,
      '{"note":"Awaiting payment"}'::jsonb
    ) RETURNING id INTO demo_invoice2;
  END IF;

  -- Demo dispute
  SELECT id INTO demo_dispute FROM disputes WHERE tenant_id = demo_tenant AND external_id = 'dispute-demo-001';
  IF demo_dispute IS NULL THEN
    INSERT INTO disputes (
      tenant_id, payment_id, customer_id, external_id, status, amount, currency, reason, evidence, metadata
    ) VALUES (
      demo_tenant, demo_payment, demo_customer, 'dispute-demo-001', 'open', 50.00, 'USD',
      'fraud', '{"summary":"Customer reported unauthorized charge"}'::jsonb,
      '{"priority":"medium"}'::jsonb
    ) RETURNING id INTO demo_dispute;
  END IF;

  -- Demo credit
  SELECT id INTO demo_credit FROM credits WHERE tenant_id = demo_tenant AND external_id = 'credit-demo-001';
  IF demo_credit IS NULL THEN
    INSERT INTO credits (
      tenant_id, customer_id, external_id, amount, remaining_amount, currency, status, expires_at, metadata
    ) VALUES (
      demo_tenant, demo_customer, 'credit-demo-001', 50.00, 50.00, 'USD', 'active', now() + INTERVAL '30 days',
      '{"reason":"Goodwill"}'::jsonb
    ) RETURNING id INTO demo_credit;
  END IF;

  -- Demo cost
  SELECT id INTO demo_cost FROM costs WHERE tenant_id = demo_tenant AND metadata ->> 'ref' = 'cost-demo-001';
  IF demo_cost IS NULL THEN
    INSERT INTO costs (
      tenant_id, agent_id, customer_id, order_id, cost_type, amount, currency, quantity, unit, metadata
    ) VALUES (
      demo_tenant, demo_agent, demo_customer, demo_order, 'compute', 25.00, 'USD', 1000, 'tokens',
      '{"ref":"cost-demo-001"}'::jsonb
    ) RETURNING id INTO demo_cost;
  END IF;

  -- Second demo cost
  SELECT id INTO demo_cost2 FROM costs WHERE tenant_id = demo_tenant AND metadata ->> 'ref' = 'cost-demo-002';
  IF demo_cost2 IS NULL THEN
    INSERT INTO costs (
      tenant_id, agent_id, customer_id, order_id, cost_type, amount, currency, quantity, unit, metadata
    ) VALUES (
      demo_tenant, demo_agent, demo_customer2, demo_order2, 'storage', 5.00, 'USD', 2, 'gb',
      '{"ref":"cost-demo-002"}'::jsonb
    ) RETURNING id INTO demo_cost2;
  END IF;

  -- Demo usage signal
  SELECT id INTO demo_usage_signal FROM usage_signals WHERE tenant_id = demo_tenant AND event_type = 'api_call' LIMIT 1;
  IF demo_usage_signal IS NULL THEN
    INSERT INTO usage_signals (
      tenant_id, agent_id, customer_id, event_type, properties, metadata
    ) VALUES (
      demo_tenant, demo_agent, demo_customer, 'api_call', '{"path":"/v1/prices","latency_ms":120}'::jsonb,
      '{"source":"seed"}'::jsonb
    ) RETURNING id INTO demo_usage_signal;
  END IF;

  -- Second usage signal
  SELECT id INTO demo_usage_signal2 FROM usage_signals WHERE tenant_id = demo_tenant AND event_type = 'feature_use' LIMIT 1;
  IF demo_usage_signal2 IS NULL THEN
    INSERT INTO usage_signals (
      tenant_id, agent_id, customer_id, event_type, properties, metadata
    ) VALUES (
      demo_tenant, demo_agent, demo_customer2, 'feature_use', '{"feature":"batch_pricing","count":3}'::jsonb,
      '{"source":"seed"}'::jsonb
    ) RETURNING id INTO demo_usage_signal2;
  END IF;

  -- Demo usage row
  SELECT id INTO demo_usage_row FROM "usage" WHERE tenant_id = demo_tenant AND metric = 'api_calls' AND period = current_date;
  IF demo_usage_row IS NULL THEN
    INSERT INTO "usage" (tenant_id, metric, value, period)
    VALUES (demo_tenant, 'api_calls', 42, current_date)
    RETURNING id INTO demo_usage_row;
  END IF;

  -- Demo recommendation
  SELECT id INTO demo_recommendation FROM recommendations WHERE experiment_id = demo_experiment LIMIT 1;
  IF demo_recommendation IS NULL THEN
    INSERT INTO recommendations (
      experiment_id, tenant_id, recommended_price, expected_revenue, confidence, objective, simulation, metadata
    ) VALUES (
      demo_experiment, demo_tenant, 129.00, 2500.00, 0.72, 'revenue',
      '{"variant":"B","lift_pct":12}'::jsonb,
      '{"note":"Seed suggestion"}'::jsonb
    ) RETURNING id INTO demo_recommendation;
  END IF;

  -- Byok agent
  SELECT id INTO byok_agent FROM agents WHERE tenant_id = byok_tenant AND external_id = 'agent-byok-001';
  IF byok_agent IS NULL THEN
    INSERT INTO agents (
      tenant_id, external_id, name, description, pricing_model, base_price, currency, status, metadata
    ) VALUES (
      byok_tenant, 'agent-byok-001', 'BYOK Agent', 'Managed by customer keys', 'usage_based', 0.10, 'USD', 'active', '{"features":["byok","signals"]}'::jsonb
    ) RETURNING id INTO byok_agent;
  END IF;

  -- Byok customer
  SELECT id INTO byok_customer FROM customers WHERE tenant_id = byok_tenant AND email = 'byok-customer@example.com';
  IF byok_customer IS NULL THEN
    INSERT INTO customers (
      tenant_id, external_id, name, email, phone, status, balance, currency, metadata
    ) VALUES (
      byok_tenant, 'cust-byok-001', 'BYOK Customer', 'byok-customer@example.com', '+1-555-0200', 'active',
      0.00, 'USD', '{"tier":"enterprise"}'::jsonb
    ) RETURNING id INTO byok_customer;
  END IF;

  -- Byok contact
  SELECT id INTO byok_contact FROM contacts WHERE customer_id = byok_customer AND email = 'contact-byok@example.com';
  IF byok_contact IS NULL THEN
    INSERT INTO contacts (
      customer_id, external_id, email, phone, address, metadata
    ) VALUES (
      byok_customer, 'contact-byok-001', 'contact-byok@example.com', '+1-555-0201',
      '{"line1":"789 Enterprise Rd","city":"Paidville","country":"US"}'::jsonb,
      '{"role":"admin"}'::jsonb
    ) RETURNING id INTO byok_contact;
  END IF;

  -- Byok experiment
  SELECT id INTO byok_experiment FROM experiments WHERE tenant_id = byok_tenant AND key = 'pricing_byok_001';
  IF byok_experiment IS NULL THEN
    INSERT INTO experiments (
      tenant_id, key, name, description, variants, status, start_date, metadata
    ) VALUES (
      byok_tenant,
      'pricing_byok_001',
      'BYOK Pricing Experiment',
      'A/B test for BYOK tenant',
      '[{"name":"Base","price":199,"weight":0.6},{"name":"Premium","price":249,"weight":0.4}]'::jsonb,
      'active',
      now() - INTERVAL '2 days',
      '{"objective":"conversion"}'::jsonb
    ) RETURNING id INTO byok_experiment;
  END IF;

  -- Byok assignment
  SELECT id INTO byok_assignment FROM assignments WHERE experiment_id = byok_experiment AND user_id = 'byok_user_001';
  IF byok_assignment IS NULL THEN
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES (byok_experiment, 'byok_user_001', 'Base')
    RETURNING id INTO byok_assignment;
  END IF;

  -- Byok view
  SELECT id INTO byok_view FROM views WHERE experiment_id = byok_experiment AND user_id = 'byok_user_001';
  IF byok_view IS NULL THEN
    INSERT INTO views (experiment_id, user_id, variant, metadata)
    VALUES (byok_experiment, 'byok_user_001', 'Base', '{"source":"api"}'::jsonb)
    RETURNING id INTO byok_view;
  END IF;

  -- Byok conversion
  SELECT id INTO byok_conversion FROM conversions WHERE experiment_id = byok_experiment AND user_id = 'byok_user_001';
  IF byok_conversion IS NULL THEN
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, paid_order_id, metadata)
    VALUES (byok_experiment, 'byok_user_001', 'Base', 249.00, 'paid-order-byok-001', '{"channel":"api"}'::jsonb)
    RETURNING id INTO byok_conversion;
  END IF;

  -- Byok recommendation
  SELECT id INTO byok_recommendation FROM recommendations WHERE experiment_id = byok_experiment LIMIT 1;
  IF byok_recommendation IS NULL THEN
    INSERT INTO recommendations (
      experiment_id, tenant_id, recommended_price, expected_revenue, confidence, objective, simulation, metadata
    ) VALUES (
      byok_experiment, byok_tenant, 259.00, 3200.00, 0.65, 'conversion',
      '{"variant":"Premium","lift_pct":9}'::jsonb,
      '{"note":"BYOK seed"}'::jsonb
    ) RETURNING id INTO byok_recommendation;
  END IF;

  -- Byok order
  SELECT id INTO byok_order FROM orders WHERE tenant_id = byok_tenant AND external_id = 'order-byok-001';
  IF byok_order IS NULL THEN
    INSERT INTO orders (
      tenant_id, customer_id, agent_id, external_id, status, amount, currency, items, metadata
    ) VALUES (
      byok_tenant, byok_customer, byok_agent, 'order-byok-001', 'completed', 249.00, 'USD',
      '[{"sku":"agent-byok","qty":1,"price":249}]'::jsonb,
      '{"channel":"api"}'::jsonb
    ) RETURNING id INTO byok_order;
  END IF;

  -- Byok payment
  SELECT id INTO byok_payment FROM payments WHERE tenant_id = byok_tenant AND external_id = 'payment-byok-001';
  IF byok_payment IS NULL THEN
    INSERT INTO payments (
      tenant_id, customer_id, order_id, external_id, status, amount, currency, payment_method, refunded_amount, metadata
    ) VALUES (
      byok_tenant, byok_customer, byok_order, 'payment-byok-001', 'succeeded', 249.00, 'USD', 'card', 0.00,
      '{"processor":"demo-pay"}'::jsonb
    ) RETURNING id INTO byok_payment;
  END IF;

  -- Byok invoice
  SELECT id INTO byok_invoice FROM invoices WHERE tenant_id = byok_tenant AND invoice_number = 'INV-BYOK-1001';
  IF byok_invoice IS NULL THEN
    INSERT INTO invoices (
      tenant_id, customer_id, external_id, invoice_number, status, amount, amount_paid, amount_due, currency, due_date, paid_at, line_items, metadata
    ) VALUES (
      byok_tenant, byok_customer, 'invoice-byok-001', 'INV-BYOK-1001', 'paid', 249.00, 249.00, 0.00, 'USD',
      now() - INTERVAL '1 day', now(), '[{"description":"BYOK Agent","amount":249}]'::jsonb,
      '{"note":"Paid"}'::jsonb
    ) RETURNING id INTO byok_invoice;
  END IF;

  -- Byok usage signal
  SELECT id INTO byok_usage_signal FROM usage_signals WHERE tenant_id = byok_tenant AND event_type = 'api_call' LIMIT 1;
  IF byok_usage_signal IS NULL THEN
    INSERT INTO usage_signals (
      tenant_id, agent_id, customer_id, event_type, properties, metadata
    ) VALUES (
      byok_tenant, byok_agent, byok_customer, 'api_call', '{"path":"/v1/byok/prices","latency_ms":95}'::jsonb,
      '{"source":"seed"}'::jsonb
    ) RETURNING id INTO byok_usage_signal;
  END IF;

  -- Byok usage row
  SELECT id INTO byok_usage_row FROM "usage" WHERE tenant_id = byok_tenant AND metric = 'api_calls' AND period = current_date;
  IF byok_usage_row IS NULL THEN
    INSERT INTO "usage" (tenant_id, metric, value, period)
    VALUES (byok_tenant, 'api_calls', 17, current_date)
    RETURNING id INTO byok_usage_row;
  END IF;
END
$$;
