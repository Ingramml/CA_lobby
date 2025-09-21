"use client"

import * as React from "react"
import { Sidebar } from "@/components/ui/navigation/sidebar"
import { TopBar } from "@/components/ui/navigation/topbar"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { AuthWrapper } from "@/components/auth/AuthWrapper"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <AuthWrapper
      title="Dashboard Access Required"
      description="Please sign in to access the CA Lobby dashboard."
      redirectUrl="/sign-in"
    >
      <ToastProvider>
        <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "border-r bg-muted/40",
            // Mobile styles
            "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform md:relative md:translate-x-0 md:w-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop collapse styles
            "md:block",
            sidebarCollapsed && "md:w-16"
          )}
        >
          <div className="flex h-full max-h-screen flex-col gap-2">
            {/* Sidebar header with collapse button */}
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center justify-between w-full">
                {!sidebarCollapsed && (
                  <span className="text-lg font-semibold">CA Lobby</span>
                )}
                <button
                  onClick={toggleSidebarCollapse}
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
                >
                  {sidebarCollapsed ? "→" : "←"}
                </button>
              </div>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-auto">
              <Sidebar
                collapsed={sidebarCollapsed}
                className="px-2"
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col overflow-hidden">
          {/* Top bar */}
          <TopBar onToggleSidebar={toggleSidebar} />

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    </AuthWrapper>
  )
}