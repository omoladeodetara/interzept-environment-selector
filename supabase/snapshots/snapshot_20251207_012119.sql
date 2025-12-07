--
-- PostgreSQL database dump
--

\restrict yTdZyrdBgZVOLa08q51qmW7o9CfKbFpRBc736p5elPhLSZipeAyq5cQWx5ehgLA

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tenants VALUES ('bb62d990-23c8-486e-b7ac-736611c2427b', 'Demo Company', 'demo@example.com', 'managed', NULL, 'starter', NULL, '2025-12-06 22:22:03.153932+00', '2025-12-06 22:22:03.153932+00', '{}');
INSERT INTO public.tenants VALUES ('c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'BYOK Company', 'byok@example.com', 'byok', 'sk_test_example_key_encrypted', 'pro', NULL, '2025-12-06 22:22:03.153932+00', '2025-12-06 22:22:03.153932+00', '{}');


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agents VALUES ('3f6b1d0b-25ac-4505-84cb-7326f9d83414', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'agent-demo-001', 'Demo Pricing Agent', 'Sample agent for local testing', 'subscription', 99.00, 'USD', 'active', '{"features": ["ab-testing", "usage-tracking"]}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.agents VALUES ('c2cf02cf-57f6-45f9-ab13-31f24046f3c9', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'agent-byok-001', 'BYOK Agent', 'Managed by customer keys', 'usage_based', 0.10, 'USD', 'active', '{"features": ["byok", "signals"]}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: experiments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.experiments VALUES ('80bae9a9-b261-4e73-b8c9-91d0a4213085', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'pricing_test_001', 'Demo Pricing Experiment', 'Sample A/B test for local development', '[{"name": "A", "price": 99, "weight": 0.5}, {"name": "B", "price": 129, "weight": 0.5}]', 'active', '2025-12-05 23:08:10.324558+00', NULL, NULL, '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00', '{"objective": "revenue"}');
INSERT INTO public.experiments VALUES ('e98cc0ed-96b8-48e9-b950-97025f794edf', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'pricing_byok_001', 'BYOK Pricing Experiment', 'A/B test for BYOK tenant', '[{"name": "Base", "price": 199, "weight": 0.6}, {"name": "Premium", "price": 249, "weight": 0.4}]', 'active', '2025-12-04 23:17:47.475378+00', NULL, NULL, '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00', '{"objective": "conversion"}');


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.assignments VALUES ('ce9c4d23-a445-41c8-b3f6-e62f056d9b53', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_001', 'A', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.assignments VALUES ('0f43d01b-2148-4c98-8499-2e9840fb4c24', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_002', 'B', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.assignments VALUES ('29c7ec41-86fd-47c1-9dad-217bb8880044', 'e98cc0ed-96b8-48e9-b950-97025f794edf', 'byok_user_001', 'Base', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.customers VALUES ('71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'cust-demo-001', 'Acme Demo', 'customer@example.com', '+1-555-0100', 'active', 0.00, 'USD', '{"tier": "starter"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.customers VALUES ('51d0f538-42fa-427f-8fc8-e2d7b3291362', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'cust-demo-002', 'Beta Demo', 'customer+2@example.com', '+1-555-0102', 'active', 10.00, 'USD', '{"tier": "pro"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.customers VALUES ('8f7d7929-46e4-44e2-9c5b-6f360eb4b906', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'cust-byok-001', 'BYOK Customer', 'byok-customer@example.com', '+1-555-0200', 'active', 0.00, 'USD', '{"tier": "enterprise"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.contacts VALUES ('73433683-07ef-46a5-bf9f-bda431964c54', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'contact-demo-001', 'contact@example.com', '+1-555-0101', '{"city": "Demo City", "line1": "123 Demo St", "country": "US"}', '{"role": "billing"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.contacts VALUES ('fee40d2d-199b-4d8c-be52-33212bc28043', '51d0f538-42fa-427f-8fc8-e2d7b3291362', 'contact-demo-002', 'contact+2@example.com', '+1-555-0103', '{"city": "Demo City", "line1": "456 Beta Ave", "country": "US"}', '{"role": "technical"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.contacts VALUES ('fe3c1c15-9100-4799-a89f-29300dfe57bf', '8f7d7929-46e4-44e2-9c5b-6f360eb4b906', 'contact-byok-001', 'contact-byok@example.com', '+1-555-0201', '{"city": "Paidville", "line1": "789 Enterprise Rd", "country": "US"}', '{"role": "admin"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: conversions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.conversions VALUES ('49f2b5fd-febb-4c7f-b040-56784b6554c6', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_001', 'A', 199.00, '2025-12-06 23:08:10.324558+00', 'paid-order-demo-001', '{"channel": "web"}');
INSERT INTO public.conversions VALUES ('8ae938ca-a732-420d-a8d2-d6794906784b', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_002', 'B', 149.00, '2025-12-06 23:17:47.475378+00', 'paid-order-demo-002', '{"channel": "web"}');
INSERT INTO public.conversions VALUES ('04f1aee7-6af0-4461-b065-d7fb34728cb9', 'e98cc0ed-96b8-48e9-b950-97025f794edf', 'byok_user_001', 'Base', 249.00, '2025-12-06 23:17:47.475378+00', 'paid-order-byok-001', '{"channel": "api"}');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders VALUES ('a4610f62-2252-4738-9b79-99cd736a3e16', 'bb62d990-23c8-486e-b7ac-736611c2427b', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', 'order-demo-001', 'completed', 199.00, 'USD', '[{"qty": 1, "sku": "agent-setup", "price": 199}]', '{"channel": "ui"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.orders VALUES ('9a38cbe0-179a-4380-8e72-37fd701814d9', 'bb62d990-23c8-486e-b7ac-736611c2427b', '51d0f538-42fa-427f-8fc8-e2d7b3291362', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', 'order-demo-002', 'processing', 89.00, 'USD', '[{"qty": 1, "sku": "agent-upgrade", "price": 89}]', '{"channel": "api"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.orders VALUES ('462ec540-96e0-44c9-9ccf-580680872a11', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', '8f7d7929-46e4-44e2-9c5b-6f360eb4b906', 'c2cf02cf-57f6-45f9-ab13-31f24046f3c9', 'order-byok-001', 'completed', 249.00, 'USD', '[{"qty": 1, "sku": "agent-byok", "price": 249}]', '{"channel": "api"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: costs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.costs VALUES ('9daeca7b-4fb8-4463-b62a-041872366f34', 'bb62d990-23c8-486e-b7ac-736611c2427b', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'a4610f62-2252-4738-9b79-99cd736a3e16', 'compute', 25.00, 'USD', 1000.00, 'tokens', '{"ref": "cost-demo-001"}', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.costs VALUES ('22601983-9ff6-4c0f-a33d-823a6a6f20b6', 'bb62d990-23c8-486e-b7ac-736611c2427b', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', '51d0f538-42fa-427f-8fc8-e2d7b3291362', '9a38cbe0-179a-4380-8e72-37fd701814d9', 'storage', 5.00, 'USD', 2.00, 'gb', '{"ref": "cost-demo-002"}', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: credits; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.credits VALUES ('53d0a219-5856-4c0e-afb3-535ec4156a85', 'bb62d990-23c8-486e-b7ac-736611c2427b', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'credit-demo-001', 50.00, 50.00, 'USD', 'active', '2026-01-05 23:08:10.324558+00', '{"reason": "Goodwill"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payments VALUES ('a9badf3a-570b-42ca-9b24-151dec0d4794', 'bb62d990-23c8-486e-b7ac-736611c2427b', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'a4610f62-2252-4738-9b79-99cd736a3e16', 'payment-demo-001', 'succeeded', 199.00, 'USD', 'card', 0.00, '{"processor": "demo-pay"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.payments VALUES ('b02e17d4-a512-4af7-be65-a350ee5ed845', 'bb62d990-23c8-486e-b7ac-736611c2427b', '51d0f538-42fa-427f-8fc8-e2d7b3291362', '9a38cbe0-179a-4380-8e72-37fd701814d9', 'payment-demo-002', 'processing', 89.00, 'USD', 'card', 0.00, '{"processor": "demo-pay"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.payments VALUES ('73a2399a-1399-4f11-95bc-8125c9e084af', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', '8f7d7929-46e4-44e2-9c5b-6f360eb4b906', '462ec540-96e0-44c9-9ccf-580680872a11', 'payment-byok-001', 'succeeded', 249.00, 'USD', 'card', 0.00, '{"processor": "demo-pay"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.disputes VALUES ('dce0f30c-f157-4081-9510-7a5f85c93b56', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'a9badf3a-570b-42ca-9b24-151dec0d4794', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'dispute-demo-001', 'open', 50.00, 'USD', 'fraud', '{"summary": "Customer reported unauthorized charge"}', '{"priority": "medium"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.invoices VALUES ('66a809d8-6327-4f71-9d64-bca93efcc3ee', 'bb62d990-23c8-486e-b7ac-736611c2427b', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'invoice-demo-001', 'INV-1001', 'paid', 199.00, 199.00, 0.00, 'USD', '2025-12-05 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00', '[{"amount": 199, "description": "Agent setup"}]', '{"note": "Paid in full"}', '2025-12-06 23:08:10.324558+00', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.invoices VALUES ('26d54d76-127e-40a0-a9c6-d7cd4480f595', 'bb62d990-23c8-486e-b7ac-736611c2427b', '51d0f538-42fa-427f-8fc8-e2d7b3291362', 'invoice-demo-002', 'INV-1002', 'open', 89.00, 0.00, 89.00, 'USD', '2025-12-13 23:17:47.475378+00', NULL, '[{"amount": 89, "description": "Agent upgrade"}]', '{"note": "Awaiting payment"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.invoices VALUES ('3b722732-906c-43ee-beff-f0eebac27a61', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', '8f7d7929-46e4-44e2-9c5b-6f360eb4b906', 'invoice-byok-001', 'INV-BYOK-1001', 'paid', 249.00, 249.00, 0.00, 'USD', '2025-12-05 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00', '[{"amount": 249, "description": "BYOK Agent"}]', '{"note": "Paid"}', '2025-12-06 23:17:47.475378+00', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.recommendations VALUES ('a27ed584-2c8d-45f1-b426-863d7b47e9c0', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'bb62d990-23c8-486e-b7ac-736611c2427b', 129.00, 2500.00, 0.72, 'revenue', '{"variant": "B", "lift_pct": 12}', '2025-12-06 23:08:10.324558+00', '{"note": "Seed suggestion"}');
INSERT INTO public.recommendations VALUES ('7ba364ef-8486-47d4-90b5-6c07604760d7', 'e98cc0ed-96b8-48e9-b950-97025f794edf', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 259.00, 3200.00, 0.65, 'conversion', '{"variant": "Premium", "lift_pct": 9}', '2025-12-06 23:17:47.475378+00', '{"note": "BYOK seed"}');


--
-- Data for Name: usage; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usage VALUES ('f676341a-3f3c-459c-80d4-6f3bbf40f61b', 'bb62d990-23c8-486e-b7ac-736611c2427b', 'api_calls', 42, '2025-12-06', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.usage VALUES ('a7d59879-875a-446f-806f-6c4f9c6b8976', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'api_calls', 17, '2025-12-06', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: usage_signals; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usage_signals VALUES ('5f651b5b-ce12-4e77-81dd-3d0c2796ea80', 'bb62d990-23c8-486e-b7ac-736611c2427b', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', '71060f1f-5c30-41a6-a30f-853ef2f81ecb', 'api_call', '{"path": "/v1/prices", "latency_ms": 120}', '{"source": "seed"}', '2025-12-06 23:08:10.324558+00');
INSERT INTO public.usage_signals VALUES ('e5f42ac1-5347-45b3-89da-058a33b59822', 'bb62d990-23c8-486e-b7ac-736611c2427b', '3f6b1d0b-25ac-4505-84cb-7326f9d83414', '51d0f538-42fa-427f-8fc8-e2d7b3291362', 'feature_use', '{"count": 3, "feature": "batch_pricing"}', '{"source": "seed"}', '2025-12-06 23:17:47.475378+00');
INSERT INTO public.usage_signals VALUES ('1eff3c7e-c719-4760-bc6b-27a57b36422b', 'c6d7088e-9046-4a72-a64d-8e6ff5b2e116', 'c2cf02cf-57f6-45f9-ab13-31f24046f3c9', '8f7d7929-46e4-44e2-9c5b-6f360eb4b906', 'api_call', '{"path": "/v1/byok/prices", "latency_ms": 95}', '{"source": "seed"}', '2025-12-06 23:17:47.475378+00');


--
-- Data for Name: views; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.views VALUES ('3b969209-79bb-468c-8ac9-14720a81603b', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_001', 'A', '2025-12-06 23:08:10.324558+00', '{"source": "ui"}');
INSERT INTO public.views VALUES ('d1b4899c-5a99-4bf4-94cd-f8f157491e05', '80bae9a9-b261-4e73-b8c9-91d0a4213085', 'user_demo_002', 'B', '2025-12-06 23:17:47.475378+00', '{"source": "ui"}');
INSERT INTO public.views VALUES ('e13f0f0a-cf46-40bb-b224-31681420e07d', 'e98cc0ed-96b8-48e9-b950-97025f794edf', 'byok_user_001', 'Base', '2025-12-06 23:17:47.475378+00', '{"source": "api"}');


--
-- PostgreSQL database dump complete
--

\unrestrict yTdZyrdBgZVOLa08q51qmW7o9CfKbFpRBc736p5elPhLSZipeAyq5cQWx5ehgLA

