"use client"

import { useState } from "react"
import { Search, Pencil, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface CompanyData {
  name: string
  source: string
  email: string
  phone: string
  website: string
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  description: string
}

export function CompanySettingsContent() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [domainInput, setDomainInput] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "Zyleme",
    source: "From brandfetch",
    email: "",
    phone: "",
    website: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    description: "",
  })

  const [editData, setEditData] = useState<CompanyData>(companyData)

  const handleFetchAndSave = async () => {
    if (!domainInput) return
    setIsFetching(true)
    // Simulate fetching company data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCompanyData((prev) => ({
      ...prev,
      name: domainInput.split(".")[0].charAt(0).toUpperCase() + domainInput.split(".")[0].slice(1),
      source: "From brandfetch",
      website: domainInput,
    }))
    setIsFetching(false)
    toast({
      title: "Success",
      description: "Company information fetched successfully",
    })
  }

  const handleEdit = () => {
    setEditData(companyData)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(companyData)
    setIsEditing(false)
  }

  const handleSave = () => {
    setCompanyData(editData)
    setIsEditing(false)
    toast({
      title: "Success",
      description: "Company settings saved successfully",
    })
  }

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const displayValue = (value: string) => value || "-"

  return (
    <div className="space-y-6">
      {/* Fetch company information section */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-xl font-semibold text-foreground">Fetch company information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your website domain to automatically fetch and save company details
        </p>
        <div className="mt-4 flex gap-3">
          <Input
            placeholder="Enter your website domain (e.g., apple.com)"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleFetchAndSave}
            disabled={!domainInput || isFetching}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Search className="mr-2 h-4 w-4" />
            {isFetching ? "Fetching..." : "Fetch & save"}
          </Button>
        </div>
      </div>

      {/* Company information section */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Company information</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {/* Company name and Email row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Company name</label>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1">
                  <p className="text-foreground">{displayValue(companyData.name)}</p>
                  {companyData.source && <p className="text-xs text-muted-foreground">{companyData.source}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={editData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.email)}</p>
              )}
            </div>
          </div>

          {/* Phone and Website row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              {isEditing ? (
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={editData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.phone)}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Website</label>
              {isEditing ? (
                <Input
                  placeholder="Enter website"
                  value={editData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.website)}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-foreground">Address</label>
            {isEditing ? (
              <Input
                placeholder="Enter street address"
                value={editData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-foreground">{displayValue(companyData.address)}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="text-sm font-medium text-foreground">Address Line 2 (Optional)</label>
            {isEditing ? (
              <Input
                placeholder="Suite, unit, building, floor, etc."
                value={editData.addressLine2}
                onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-foreground">{displayValue(companyData.addressLine2)}</p>
            )}
          </div>

          {/* City and State row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">City</label>
              {isEditing ? (
                <Input
                  placeholder="Enter city"
                  value={editData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.city)}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">State / province</label>
              {isEditing ? (
                <Input
                  placeholder="Enter state"
                  value={editData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.state)}</p>
              )}
            </div>
          </div>

          {/* Zip and Country row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Zip / postal code</label>
              {isEditing ? (
                <Input
                  placeholder="Enter zip code"
                  value={editData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.zipCode)}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Country</label>
              {isEditing ? (
                <Input
                  placeholder="Enter country"
                  value={editData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-foreground">{displayValue(companyData.country)}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            {isEditing ? (
              <Input
                placeholder="Enter company description"
                value={editData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-foreground">{displayValue(companyData.description)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
