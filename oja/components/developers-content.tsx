"use client"

import { useState } from "react"
import { ExternalLink, Copy, Check } from "lucide-react"
import { Button } from '@lastprice/ui'

type Language = "python" | "nodejs" | "go" | "ruby" | "java"

const languageLabels: Record<Language, string> = {
  python: "Python",
  nodejs: "Node.js",
  go: "Go",
  ruby: "Ruby",
  java: "Java",
}

const installCommands: Record<Language, string> = {
  python: "pip install paid-python",
  nodejs: "npm install @paid-ai/paid-node",
  go: "go get github.com/paid-ai/paid-go",
  ruby: "gem install paid-ruby",
  java: "implementation 'ai.paid:paid-java:1.0.0'",
}

const codeSnippets: Record<Language, { customer: string; contact: string; order: string }> = {
  python: {
    customer: `from paid import Paid, TaxExemptStatus, CreationSource, Address

# Initialize the client
client = Paid(token="<YOUR_API_KEY>")

# Create the account
customer = client.customers.create(
    name="Acme Ltd",
    phone="+1-555-0123",
    employee_count=100,
    annual_revenue=1000000,
    tax_exempt_status="none",
    creation_source="api",
    website="https://acme.com",
    external_id="acme_account_123",  # this would normally be this account's ID in your DB
    billing_address=Address(
        line_1="123 Business Ave",
        line_2="Suite 100",
        city="San Francisco",
        state="CA",
        zip_code="94105",
        country="USA"
    )
)`,
    contact: `from paid import Paid, Salutation

# Initialize the client
client = Paid(token="<YOUR_API_KEY>")

# Create the contact (using either an internal or an external account id)
contact = client.contacts.create(
    customer_external_id="acme_account_123",  # use either customer_id or customer_external_id for contact creation
    salutation="Mr.",
    first_name="John",
    last_name="Doe",
    email="john.doe@acme.com",
    phone="+1-555-0123",
    billing_street="123 Main St",
    billing_city="San Francisco",
    billing_state_province="CA",
    billing_country="USA",
    billing_postal_code="94105",
    external_id="acme_contact_123"
)`,
    order: `from paid import Paid

# Initialize the client
client = Paid(token="<YOUR_API_KEY>")

# Create the order (using either an internal or an external customer id and billing contact id)
order = client.orders.create(
    customer_id=customer.id,  # use either customer_id or customer_external_id for order creation
    billing_contact_id=contact.id,  # use the contact ID from the previous step
    name="AI SDR - Pro plan",
    description="Annual subscription for AI SDR - Pro plan",
    start_date="2025-06-01",
    end_date="2026-05-31",
    currency="USD"
)`,
  },
  nodejs: {
    customer: `import { PaidClient } from '@paid-ai/paid-node';

// Initialize the client
const client = new PaidClient({ token: "<YOUR_API_KEY>" });

// Create the account
const customer = await client.customers.create({
  name: "Acme Ltd",
  phone: "+1-555-0123",
  employeeCount: 100,
  annualRevenue: 1000000,
  taxExemptStatus: "none",
  creationSource: "api",
  website: "https://acme.com",
  externalId: "acme_account_123",
  billingAddress: {
    line1: "123 Business Ave",
    line2: "Suite 100",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "USA"
  }
});`,
    contact: `import { PaidClient } from '@paid-ai/paid-node';

// Initialize the client
const client = new PaidClient({ token: "<YOUR_API_KEY>" });

// Create the contact
const contact = await client.contacts.create({
  customerExternalId: "acme_account_123",
  salutation: "Mr.",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@acme.com",
  phone: "+1-555-0123",
  billingStreet: "123 Main St",
  billingCity: "San Francisco",
  billingStateProvince: "CA",
  billingCountry: "USA",
  billingPostalCode: "94105",
  externalId: "acme_contact_123"
});`,
    order: `import { PaidClient } from '@paid-ai/paid-node';

// Initialize the client
const client = new PaidClient({ token: "<YOUR_API_KEY>" });

// Create the order
const order = await client.orders.create({
  customerId: customer.id,
  billingContactId: contact.id,
  name: "AI SDR - Pro plan",
  description: "Annual subscription for AI SDR - Pro plan",
  startDate: "2025-06-01",
  endDate: "2026-05-31",
  currency: "USD"
});`,
  },
  go: {
    customer: `package main

import "github.com/paid-ai/paid-go"

// Initialize the client
client := paid.NewClient("<YOUR_API_KEY>")

// Create the account
customer, err := client.Customers.Create(&paid.CustomerCreateParams{
    Name:            "Acme Ltd",
    Phone:           "+1-555-0123",
    EmployeeCount:   100,
    AnnualRevenue:   1000000,
    TaxExemptStatus: "none",
    CreationSource:  "api",
    Website:         "https://acme.com",
    ExternalID:      "acme_account_123",
    BillingAddress: &paid.Address{
        Line1:   "123 Business Ave",
        Line2:   "Suite 100",
        City:    "San Francisco",
        State:   "CA",
        ZipCode: "94105",
        Country: "USA",
    },
})`,
    contact: `package main

import "github.com/paid-ai/paid-go"

// Initialize the client
client := paid.NewClient("<YOUR_API_KEY>")

// Create the contact
contact, err := client.Contacts.Create(&paid.ContactCreateParams{
    CustomerExternalID: "acme_account_123",
    Salutation:         "Mr.",
    FirstName:          "John",
    LastName:           "Doe",
    Email:              "john.doe@acme.com",
    Phone:              "+1-555-0123",
    BillingStreet:      "123 Main St",
    BillingCity:        "San Francisco",
    BillingState:       "CA",
    BillingCountry:     "USA",
    BillingPostalCode:  "94105",
    ExternalID:         "acme_contact_123",
})`,
    order: `package main

import "github.com/paid-ai/paid-go"

// Initialize the client
client := paid.NewClient("<YOUR_API_KEY>")

// Create the order
order, err := client.Orders.Create(&paid.OrderCreateParams{
    CustomerID:       customer.ID,
    BillingContactID: contact.ID,
    Name:             "AI SDR - Pro plan",
    Description:      "Annual subscription for AI SDR - Pro plan",
    StartDate:        "2025-06-01",
    EndDate:          "2026-05-31",
    Currency:         "USD",
})`,
  },
  ruby: {
    customer: `require 'paid'

# Initialize the client
client = Paid::Client.new(token: "<YOUR_API_KEY>")

# Create the account
customer = client.customers.create(
  name: "Acme Ltd",
  phone: "+1-555-0123",
  employee_count: 100,
  annual_revenue: 1000000,
  tax_exempt_status: "none",
  creation_source: "api",
  website: "https://acme.com",
  external_id: "acme_account_123",
  billing_address: {
    line_1: "123 Business Ave",
    line_2: "Suite 100",
    city: "San Francisco",
    state: "CA",
    zip_code: "94105",
    country: "USA"
  }
)`,
    contact: `require 'paid'

# Initialize the client
client = Paid::Client.new(token: "<YOUR_API_KEY>")

# Create the contact
contact = client.contacts.create(
  customer_external_id: "acme_account_123",
  salutation: "Mr.",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@acme.com",
  phone: "+1-555-0123",
  billing_street: "123 Main St",
  billing_city: "San Francisco",
  billing_state_province: "CA",
  billing_country: "USA",
  billing_postal_code: "94105",
  external_id: "acme_contact_123"
)`,
    order: `require 'paid'

# Initialize the client
client = Paid::Client.new(token: "<YOUR_API_KEY>")

# Create the order
order = client.orders.create(
  customer_id: customer.id,
  billing_contact_id: contact.id,
  name: "AI SDR - Pro plan",
  description: "Annual subscription for AI SDR - Pro plan",
  start_date: "2025-06-01",
  end_date: "2026-05-31",
  currency: "USD"
)`,
  },
  java: {
    customer: `import ai.paid.PaidClient;
import ai.paid.models.*;

// Initialize the client
PaidClient client = new PaidClient("<YOUR_API_KEY>");

// Create the account
Customer customer = client.customers().create(
    CustomerCreateParams.builder()
        .name("Acme Ltd")
        .phone("+1-555-0123")
        .employeeCount(100)
        .annualRevenue(1000000L)
        .taxExemptStatus("none")
        .creationSource("api")
        .website("https://acme.com")
        .externalId("acme_account_123")
        .billingAddress(Address.builder()
            .line1("123 Business Ave")
            .line2("Suite 100")
            .city("San Francisco")
            .state("CA")
            .zipCode("94105")
            .country("USA")
            .build())
        .build()
);`,
    contact: `import ai.paid.PaidClient;
import ai.paid.models.*;

// Initialize the client
PaidClient client = new PaidClient("<YOUR_API_KEY>");

// Create the contact
Contact contact = client.contacts().create(
    ContactCreateParams.builder()
        .customerExternalId("acme_account_123")
        .salutation("Mr.")
        .firstName("John")
        .lastName("Doe")
        .email("john.doe@acme.com")
        .phone("+1-555-0123")
        .billingStreet("123 Main St")
        .billingCity("San Francisco")
        .billingStateProvince("CA")
        .billingCountry("USA")
        .billingPostalCode("94105")
        .externalId("acme_contact_123")
        .build()
);`,
    order: `import ai.paid.PaidClient;
import ai.paid.models.*;

// Initialize the client
PaidClient client = new PaidClient("<YOUR_API_KEY>");

// Create the order
Order order = client.orders().create(
    OrderCreateParams.builder()
        .customerId(customer.getId())
        .billingContactId(contact.getId())
        .name("AI SDR - Pro plan")
        .description("Annual subscription for AI SDR - Pro plan")
        .startDate("2025-06-01")
        .endDate("2026-05-31")
        .currency("USD")
        .build()
);`,
  },
}

function CodeBlock({ code, showLineNumbers = true }: { code: string; showLineNumbers?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split("\n")

  return (
    <div className="relative rounded-lg bg-[#1e1e1e] text-sm">
      <button onClick={handleCopy} className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="overflow-x-auto p-4 pr-12">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && <span className="w-8 flex-shrink-0 text-gray-500 select-none">{i + 1}</span>}
              <span className="flex-1">
                <SyntaxHighlightedLine line={line} />
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

function SyntaxHighlightedLine({ line }: { line: string }) {
  // Simple syntax highlighting
  const highlightedLine = line
    // Keywords
    .replace(
      /\b(from|import|const|let|var|function|return|if|else|for|while|class|def|package|require|new|await|async)\b/g,
      '<span class="text-purple-400">$1</span>',
    )
    // Strings
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="text-green-400">$1</span>')
    // Comments
    .replace(/(#.*$|\/\/.*$)/gm, '<span class="text-gray-500">$1</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
    // Function calls and methods
    .replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '.<span class="text-yellow-300">$1</span>(')
    // Class names and types
    .replace(
      /\b(Paid|PaidClient|Address|Customer|Contact|Order|TaxExemptStatus|CreationSource|Salutation)\b/g,
      '<span class="text-cyan-400">$1</span>',
    )

  return <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
}

export function DevelopersContent() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("python")
  const [copiedInstall, setCopiedInstall] = useState(false)

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installCommands[selectedLanguage])
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2000)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span className="font-medium text-gray-900">Developers</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Contact
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Guide
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Language Tabs */}
        <div className="mb-8 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          {(Object.keys(languageLabels) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedLanguage === lang ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {/* Step 1: Let's get setup */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Let's get setup</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Set the foundation — install the SDK so your app can start collaborating with Paid.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="relative rounded-lg bg-[#1e1e1e] px-4 py-3">
                <code className="text-sm text-gray-100">{installCommands[selectedLanguage]}</code>
                <button
                  onClick={handleCopyInstall}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedInstall ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Generate API key */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Generate API key</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Create your secure key so Paid can recognize your system and respond in real time.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">Generate API</Button>
            </div>
          </div>

          {/* Step 3: Create your customer */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create your customer</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Introduce a customer to Paid — this links every signal, contact, and order under one company.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <CodeBlock code={codeSnippets[selectedLanguage].customer} />
            </div>
          </div>

          {/* Step 4: Create your contact */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create your contact</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Add the human behind the account. Paid uses this to personalize invoices and comms.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <CodeBlock code={codeSnippets[selectedLanguage].contact} />
            </div>
          </div>

          {/* Step 5: Create an order */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create an order</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Define what the customer is buying. Paid will handle pricing, usage, and outcomes from{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      here
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
            <div>
              <CodeBlock code={codeSnippets[selectedLanguage].order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
