"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LayoutGrid, Plus, Trash2, Copy, Check } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  description: string
  created: string
  lastUsed: string
  secretKey?: string
}

const initialApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:07:21 PM",
    lastUsed: "Never",
  },
  {
    id: "2",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:07:30 PM",
    lastUsed: "Never",
  },
  {
    id: "3",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:17:32 PM",
    lastUsed: "Never",
  },
  {
    id: "4",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:17:33 PM",
    lastUsed: "Never",
  },
  {
    id: "5",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:19:35 PM",
    lastUsed: "Never",
  },
  {
    id: "6",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:25:15 PM",
    lastUsed: "Never",
  },
  {
    id: "7",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:25:19 PM",
    lastUsed: "Never",
  },
  {
    id: "8",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:25:39 PM",
    lastUsed: "Never",
  },
  {
    id: "9",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:25:42 PM",
    lastUsed: "Never",
  },
  {
    id: "10",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/5/2025, 11:25:46 PM",
    lastUsed: "Never",
  },
  {
    id: "11",
    name: "Developer key",
    description: "Generated for developer guide",
    created: "12/6/2025, 12:33:36 AM",
    lastUsed: "Never",
  },
]

function getCodeSnippet(token: string): string {
  return `import { PaidClient } from '@paid-ai/paid-node';

const client = new PaidClient({ token: "${token}" });`
}

export function ApiKeysContent() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyDescription, setNewKeyDescription] = useState("")
  const [generatedKey, setGeneratedKey] = useState("")
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCreateKey = () => {
    const newKey = crypto.randomUUID()
    setGeneratedKey(newKey)

    const newApiKey: ApiKey = {
      id: String(apiKeys.length + 1),
      name: newKeyName || "Developer key",
      description: newKeyDescription || "Generated for developer guide",
      created: new Date().toLocaleString(),
      lastUsed: "Never",
      secretKey: newKey,
    }

    setApiKeys([...apiKeys, newApiKey])
    setShowCreateModal(false)
    setShowNewKeyModal(true)
    setNewKeyName("")
    setNewKeyDescription("")
  }

  const handleDeleteKey = () => {
    if (keyToDelete) {
      setApiKeys(apiKeys.filter((key) => key.id !== keyToDelete))
      setKeyToDelete(null)
      setShowDeleteModal(false)
    }
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet(generatedKey))
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const confirmDelete = (id: string) => {
    setKeyToDelete(id)
    setShowDeleteModal(true)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LayoutGrid className="h-4 w-4" />
          <span>Settings</span>
          <span className="text-gray-300">{">"}</span>
          <span className="text-gray-900 font-medium">API keys</span>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create new secret key
        </Button>
      </div>

      {/* Description */}
      <div className="mb-6 space-y-2">
        <p className="text-sm text-gray-700">
          As an owner of this organization, you can view and manage all API keys in this organization.
        </p>
        <p className="text-sm text-gray-500">
          Do not share your API key with others or expose it in the browser or other client-side code.
        </p>
        <p className="text-sm text-gray-500">
          {"View usage per API key on the "}
          <Link href="/developers" className="text-emerald-600 hover:underline">
            getting started page
          </Link>
          .
        </p>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Used
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key, index) => (
              <tr key={key.id} className={index !== apiKeys.length - 1 ? "border-b border-gray-200" : ""}>
                <td className="px-4 py-3 text-sm text-gray-900">{key.name}</td>
                <td className="px-4 py-3 text-sm text-emerald-600">{key.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{key.created}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{key.lastUsed}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => confirmDelete(key.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-semibold">Create new secret key</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600 text-right block">Token name</label>
              <Input
                placeholder=""
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600 text-right block">Description</label>
              <Textarea
                placeholder=""
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
                className="border-gray-300 min-h-[80px] resize-none"
              />
            </div>
            <Button onClick={handleCreateKey} className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Generated Modal */}
      <Dialog open={showNewKeyModal} onOpenChange={setShowNewKeyModal}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-semibold">Secret key</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-gray-600">
              Keep this key safe and secret. You will not be able to see it again.
            </p>

            {/* Key display box */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-4 py-3">
              <code className="flex-1 text-sm text-amber-400 font-mono break-all">{generatedKey}</code>
              <button
                onClick={handleCopyKey}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-sm text-gray-600">
              We recommend storing this in an environment variable. But to make it easier to test you can use the code
              below.
            </p>

            {/* Code snippet - plain text */}
            <div className="relative bg-[#1a1a1a] rounded-lg p-4">
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <pre className="text-sm font-mono overflow-x-auto text-emerald-400 whitespace-pre-wrap pr-8">
                {getCodeSnippet(generatedKey)}
              </pre>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowNewKeyModal(false)} variant="outline" className="border-gray-300">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete API key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this API key? This action cannot be undone and any applications using this
              key will stop working.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteKey} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
