"use client"

import { useState } from "react"
import { Button } from '@lastprice/ui'
import { Card, CardContent } from '@lastprice/ui'
import { Switch } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Checkbox } from '@lastprice/ui'
import { X, Check, ChevronDown, MoreHorizontal } from "lucide-react"

interface ValueReceiptConfig {
  id: string
  agentId: string
  agentName: string
  scope: string
  showROI: boolean
  showHVE: boolean
  showCosts: boolean
  signals: string[]
  updatedAt: Date
}

interface SignalConfig {
  name: string
  displayName: string
  dataFields: string[]
  includeTimestamp: boolean
  enabled: boolean
}

const mockAgents = [
  {
    id: "1",
    name: "Customer Support AI Agent",
    signals: [
      "Issue escalation logged",
      "Support ticket created",
      "Live chat initiated",
      "Follow-up email sent",
      "Customer satisfaction assessed",
      "Product information provided",
    ],
  },
  { id: "2", name: "SS", signals: ["Signal A", "Signal B"] },
  { id: "3", name: "QQ", signals: ["Signal X", "Signal Y"] },
  { id: "4", name: "A", signals: ["Event 1", "Event 2"] },
  { id: "5", name: "ai-sdk-chatbot", signals: ["Chat started", "Chat ended", "User feedback collected"] },
]

export function ValueReceiptsContent() {
  const [configs, setConfigs] = useState<ValueReceiptConfig[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [showROI, setShowROI] = useState(true)
  const [showHVE, setShowHVE] = useState(true)
  const [showCosts, setShowCosts] = useState(true)
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)
  const [signalConfigs, setSignalConfigs] = useState<SignalConfig[]>([])
  const [newDataField, setNewDataField] = useState<{ [key: string]: string }>({})

  const selectedAgentData = mockAgents.find((a) => a.id === selectedAgent)

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
    const agent = mockAgents.find((a) => a.id === agentId)
    if (agent) {
      setSignalConfigs(
        agent.signals.map((signal) => ({
          name: signal,
          displayName: signal,
          dataFields: [],
          includeTimestamp: false,
          enabled: false,
        })),
      )
    }
    setAgentDropdownOpen(false)
  }

  const toggleSignal = (signalName: string, enabled: boolean) => {
    setSignalConfigs(signalConfigs.map((s) => (s.name === signalName ? { ...s, enabled } : s)))
  }

  const updateDisplayName = (signalName: string, displayName: string) => {
    setSignalConfigs(signalConfigs.map((s) => (s.name === signalName ? { ...s, displayName } : s)))
  }

  const addDataField = (signalName: string) => {
    const fieldValue = newDataField[signalName]
    if (!fieldValue) return
    setSignalConfigs(
      signalConfigs.map((s) => (s.name === signalName ? { ...s, dataFields: [...s.dataFields, fieldValue] } : s)),
    )
    setNewDataField({ ...newDataField, [signalName]: "" })
  }

  const toggleTimestamp = (signalName: string, includeTimestamp: boolean) => {
    setSignalConfigs(signalConfigs.map((s) => (s.name === signalName ? { ...s, includeTimestamp } : s)))
  }

  const handleCreateConfig = () => {
    if (!selectedAgent || !selectedAgentData) return

    const newConfig: ValueReceiptConfig = {
      id: Date.now().toString(),
      agentId: selectedAgent,
      agentName: selectedAgentData.name,
      scope: "All customers",
      showROI,
      showHVE,
      showCosts,
      signals: signalConfigs.filter((s) => s.enabled).map((s) => s.name),
      updatedAt: new Date(),
    }

    setConfigs([...configs, newConfig])
    resetForm()
    setShowCreateModal(false)
  }

  const resetForm = () => {
    setSelectedAgent("")
    setShowROI(true)
    setShowHVE(true)
    setShowCosts(true)
    setSignalConfigs([])
    setNewDataField({})
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const getDisplayName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 18) + "..."
    }
    return name
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const enabledSignals = signalConfigs.filter((s) => s.enabled)

  const mockQuantities: { [key: string]: number } = {
    "Issue escalation logged": 247,
    "Live chat initiated": 340,
    "Support ticket created": 156,
    "Follow-up email sent": 89,
    "Customer satisfaction assessed": 203,
    "Product information provided": 412,
  }

  return (
    <div className="space-y-6">
      {/* Value receipt configurations */}
      <Card className="border border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Value receipt configurations</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage how Value Receipts are generated for your agents. These configurations control which signals and
                metadata are displayed
              </p>
            </div>
            <Button onClick={handleOpenCreate} className="bg-foreground text-background hover:bg-foreground/90">
              New config
            </Button>
          </div>

          {configs.length === 0 ? (
            <div className="border border-dashed rounded-lg min-h-[120px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No value receipt configurations yet.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b text-sm text-muted-foreground">
                <span>Agent name</span>
                <span>Scope</span>
                <span>Updated</span>
                <span className="text-right">Actions</span>
              </div>
              {/* Table rows */}
              {configs.map((config) => (
                <div key={config.id} className="grid grid-cols-4 gap-4 px-4 py-3 items-center text-sm">
                  <span className="text-blue-600">{config.agentName}</span>
                  <span className="text-muted-foreground">{config.scope}</span>
                  <span className="text-muted-foreground">{formatDate(config.updatedAt)}</span>
                  <div className="flex justify-end">
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create value receipt config modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[calc(100vh-8rem)] overflow-hidden">
            <div className="flex h-full">
              {/* Left panel - Form */}
              <div className="flex-1 p-6 overflow-y-auto border-r max-h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Create value receipt config</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Agent selection */}
                <div className="mb-8">
                  <h3 className="font-medium mb-1">Agent</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose the agent this configuration applies to. Each agent can have at most one Value Receipt
                    configuration.
                  </p>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
                      className="flex items-center justify-between w-[220px] px-3 py-2 text-sm border rounded-md bg-background hover:bg-muted/50"
                    >
                      <span>{selectedAgentData ? getDisplayName(selectedAgentData.name) : "Select agent"}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {agentDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-[220px] bg-background border rounded-md shadow-lg z-10">
                        {mockAgents.map((agent) => (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => handleAgentSelect(agent.id)}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted/50 text-left"
                          >
                            <span>{agent.name}</span>
                            {selectedAgent === agent.id && <Check className="h-4 w-4 text-foreground" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Display sections */}
                <div className="mb-8">
                  <h3 className="font-medium mb-1">Display sections</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control which high-level sections appear on the Value Receipt.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Switch checked={showROI} onCheckedChange={setShowROI} />
                      <div>
                        <p className="font-medium text-sm">Show ROI (Return on Investment)</p>
                        <p className="text-sm text-muted-foreground">
                          Include an ROI section comparing value created to associated costs, highlighting efficiency
                          and payback.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Switch checked={showHVE} onCheckedChange={setShowHVE} />
                      <div>
                        <p className="font-medium text-sm">Show HVE (Human Value Equivalent)</p>
                        <p className="text-sm text-muted-foreground">
                          Display human-equivalent labor comparison so stakeholders can interpret automation impact in
                          familiar terms.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Switch checked={showCosts} onCheckedChange={setShowCosts} />
                      <div>
                        <p className="font-medium text-sm">Show costs</p>
                        <p className="text-sm text-muted-foreground">
                          Reveal cost metrics for context. Hiding this can simplify Value Receipts for end customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signals */}
                <div className="mb-8">
                  <h3 className="font-medium mb-1">Signals</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select which agent signals (events) to include. Provide optional data fields and timestamps.
                  </p>

                  {selectedAgent && signalConfigs.length > 0 ? (
                    <div className="space-y-3">
                      {signalConfigs.map((signal) => (
                        <div key={signal.name} className="border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-medium">{signal.name}</span>
                            <Switch
                              checked={signal.enabled}
                              onCheckedChange={(checked) => toggleSignal(signal.name, checked)}
                            />
                          </div>

                          {signal.enabled && (
                            <div className="px-4 pb-4 space-y-4 border-t pt-4">
                              {/* Display Name */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Display Name
                                </label>
                                <Input
                                  value={signal.displayName}
                                  onChange={(e) => updateDisplayName(signal.name, e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              {/* Data Fields */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Data Fields
                                </label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    placeholder="Add data field (string)"
                                    value={newDataField[signal.name] || ""}
                                    onChange={(e) =>
                                      setNewDataField({ ...newDataField, [signal.name]: e.target.value })
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => addDataField(signal.name)}
                                    disabled={!newDataField[signal.name]}
                                  >
                                    Add
                                  </Button>
                                </div>
                                {signal.dataFields.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {signal.dataFields.map((field, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-muted text-sm rounded">
                                        {field}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Timestamp checkbox */}
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`timestamp-${signal.name}`}
                                  checked={signal.includeTimestamp}
                                  onCheckedChange={(checked) => toggleTimestamp(signal.name, checked as boolean)}
                                />
                                <label htmlFor={`timestamp-${signal.name}`} className="text-sm text-muted-foreground">
                                  Include timestamp for each signal row
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg min-h-[80px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Select an agent to view its signals.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateConfig}
                    disabled={!selectedAgent}
                    className="bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    Create config
                  </Button>
                </div>
              </div>

              {/* Right panel - Preview */}
              <div className="w-[400px] bg-muted/30 p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <h3 className="font-medium mb-4">Preview</h3>
                <div className="bg-background rounded-lg border overflow-hidden">
                  {selectedAgent && selectedAgentData ? (
                    <>
                      {/* Preview header */}
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-foreground">Value Receipt</h4>
                        <p className="text-sm text-blue-600 mt-2">Sample Product</p>
                      </div>

                      {/* Table header */}
                      <div className="px-4">
                        <div className="flex items-center justify-between text-xs text-blue-600 border-b pb-2">
                          <span>Signal</span>
                          <span>Quantity</span>
                        </div>
                      </div>

                      <div className="px-4 py-2 min-h-[150px]">
                        {enabledSignals.length > 0 ? (
                          <div className="space-y-2">
                            {enabledSignals.map((signal) => (
                              <div key={signal.name} className="flex items-center justify-between text-sm py-1">
                                <span className="text-blue-600 underline">{signal.displayName}</span>
                                <span>{mockQuantities[signal.name] || 0}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {/* Footer line */}
                      <div className="px-4 pb-2">
                        <div className="flex items-center justify-end text-xs border-t pt-2">
                          <span className="text-muted-foreground mr-4">Value generated</span>
                          <span>$0.00</span>
                        </div>
                      </div>

                      {/* Footer with metrics */}
                      <div className="bg-foreground text-background p-4">
                        <div className="flex items-center justify-end gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Costs</p>
                            <p className="font-medium">$0.00</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total value generated</p>
                            <p className="font-medium">$0.00</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">ROI</p>
                            <p className="font-medium">0x</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Select an agent to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
