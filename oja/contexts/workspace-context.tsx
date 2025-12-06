"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Workspace {
  type: "team" | "sandbox"
  id: string
  name: string
}

interface WorkspaceContextType {
  selectedWorkspace: Workspace
  setSelectedWorkspace: (workspace: Workspace) => void
  isSandbox: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>({
    type: "team",
    id: "zyleme",
    name: "Zyleme",
  })

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace,
        isSandbox: selectedWorkspace.type === "sandbox",
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
