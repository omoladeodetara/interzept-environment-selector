"use client"

import { useState } from "react"
import { LayoutGrid, ChevronRight, Mail, ArrowUpDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TestModeBanner } from "@/components/test-mode-banner"
import { useWorkspace } from "@/contexts/workspace-context"

interface TeamMember {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
  lastLogin: string
  avatar?: string
}

interface PendingInvitation {
  id: string
  email: string
  invitedDate: string
  expiresIn: string
}

const initialTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Omolade Odetara",
    email: "omoladeodetara@gmail.com",
    status: "active",
    lastLogin: "12/5/2025, 10:55:07 PM",
    avatar: "/professional-headshot.png",
  },
]

const initialPendingInvitations: PendingInvitation[] = []

export function TeamSettingsContent() {
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>(initialPendingInvitations)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { isSandbox } = useWorkspace()

  const handleInviteUser = () => {
    if (inviteEmail) {
      const newInvitation: PendingInvitation = {
        id: Date.now().toString(),
        email: inviteEmail,
        invitedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        expiresIn: "7d",
      }
      setPendingInvitations([...pendingInvitations, newInvitation])
      setInviteEmail("")
      setIsInviteModalOpen(false)
    }
  }

  const sortedTeamMembers = [...teamMembers].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.name.localeCompare(b.name)
    }
    return b.name.localeCompare(a.name)
  })

  return (
    <div className="flex flex-col h-full">
      <TestModeBanner />

      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span>Settings</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Team</span>
        </div>
        <Button
          onClick={() => !isSandbox && setIsInviteModalOpen(true)}
          disabled={isSandbox}
          className={
            isSandbox
              ? "bg-[#1a1a1a] text-white opacity-100 cursor-not-allowed"
              : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
          }
        >
          {isSandbox ? "Invite user (Disabled in test mode)" : "Invite user"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isSandbox && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 bg-gray-50 px-4 py-3 rounded-lg border">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Team invitations are disabled in test mode. Switch to live mode to invite users.</span>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1">Team members</h2>
          <p className="text-sm text-muted-foreground mb-4">Active members of your organization</p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    >
                      Name
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last login
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTeamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm">Active</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{member.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Pending invitations</h2>
          <p className="text-sm text-muted-foreground mb-4">Invitations that have been sent but not yet accepted</p>

          <div className="border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="font-medium text-sm mb-1">No pending invites</h3>
            <p className="text-sm text-muted-foreground">All sent invitations have been accepted or expired</p>
          </div>
        </div>
      </div>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleInviteUser} className="w-full bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]">
              Send invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
