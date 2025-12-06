"use client"

import { useState } from "react"
import { Card, CardContent } from '@lastprice/ui'
import { Button } from '@lastprice/ui'
import { Switch } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { AlertTriangle, Pencil, Plus, Calendar } from "lucide-react"

interface CompanyAddress {
  addressLine1: string
  addressLine2: string
  city: string
  regionState: string
  postalCode: string
  country: string
}

interface USNexus {
  id: string
  stateCode: string
  stateName: string
  registrationDate: string
  endDate: string
}

interface EUVATConfig {
  vatNumber: string
  memberState: string
}

interface OtherCountryRegistration {
  id: string
  country: string
  registrationId: string
  type: string
  created: string
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "AL", name: "Albania" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
]

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

const EU_MEMBER_STATES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
]

export function TaxSettingsContent() {
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showNexusModal, setShowNexusModal] = useState(false)
  const [showVATModal, setShowVATModal] = useState(false)
  const [showOtherCountriesModal, setShowOtherCountriesModal] = useState(false)
  const [euCountrySearch, setEuCountrySearch] = useState("")

  const [companyAddress, setCompanyAddress] = useState<CompanyAddress | null>(null)
  const [addressForm, setAddressForm] = useState<CompanyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    regionState: "",
    postalCode: "",
    country: "",
  })

  const [nexusList, setNexusList] = useState<USNexus[]>([])
  const [nexusForm, setNexusForm] = useState({
    country: "US",
    stateCode: "",
    stateName: "",
    registrationDate: "",
    endDate: "",
  })

  const [euVATConfig, setEUVATConfig] = useState<EUVATConfig | null>(null)
  const [vatForm, setVatForm] = useState<EUVATConfig>({
    vatNumber: "",
    memberState: "",
  })

  const [otherCountriesRegistrations, setOtherCountriesRegistrations] = useState<OtherCountryRegistration[]>([])
  const [otherCountryForm, setOtherCountryForm] = useState({
    country: "",
    registrationId: "",
    type: "",
  })

  const hasIncompleteSetup = taxEnabled && !companyAddress && nexusList.length === 0 && !euVATConfig

  const handleToggleTax = (enabled: boolean) => {
    setTaxEnabled(enabled)
    if (enabled && !companyAddress && nexusList.length === 0 && !euVATConfig) {
      setShowWarningModal(true)
    }
  }

  const handleSaveAddress = () => {
    setCompanyAddress(addressForm)
    setShowAddressModal(false)
  }

  const handleAddNexus = () => {
    if (nexusForm.stateCode && nexusForm.registrationDate) {
      const newNexus: USNexus = {
        id: Date.now().toString(),
        stateCode: nexusForm.stateCode,
        stateName: nexusForm.stateName,
        registrationDate: nexusForm.registrationDate,
        endDate: nexusForm.endDate,
      }
      setNexusList([...nexusList, newNexus])
      setNexusForm({ country: "US", stateCode: "", stateName: "", registrationDate: "", endDate: "" })
      setShowNexusModal(false)
    }
  }

  const handleSaveVAT = () => {
    if (vatForm.vatNumber && vatForm.memberState) {
      setEUVATConfig(vatForm)
      setShowVATModal(false)
    }
  }

  const handleAddOtherCountry = () => {
    if (otherCountryForm.country && otherCountryForm.registrationId) {
      const newRegistration: OtherCountryRegistration = {
        id: Date.now().toString(),
        country: otherCountryForm.country,
        registrationId: otherCountryForm.registrationId,
        type: otherCountryForm.type || "VAT",
        created: new Date().toISOString().split("T")[0],
      }
      setOtherCountriesRegistrations([...otherCountriesRegistrations, newRegistration])
      setOtherCountryForm({ country: "", registrationId: "", type: "" })
      setShowOtherCountriesModal(false)
    }
  }

  const filteredEUCountries = EU_MEMBER_STATES.filter(
    (country) =>
      country.name.toLowerCase().includes(euCountrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(euCountrySearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {taxEnabled && hasIncompleteSetup && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-amber-800">Warning</span>
            <p className="text-sm text-amber-700">
              Tax calculations are enabled, but you have not configured any tax registrations (EU VAT, US Nexus or other
              Registrations) or set a company address. This may lead to incorrect tax calculations. Please update your
              settings.
            </p>
          </div>
        </div>
      )}

      {/* Enable Tax Calculations */}
      <Card className="rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Enable tax calculations</h3>
              <p className="text-sm text-muted-foreground">
                Toggle to enable or disable tax calculations for your organization. When enabled, sales tax will be
                calculated for all applicable transactions and added to invoices.
              </p>
            </div>
            <Switch checked={taxEnabled} onCheckedChange={handleToggleTax} />
          </div>
        </CardContent>
      </Card>

      {/* Company Address */}
      <Card className="rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Company address</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (companyAddress) {
                  setAddressForm(companyAddress)
                }
                setShowAddressModal(true)
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          {companyAddress ? (
            <div className="text-sm text-foreground space-y-0.5">
              <p>{companyAddress.addressLine1}</p>
              {companyAddress.addressLine2 && <p>{companyAddress.addressLine2}</p>}
              <p>
                {companyAddress.city}
                {companyAddress.regionState && `, ${companyAddress.regionState}`}
                {companyAddress.postalCode && ` ${companyAddress.postalCode}`}
              </p>
              <p>{companyAddress.country}</p>
            </div>
          ) : (
            <p className="text-sm text-amber-600">No address set</p>
          )}

          <p className="text-xs text-amber-600 mt-4">* Company address is required for accurate tax calculations.</p>
        </CardContent>
      </Card>

      {/* US Nexus */}
      <Card className="rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">US Nexus</h3>
            <Button onClick={() => setShowNexusModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State code</TableHead>
                <TableHead>State name</TableHead>
                <TableHead>Registration date</TableHead>
                <TableHead>End date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nexusList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No US nexus configured
                  </TableCell>
                </TableRow>
              ) : (
                nexusList.map((nexus) => (
                  <TableRow key={nexus.id}>
                    <TableCell>{nexus.stateCode}</TableCell>
                    <TableCell>{nexus.stateName}</TableCell>
                    <TableCell>{nexus.registrationDate}</TableCell>
                    <TableCell>{nexus.endDate || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <p className="text-xs text-amber-600 mt-4">
            * US sales tax is only calculated for destination states where a nexus is configured.
          </p>
        </CardContent>
      </Card>

      {/* EU VAT (OSS) */}
      <Card className="rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">EU VAT (OSS)</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${euVATConfig ? "bg-green-100 text-green-700" : "text-amber-600"}`}
                >
                  {euVATConfig ? "Configured" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your VAT number and Member State of Identification to configure EU VAT (OSS) calculations.
              </p>
              {euVATConfig && (
                <div className="text-sm mt-2">
                  <p>VAT Number: {euVATConfig.vatNumber}</p>
                  <p>Member State: {euVATConfig.memberState}</p>
                </div>
              )}
            </div>
            <Button
              variant={euVATConfig ? "outline" : "default"}
              onClick={() => {
                if (euVATConfig) {
                  setVatForm(euVATConfig)
                }
                setShowVATModal(true)
              }}
            >
              {euVATConfig ? "Edit" : "Configure"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Other Countries (VAT/GST)</h3>
            <Button onClick={() => setShowOtherCountriesModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Registration ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherCountriesRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No registrations configured
                  </TableCell>
                </TableRow>
              ) : (
                otherCountriesRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.country}</TableCell>
                    <TableCell>{reg.registrationId}</TableCell>
                    <TableCell>{reg.type}</TableCell>
                    <TableCell>{reg.created}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incomplete Tax Setup Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Incomplete tax setup</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tax collection is enabled, but you haven't configured any tax registrations (EU VAT, US Nexus, or other
            registrations) or set a company address. This may lead to incorrect tax calculations.
          </p>
          <div className="flex justify-end mt-4">
            <Button variant="destructive" onClick={() => setShowWarningModal(false)}>
              I understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit company address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>
                Address line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Street and number"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address line 2 (optional)</Label>
              <Input
                placeholder="Suite / floor"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Region / state <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., CA"
                  value={addressForm.regionState}
                  onChange={(e) => setAddressForm({ ...addressForm, regionState: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Postal code <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="ZIP / Postcode"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Country <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={addressForm.country}
                  onValueChange={(value) => setAddressForm({ ...addressForm, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowAddressModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNexusModal} onOpenChange={setShowNexusModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New US nexus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value="US" disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Registration date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={nexusForm.registrationDate}
                    onChange={(e) => setNexusForm({ ...nexusForm, registrationDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State code</Label>
                <Input
                  placeholder="e.g., CA"
                  value={nexusForm.stateCode}
                  onChange={(e) => setNexusForm({ ...nexusForm, stateCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>State name</Label>
                <Input
                  placeholder="e.g., California"
                  value={nexusForm.stateName}
                  onChange={(e) => setNexusForm({ ...nexusForm, stateName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End date (optional)</Label>
              <div className="relative w-1/2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-10"
                  placeholder="yyyy-mm-dd"
                  value={nexusForm.endDate}
                  onChange={(e) => setNexusForm({ ...nexusForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowNexusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNexus}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVATModal} onOpenChange={setShowVATModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure EU VAT (OSS)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Member state of identification</Label>
                <Select
                  value={vatForm.memberState}
                  onValueChange={(value) => setVatForm({ ...vatForm, memberState: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search countries..."
                        value={euCountrySearch}
                        onChange={(e) => setEuCountrySearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredEUCountries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        <span className="flex items-center gap-2">
                          {country.name} <span className="text-muted-foreground">{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>EU VAT number</Label>
                <Input
                  placeholder="e.g., DE123456789"
                  value={vatForm.vatNumber}
                  onChange={(e) => setVatForm({ ...vatForm, vatNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowVATModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVAT}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtherCountriesModal} onOpenChange={setShowOtherCountriesModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add VAT/GST Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={otherCountryForm.country}
                onValueChange={(value) => setOtherCountryForm({ ...otherCountryForm, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Registration ID</Label>
              <Input
                placeholder="Enter registration ID"
                value={otherCountryForm.registrationId}
                onChange={(e) => setOtherCountryForm({ ...otherCountryForm, registrationId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={otherCountryForm.type}
                onValueChange={(value) => setOtherCountryForm({ ...otherCountryForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowOtherCountriesModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOtherCountry}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
