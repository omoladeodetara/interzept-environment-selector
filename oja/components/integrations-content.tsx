"use client"

import { useState } from "react"
import { Button } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { ExternalLink, X, Link, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from '@lastprice/ui'
import { TestModeBanner } from "@/components/test-mode-banner"
import { useWorkspace } from "@/contexts/workspace-context"

interface Integration {
  id: string
  name: string
  description: string
  logo: string
  color: string
  tagline: string
  features: string[]
  modalType: "oauth" | "api-keys"
}

const integrations: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect your Salesforce account to sync quotes and orders automatically",
    logo: "/salesforce-cloud-logo-blue.jpg",
    color: "#0176D3",
    tagline: "Sync records from Salesforce",
    modalType: "oauth",
    features: [
      "Automatically create or update records in Salesforce",
      "Sync records from Salesforce",
      "Receive updates when a record in Salesforce is created or updated",
    ],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Connect your Datadog account to ingest telemetry data",
    logo: "/datadog-purple-dog-logo.jpg",
    color: "#632CA6",
    tagline: "Monitor and analyze telemetry data",
    modalType: "api-keys",
    features: [
      "Send metrics and logs to Datadog",
      "Monitor application performance",
      "Set up alerts and dashboards for your data",
    ],
  },
]

export function IntegrationsContent() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "configuration">("overview")
  const { isSandbox } = useWorkspace()

  const [datadogForm, setDatadogForm] = useState({
    name: "",
    description: "",
    apiKey: "",
    appKey: "",
  })

  const handleConnect = (integration: Integration) => {
    if (isSandbox) return
    setSelectedIntegration(integration)
    setActiveTab("overview")
    setDatadogForm({ name: "", description: "", apiKey: "", appKey: "" })
  }

  const handleCloseModal = () => {
    setSelectedIntegration(null)
  }

  const handleAddKeys = () => {
    console.log("Adding Datadog keys:", datadogForm)
    handleCloseModal()
  }

  const renderDatadogModal = () => (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-foreground">Datadog integration</h2>
          <button onClick={handleCloseModal} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your Datadog API and App keys to enable telemetry ingestion
        </p>

        <hr className="border-border mb-6" />

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., datadog-prod"
              value={datadogForm.name}
              onChange={(e) => setDatadogForm({ ...datadogForm, name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {"Must contain only alphanumeric characters or: -/_+=.@!"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <Input
              placeholder="e.g., Production monitoring keys"
              value={datadogForm.description}
              onChange={(e) => setDatadogForm({ ...datadogForm, description: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1.5">Optional description to help identify this key pair</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Datadog API key <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter your Datadog API key"
              type="password"
              value={datadogForm.apiKey}
              onChange={(e) => setDatadogForm({ ...datadogForm, apiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1.5">{"Found in organization settings → API keys"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Datadog app key <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter your app key"
              type="password"
              value={datadogForm.appKey}
              onChange={(e) => setDatadogForm({ ...datadogForm, appKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1.5">{"Found in personal settings → application keys"}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleCloseModal} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleAddKeys}
            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            disabled={!datadogForm.name || !datadogForm.apiKey || !datadogForm.appKey}
          >
            <Link className="w-4 h-4 mr-2" />
            Add keys
          </Button>
        </div>
      </div>
    </>
  )

  const renderOAuthModal = (integration: Integration) => (
    <>
      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: integration.color }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            <img
              src={integration.logo || "/placeholder.svg"}
              alt={`${integration.name} logo`}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{integration.name}</h2>
            <p className="text-sm text-white/80">{integration.tagline}</p>
          </div>
        </div>
        <Button variant="outline" className="bg-white text-foreground hover:bg-gray-100 border-0">
          Connect
        </Button>
      </div>

      <button
        onClick={handleCloseModal}
        className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("configuration")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "configuration"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuration
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your {integration.name} account and sync your {integration.name} accounts, contacts, leads, or
              opportunities. Enable your sales team to close more deals by keeping your {integration.name} CRM records
              up to date - without manual data entry.
            </p>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Our {integration.name} integration enables you to:</p>
              <ul className="space-y-1">
                {integration.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "configuration" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure your {integration.name} integration settings here. You will need to authenticate with your{" "}
              {integration.name} account to enable the integration.
            </p>
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Authenticate with {integration.name}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <span className="font-medium">Paragon</span>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex flex-col h-full">
      <TestModeBanner />

      <div className="space-y-6 p-6">
        <p className="text-muted-foreground">
          Connect your organization with external identity providers to enable direct access from external systems.
        </p>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                    <img
                      src={integration.logo || "/placeholder.svg"}
                      alt={`${integration.name} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect(integration)}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
              {isSandbox && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Third-party integrations are disabled in test mode. Switch to live mode to connect{" "}
                    {integration.name}.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={!!selectedIntegration} onOpenChange={handleCloseModal}>
          <DialogContent
            className={`p-0 overflow-hidden max-w-lg ${selectedIntegration?.modalType === "api-keys" ? "" : ""}`}
          >
            <DialogTitle className="sr-only">{selectedIntegration?.name} Integration</DialogTitle>

            {selectedIntegration &&
              (selectedIntegration.modalType === "api-keys"
                ? renderDatadogModal()
                : renderOAuthModal(selectedIntegration))}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
