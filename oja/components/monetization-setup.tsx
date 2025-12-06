"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Users,
  Grid3X3,
  ArrowRight,
  Copy,
  Check,
  Pencil,
  Sparkles,
  X,
  Upload,
} from "lucide-react"

const styleChips = [
  "Minimalist card layout",
  "Interactive calculator style",
  "Feature comparison table",
  "Developer-focused design",
]

const styleContent: Record<string, string> = {
  "Minimalist card layout": `Create a clean, minimal pricing card layout for my agent's plans.

- Simple card design with clear tier names
- Highlight the recommended plan
- Show key features per tier
- Clear call-to-action buttons
- Mobile-responsive grid layout`,
  "Interactive calculator style": `Build an interactive pricing calculator using my usage-based pricing data.

- Show real-time cost calculation as users adjust usage sliders
- Display breakdown of costs per signal/metric
- Show estimated monthly and annual totals
- Include tooltips explaining each pricing component
- Visual indicators for cost changes
- Clean, interactive UI with immediate feedback`,
  "Feature comparison table": `Create a detailed feature comparison table for my agent's pricing plans.

- Side-by-side comparison of all tiers
- Checkmarks and X marks for feature availability
- Highlight differences between plans
- Sticky header for easy scrolling
- Mobile-friendly accordion view`,
  "Developer-focused design": `Design a developer-centric pricing page for my API/SDK product.

- Show pricing in API calls/requests format
- Include code snippets for quick start
- Display rate limits per tier
- Technical specifications comparison
- SDKs and integrations availability per plan`,
}

export default function MonetizationSetup() {
  const router = useRouter()
  const [openAccordion, setOpenAccordion] = useState<string | null>("generate") // Default to "generate" instead of "configure"
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [pricingDescription, setPricingDescription] = useState("")
  const [instrumentTab, setInstrumentTab] = useState<"manual" | "automated">("manual")
  const [copiedBlocks, setCopiedBlocks] = useState<Record<string, boolean>>({})
  const [isReconfiguring, setIsReconfiguring] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [creatingStep, setCreatingStep] = useState(0)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [deploymentOpen, setDeploymentOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null)

  const [automatedForm, setAutomatedForm] = useState({
    paidApiKey: "bccf78f1-46b4-470e-b2bd-eaa736cb8f26",
    agentId: "ai-sdk-chatbot-id",
    publishableKey: "pk_live_51S2vuU6VZ0JAwqpD...",
    framework: "",
    provider: "",
    pricingPage: "",
    enableCustomerManagement: true,
    enablePaymentProcessing: true,
    githubUrl: "",
    branch: "main",
  })

  const handleGenerateBlock = () => {
    if (pricingDescription.trim()) {
      router.push(`/generate-block?prompt=${encodeURIComponent(pricingDescription)}`)
    }
  }

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles([])
      setPricingDescription("")
    } else {
      setSelectedStyles([style])
      setPricingDescription(styleContent[style] || "")
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBlocks((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => setCopiedBlocks((prev) => ({ ...prev, [id]: false })), 2000)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setCreatingStep(0)

    const steps = [0, 1, 2]
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      if (currentStep < steps.length) {
        setCreatingStep(currentStep)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsCreating(false)
          setIsReconfiguring(false)
          setCreatingStep(0)
        }, 500)
      }
    }, 800)
  }

  const creatingSteps = [
    { label: "API Key", status: creatingStep > 0 ? "done" : creatingStep === 0 ? "creating" : "pending" },
    { label: "Agent", status: creatingStep > 1 ? "done" : creatingStep === 1 ? "creating" : "pending" },
    { label: "Customer", status: creatingStep > 2 ? "done" : creatingStep === 2 ? "creating" : "pending" },
  ]

  const jsonConfig = `{
  "agent": {
    "name": "ai-sdk-chatbot",
    "description": "A chatbot",
    "productCode": "ai-assistant-v1",
    "externalId": "ai-sdk-chatbot-id"
  },
  "agentSignal": {
    "name": "ai-sdk-chatbot",
    "description": "A chatbot",
    "productCode": "ai-assistant-v1",
    "externalId": "ai-sdk-chatbot-id",
    "active": true,
    "ProductAttribute": [
      {
        "name": "using_chat_prompt",
        "pricing": {
          "eventName": "using_chat_prompt",
          "chargeType": "usage",
          "unitValue": 10,
          "signalType": "activity",
          "pricingModel": "PerUnit",
          "billingFrequency": "monthly",
          "PricePoints": {
            "USD": {
              "unitPrice": 100
            }
          }
        }
      }
    ]
  }
}`

  // Code blocks content
  const step1Code = `npx @paid-ai/monetize \\
  --customers \\
  --payments \\
  --agent-id="your-agent-id" \\
  --publishable-key="pk_12345" \\
  --framework="nextjs-app" \\
  --paid-api-key="paid-api-key-123" \\
  --pricing-page-id="pricing-page-id"`

  const step2Code = `npm install @paid-ai/paid-node @stripe/react-stripe-js @stripe/stripe-js`

  const step3Code = `import { usePaidCustomer } from '@/src/paid/customers/core/use-customer-creation';

// In your sign-up component/auth flow
const { state: customerState, createCustomerAccount } = usePaidCustomer({});

// In your sign-up handler
const result = await createCustomerAccount(customerId, {
  email: userEmail,
  name: userName,
  state: string;
  zipCode: string;
  country: string;
  metadata: Record<string, any>;
});`

  const step4Code = `import { StripeProvider } from '@/src/paid/payments/payment-providers/stripe';
import { PaidPaymentSetupPage } from '@/src/paid/payments/core/payment-setup/payment-setup-page';
import { paidConfig } from '@/app/paid.config';

// Create provider instance
const provider = new StripeProvider();

// Use the payment setup component
<PaidPaymentSetupPage
  customerID={currentUser.customerId}
  publishableKey={paidConfig.publishableKey}
  provider={provider}
  onSuccess={(result) => {
    // Navigate to next step
  }}
  onError={(error) => {
    // Handle payment setup errors
  }}
/>`

  const step5Code = `import { PaidCardManagementPage } from '@/src/paid/payments/core/payment-management/card-management';
import { paidConfig } from '@/app/paid.config';

<PaidCardManagementPage
  customerId={currentUser.customerId}
  publishableKey={paidConfig.publishableKey`

  const step6Code = `import { getCustomerBillingStatus } from '@/src/paid/payments/core/paid-billing/billingStatus';

// Define paying customer routes
const PLAN_ROUTES = ['/api/chat', '/premium-feature'];

// In your middleware
if (isPlanRoute(pathname) && currentUser) {
  const billingStatus = await getCustomerBillingStatus(
    currentUser.externalCustomerId,
    {}
  );

  if (!billingStatus.hasActiveOrders) {
    return NextResponse.redirect(
      new URL('/manage-payment-method', requestUrl)
    );
  }

  if (billingStatus.daysPastDue > 30) {
    return NextResponse.redirect(
      new URL('/manage-payment-method', requestUrl)
    );
  }
}`

  const configCode = `export const paidConfig = {
  publishableKey: "pk_12345", // Injected by monetize tool
  paidApiKey: "paid-api-key-123", // Injected by monetize tool
  // ... other configuration
};`

  const handleSetupMonetization = () => {
    // Validate GitHub URL
    if (!automatedForm.githubUrl.trim()) {
      setToast({
        type: "error",
        title: "Validation error",
        message: "GitHub URL is required",
      })
      setTimeout(() => setToast(null), 4000)
      return
    }

    // Success
    setToast({
      type: "success",
      title: "Monetization setup complete",
      message: "Your project has been successfully monetized!",
    })
    setTimeout(() => setToast(null), 4000)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setAutomatedForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-lg px-4 py-3 shadow-lg ${
              toast.type === "success" ? "bg-white border border-gray-200" : "bg-red-600 text-white"
            }`}
          >
            <p className={`font-medium ${toast.type === "success" ? "text-gray-900" : "text-white"}`}>{toast.title}</p>
            <p className={`text-sm ${toast.type === "success" ? "text-gray-500" : "text-red-100"}`}>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link
          href="/get-started"
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to workflows
        </Link>
        <Link href="/" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Finish
        </Link>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-gray-900">Setup monetization</h1>
        <p className="mt-2 text-gray-500">Time to get Paid</p>

        <h2 className="mb-6 mt-10 text-lg font-semibold text-gray-900">
          Configure product pricing and connect payment provider
        </h2>

        {/* Accordions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("configure")}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-cyan-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Configure an agent with pricing signals in Paid</h3>
                  <p className="text-sm text-gray-500">
                    Use a prebuilt agent config or provide a site that explains what your agent does.
                  </p>
                </div>
              </div>
              {openAccordion === "configure" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "configure" && (
              <div className="border-t border-gray-100 p-4">
                {isCreating ? (
                  // Creating state with progress
                  <div className="py-4">
                    <div className="mb-6 flex flex-col items-center">
                      <div className="mb-2 text-2xl">⏳</div>
                      <p className="font-medium text-gray-900">Setting up your demo environment...</p>
                    </div>
                    <div className="space-y-3">
                      {creatingSteps.map((step, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {step.status === "done" ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                            ) : step.status === "creating" ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{step.label}</p>
                              <p className="text-sm text-cyan-600">
                                {step.status === "done"
                                  ? "Created"
                                  : step.status === "creating"
                                    ? "Creating..."
                                    : "Not created"}
                              </p>
                            </div>
                          </div>
                          {step.status === "done" && <Check className="h-5 w-5 text-green-500" />}
                          {step.status === "creating" && (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isReconfiguring ? (
                  // Reconfigure state with input
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter a public web address to generate an agent pricing configuration (optional)"
                        className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                      />
                      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                        Generate <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Customize config <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Create <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  // Setup complete state (default)
                  <>
                    <div className="mb-3 flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Setup complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Agent: ai-sdk-chatbot</span>
                      </div>
                      <button
                        onClick={() => setIsReconfiguring(true)}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Reconfigure
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Generate Pricing Page */}
          <div className="rounded-lg border border-gray-200">
            <button
              onClick={() => toggleAccordion("generate")}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Generate a pricing page for your agents</h3>
                  <p className="text-sm text-gray-500">
                    Use our AI engine to generate a configurable and embeddable react page with pricing and monetization
                    rules done for you.
                  </p>
                </div>
              </div>
              {openAccordion === "generate" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openAccordion === "generate" && (
              <div className="border-t border-gray-100 p-4">
                {/* Style Chips */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {styleChips.map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        selectedStyles.includes(style)
                          ? "border-gray-900 bg-white text-gray-900"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                {/* Textarea with arrow */}
                <div className="relative">
                  <textarea
                    value={pricingDescription}
                    onChange={(e) => setPricingDescription(e.target.value)}
                    placeholder="Describe the pricing page you want to generate..."
                    className="min-h-[160px] w-full resize-none rounded-lg border border-gray-200 p-4 pr-12 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleGenerateBlock()}
                    disabled={!pricingDescription.trim()}
                    className={`absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      pricingDescription.trim()
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connect with Stripe */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-sm text-gray-600">
              Connect your existing Stripe account to enable immediate payment processing on our platform.
            </p>
            <button className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
              Connect with <span className="font-bold">stripe</span>
            </button>
          </div>
        </div>

        {/* Instrument your application */}
        <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Instrument your application</h2>

        {/* Manual / Automated tabs */}
        <div className="mb-6 inline-flex rounded-md border border-gray-200">
          <button
            onClick={() => setInstrumentTab("manual")}
            className={`px-4 py-2 text-sm font-medium ${
              instrumentTab === "manual" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setInstrumentTab("automated")}
            className={`px-4 py-2 text-sm font-medium ${
              instrumentTab === "automated" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Automated
          </button>
        </div>

        {instrumentTab === "manual" ? (
          <>
            {/* Prerequisites */}
            <h3 className="mb-2 font-semibold text-gray-900">Prerequisites</h3>
            <ul className="mb-8 list-inside list-disc text-sm text-cyan-600">
              <li>Stripe account with publishable keys configured</li>
            </ul>

            {/* Step 1 */}
            <h3 className="mb-2 font-semibold text-gray-900">Step 1: Run the code generator</h3>
            <p className="mb-3 text-sm text-gray-500">Generate monetization code for your application:</p>
            <div className="mb-4">
              <select className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-gray-300 focus:outline-none">
                <option>Select the pricing page</option>
              </select>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Step 2: Install dependencies</h3>
              <p className="mb-3 text-sm text-gray-500">Install the required packages:</p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>
                    <span className="text-amber-300">npm</span>
                    <span className="text-white"> install </span>
                    <span className="text-cyan-400">@paid-ai/paid-node</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">@stripe/react-stripe-js</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">@stripe/stripe-js</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("step2", step2Code)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["step2"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Or if using a different payment provider, install the appropriate library (e.g., PayPal, Square).
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Step 3: Customer Integration</h3>
              <p className="mb-3 text-sm text-gray-500">
                Integrate customer creation into your sign-up flow to link users with the Paid platform:
              </p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">usePaidCustomer</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/src/paid/customers/core/use-customer-creation'</span>
                    <span className="text-white">;</span>
                    {"\n\n"}
                    <span className="text-gray-500">// In your sign-up component/auth flow</span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-white">{" { state: "}</span>
                    <span className="text-amber-300">customerState</span>
                    <span className="text-white">, </span>
                    <span className="text-amber-300">createCustomerAccount</span>
                    <span className="text-white">{" } = "}</span>
                    <span className="text-cyan-400">usePaidCustomer</span>
                    <span className="text-white">({"{})"});</span>
                    {"\n\n"}
                    <span className="text-gray-500">// In your sign-up handler</span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> result = </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">createCustomerAccount</span>
                    <span className="text-white">(customerId, {"{"}</span>
                    {"\n"}
                    <span className="text-white"> email: userEmail,</span>
                    {"\n"}
                    <span className="text-white"> name: userName,</span>
                    {"\n"}
                    <span className="text-white"> state: </span>
                    <span className="text-cyan-400">string</span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-white"> zipCode: </span>
                    <span className="text-cyan-400">string</span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-white"> country: </span>
                    <span className="text-cyan-400">string</span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-white">{"}"};</span>
                    {"\n"}
                    <span className="text-white"> metadata: Record{"<string, any>"};</span>
                    {"\n"}
                    <span className="text-white">{"}"});</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("step3", step3Code)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["step3"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Display loading states and errors using{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700">customerState.isCreating</code> and{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700">customerState.error</code>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Step 4: Payment Setup Flow</h3>
              <p className="mb-3 text-sm text-gray-500">Add initial payment method collection during onboarding:</p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">StripeProvider</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/src/paid/payments/payment-providers/stripe'</span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">PaidPaymentSetupPage</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/src/paid/payments/core/payment-setup/payment-setup-page'</span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">paidConfig</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/app/paid.config'</span>
                    <span className="text-white">;</span>
                    {"\n\n"}
                    <span className="text-gray-500">// Create provider instance</span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> provider = </span>
                    <span className="text-purple-400">new</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">StripeProvider</span>
                    <span className="text-white">();</span>
                    {"\n\n"}
                    <span className="text-gray-500">// Use the payment setup component</span>
                    {"\n"}
                    <span className="text-red-400">{"<PaidPaymentSetupPage"}</span>
                    {"\n"}
                    <span className="text-white"> customerID={"{"}</span>
                    <span className="text-cyan-400">currentUser</span>
                    <span className="text-white">.customerId{"}"}</span>
                    {"\n"}
                    <span className="text-white"> publishableKey={"{"}</span>
                    <span className="text-cyan-400">paidConfig</span>
                    <span className="text-white">.publishableKey{"}"}</span>
                    {"\n"}
                    <span className="text-white"> provider={"{"}</span>
                    <span className="text-cyan-400">provider</span>
                    <span className="text-white">{"}"}</span>
                    {"\n"}
                    <span className="text-white"> onSuccess={"{"}</span>
                    <span className="text-white">
                      (result) ={">"} {"{"}
                    </span>
                    {"\n"}
                    <span className="text-gray-500"> // Navigate to next step</span>
                    {"\n"}
                    <span className="text-white"> {"}}"}</span>
                    {"\n"}
                    <span className="text-white"> onError={"{"}</span>
                    <span className="text-white">
                      (error) ={">"} {"{"}
                    </span>
                    {"\n"}
                    <span className="text-gray-500"> // Handle payment setup errors</span>
                    {"\n"}
                    <span className="text-white"> {"}}"}</span>
                    {"\n"}
                    <span className="text-red-400">{"/>"}</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("step4", step4Code)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["step4"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                After successful customer creation, redirect users to your payment setup page instead of the main
                application.
              </p>
            </div>

            {/* Step 5 */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Step 5: Payment Management</h3>
              <p className="mb-3 text-sm text-gray-500">Add ongoing payment method management capabilities:</p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">PaidCardManagementPage</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">
                      '@/src/paid/payments/core/payment-management/card-management'
                    </span>
                    <span className="text-white">;</span>
                    {"\n"}
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">paidConfig</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/app/paid.config'</span>
                    <span className="text-white">;</span>
                    {"\n\n"}
                    <span className="text-red-400">{"<PaidCardManagementPage"}</span>
                    {"\n"}
                    <span className="text-white"> customerId={"{"}</span>
                    <span className="text-cyan-400">currentUser</span>
                    <span className="text-white">.customerId{"}"}</span>
                    {"\n"}
                    <span className="text-white"> publishableKey={"{"}</span>
                    <span className="text-cyan-400">paidConfig</span>
                    <span className="text-white">.publishableKey{"}"}</span>
                    {"\n"}
                    <span className="text-red-400">{"/>"}</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("step5", step5Code)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["step5"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Step 6 */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Step 6: Billing Status Enforcement</h3>
              <p className="mb-3 text-sm text-gray-500">
                Implement middleware to gate premium features based on billing status:
              </p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-white">{" { "}</span>
                    <span className="text-amber-300">getCustomerBillingStatus</span>
                    <span className="text-white">{" } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-white"> </span>
                    <span className="text-green-400">'@/src/paid/payments/core/paid-billing/billingStatus'</span>
                    <span className="text-white">;</span>
                    {"\n\n"}
                    <span className="text-gray-500">// Define paying customer routes</span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> </span>
                    <span className="text-amber-300">PLAN_ROUTES</span>
                    <span className="text-white"> = [</span>
                    <span className="text-green-400">'/api/chat'</span>
                    <span className="text-white">, </span>
                    <span className="text-green-400">'/premium-feature'</span>
                    <span className="text-white">];</span>
                    {"\n\n"}
                    <span className="text-gray-500">// In your middleware</span>
                    {"\n"}
                    <span className="text-purple-400">if</span>
                    <span className="text-white"> (</span>
                    <span className="text-cyan-400">isPlanRoute</span>
                    <span className="text-white">(pathname) && currentUser) {"{"}</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> billingStatus = </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">getCustomerBillingStatus</span>
                    <span className="text-white">(</span>
                    {"\n"}
                    <span className="text-white"> currentUser.</span>
                    <span className="text-cyan-400">externalCustomerId</span>
                    <span className="text-white">,</span>
                    {"\n"}
                    <span className="text-white"> {"{}"}</span>
                    {"\n"}
                    <span className="text-white"> );</span>
                    {"\n\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">if</span>
                    <span className="text-white"> (!</span>
                    <span className="text-cyan-400">billingStatus</span>
                    <span className="text-white">.hasActiveOrders) {"{"}</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">return</span>
                    <span className="text-white"> NextResponse.</span>
                    <span className="text-cyan-400">redirect</span>
                    <span className="text-white">(</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">new</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">URL</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">'/manage-payment-method'</span>
                    <span className="text-white">, requestUrl)</span>
                    {"\n"}
                    <span className="text-white"> );</span>
                    {"\n"}
                    <span className="text-white"> {"}"}</span>
                    {"\n\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">if</span>
                    <span className="text-white"> (billingStatus.</span>
                    <span className="text-cyan-400">daysPastDue</span>
                    <span className="text-white"> {">"} </span>
                    <span className="text-orange-400">30</span>
                    <span className="text-white">) {"{"}</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">return</span>
                    <span className="text-white"> NextResponse.</span>
                    <span className="text-cyan-400">redirect</span>
                    <span className="text-white">(</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-purple-400">new</span>
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">URL</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">'/manage-payment-method'</span>
                    <span className="text-white">, requestUrl)</span>
                    {"\n"}
                    <span className="text-white"> );</span>
                    {"\n"}
                    <span className="text-white"> {"}"}</span>
                    {"\n"}
                    <span className="text-white">{"}"}</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("step6", step6Code)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["step6"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Customize billing enforcement by adjusting the grace period (30 days) and redirect destination based on
                your business requirements.
              </p>
            </div>

            {/* Configuration */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Configuration</h3>
              <p className="mb-3 text-sm text-gray-500">
                The generated <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700">paid.config.ts</code>{" "}
                contains your configuration:
              </p>

              <div className="relative rounded-lg bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">export</span>
                    <span className="text-white"> </span>
                    <span className="text-purple-400">const</span>
                    <span className="text-white"> </span>
                    <span className="text-amber-300">paidConfig</span>
                    <span className="text-white"> = {"{"}</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">publishableKey</span>
                    <span className="text-white">: </span>
                    <span className="text-green-400">"pk_12345"</span>
                    <span className="text-white">, </span>
                    <span className="text-gray-500">// Injected by monetize tool</span>
                    {"\n"}
                    <span className="text-white"> </span>
                    <span className="text-cyan-400">paidApiKey</span>
                    <span className="text-white">: </span>
                    <span className="text-green-400">"paid-api-key-123"</span>
                    <span className="text-white">, </span>
                    <span className="text-gray-500">// Injected by monetize tool</span>
                    {"\n"}
                    <span className="text-gray-500"> // ... other configuration</span>
                    {"\n"}
                    <span className="text-white">{"}"};</span>
                  </code>
                </pre>
                <button
                  onClick={() => handleCopy("config", configCode)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  {copiedBlocks["config"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Configure monetization accordion */}
            <div className="mb-4 rounded-lg border border-gray-200">
              <button
                onClick={() =>
                  setOpenAccordion(openAccordion === "configureMonetization" ? null : "configureMonetization")
                }
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Configure monetization</h3>
                    <p className="text-sm text-gray-500">
                      Set up payment processing and billing integration for your AI agent
                    </p>
                  </div>
                </div>
                {openAccordion === "configureMonetization" ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {openAccordion === "configureMonetization" && (
                <div className="border-t border-gray-200 p-4">
                  {/* API Keys Row */}
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Paid API key</label>
                      <input
                        type="text"
                        value={automatedForm.paidApiKey}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, paidApiKey: e.target.value })}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Agent ID</label>
                      <input
                        type="text"
                        value={automatedForm.agentId}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, agentId: e.target.value })}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Publishable Key */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Publishable key</label>
                    <input
                      type="text"
                      value={automatedForm.publishableKey}
                      onChange={(e) => setAutomatedForm({ ...automatedForm, publishableKey: e.target.value })}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                    />
                  </div>

                  {/* Framework & Provider */}
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Framework</label>
                      <select
                        value={automatedForm.framework}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, framework: e.target.value })}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                      >
                        <option value="">Select framework</option>
                        <option value="nextjs">Next.js</option>
                        <option value="react">React</option>
                        <option value="vue">Vue</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Provider</label>
                      <select
                        value={automatedForm.provider}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, provider: e.target.value })}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                      >
                        <option value="">Select provider</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing Page Selector */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Pricing page selector</label>
                    <select
                      value={automatedForm.pricingPage}
                      onChange={(e) => setAutomatedForm({ ...automatedForm, pricingPage: e.target.value })}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                    >
                      <option value="">Select the pricing page</option>
                      <option value="basic">Basic Pricing</option>
                      <option value="calculator">Pricing Calculator</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="mb-4 space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={automatedForm.enableCustomerManagement}
                        onChange={(e) =>
                          setAutomatedForm({ ...automatedForm, enableCustomerManagement: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">Enable customer management</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={automatedForm.enablePaymentProcessing}
                        onChange={(e) =>
                          setAutomatedForm({ ...automatedForm, enablePaymentProcessing: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">Enable payment processing</span>
                    </label>
                  </div>

                  {/* GitHub URL & Branch */}
                  <div className="mb-6 grid grid-cols-[1fr_200px] gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">GitHub repository URL</label>
                      <input
                        type="text"
                        value={automatedForm.githubUrl}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, githubUrl: e.target.value })}
                        placeholder="https://github.com/your-username/your-repo.git"
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Branch</label>
                      <input
                        type="text"
                        value={automatedForm.branch}
                        onChange={(e) => setAutomatedForm({ ...automatedForm, branch: e.target.value })}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-gray-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Setup Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSetupMonetization}
                      className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Setup monetization
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deployment preview accordion */}
            <div className="rounded-lg border border-gray-200">
              <button
                onClick={() => setDeploymentOpen(!deploymentOpen)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Deployment preview</h3>
                    <p className="text-sm text-gray-500">
                      Deploy your monetized AI agent to production with your framework of choice
                    </p>
                  </div>
                </div>
                {deploymentOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {deploymentOpen && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Vercel deployment</p>
                      <p className="text-sm text-gray-400">To be implemented</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Steps ... */}

        {/* Configuration ... */}
      </div>

      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customize entity templates</h2>
                <p className="text-sm text-gray-500">
                  Edit the JSON below to customize your agent config. This can be changed later too.
                </p>
              </div>
              <button onClick={() => setShowCustomizeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative rounded-lg bg-gray-900 p-4">
              <button
                onClick={() => handleCopy("customize-json", jsonConfig)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                {copiedBlocks["customize-json"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre className="overflow-x-auto text-sm">
                <code>
                  <span className="text-gray-300">{"{"}</span>
                  {"\n"}
                  <span className="text-purple-400">{`  "agent"`}</span>
                  <span className="text-gray-300">: {"{"}</span>
                  {"\n"}
                  <span className="text-purple-400">{`    "name"`}</span>
                  <span className="text-gray-300">: </span>
                  <span className="text-green-400">{`"ai-sdk-chatbot"`}</span>
                  <span className="text-gray-300">,</span>
                  {"\n"}
                  <span className="text-purple-400">{`    "description"`}</span>
                  <span className="text-gray-300">: </span>
                  <span className="text-green-400">{`"A chatbot"`}</span>
                  <span className="text-gray-300">,</span>
                  {"\n"}
                  <span className="text-purple-400">{`    "productCode"`}</span>
                  <span className="text-gray-300">: </span>
                  <span className="text-green-400">{`"ai-assistant-v1"`}</span>
                  <span className="text-gray-300">,</span>
                  {"\n"}
                  <span className="text-purple-400">{`    "externalId"`}</span>
                  <span className="text-gray-300">: </span>
                  <span className="text-green-400">{`"ai-sdk-chatbot-id"`}</span>
                  {"\n"}
                  <span className="text-gray-300">{"  },"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"  ..."}</span>
                  {"\n"}
                  <span className="text-gray-300">{"}"}</span>
                </code>
              </pre>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Save templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
