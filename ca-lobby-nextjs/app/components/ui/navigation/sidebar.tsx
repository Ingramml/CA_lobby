"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { filterNavigationByPermissions } from "../../../lib/auth"
import {
  DatabaseIcon,
  BarChartIcon,
  FileTextIcon,
  UploadIcon,
  SearchIcon,
  SettingsIcon,
  HomeIcon,
  TrendingUpIcon,
  UsersIcon,
  UserCogIcon,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Lobbying Data",
    icon: DatabaseIcon,
    children: [
      {
        title: "Browse Data",
        href: "/lobbying-data",
        icon: SearchIcon,
      },
      {
        title: "Payments",
        href: "/lobbying-data/payments",
        icon: TrendingUpIcon,
      },
      {
        title: "Associations",
        href: "/lobbying-data/associations",
        icon: UsersIcon,
      },
      {
        title: "Trends",
        href: "/lobbying-data/trends",
        icon: BarChartIcon,
      },
    ],
  },
  {
    title: "Reports",
    icon: FileTextIcon,
    children: [
      {
        title: "View Reports",
        href: "/reports",
        icon: FileTextIcon,
      },
      {
        title: "Create Report",
        href: "/reports/create",
        icon: FileTextIcon,
      },
    ],
  },
  {
    title: "Data Management",
    icon: UploadIcon,
    children: [
      {
        title: "Upload Data",
        href: "/data/upload",
        icon: UploadIcon,
      },
      {
        title: "Transform Data",
        href: "/data/transform",
        icon: SettingsIcon,
      },
      {
        title: "Analyze Data",
        href: "/data/analyze",
        icon: BarChartIcon,
      },
    ],
  },
  {
    title: "Administration",
    icon: UserCogIcon,
    children: [
      {
        title: "User Management",
        href: "/admin/users",
        icon: UsersIcon,
      },
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: SettingsIcon,
      },
    ],
  },
]

export function Sidebar({ className, collapsed = false, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  // Filter navigation items based on user permissions
  const filteredSidebarItems = React.useMemo(() => {
    return filterNavigationByPermissions(sidebarItems, user)
  }, [user])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  React.useEffect(() => {
    // Auto-expand sections based on current path
    filteredSidebarItems.forEach(item => {
      if (item.children && item.children.some(child => pathname.startsWith(child.href))) {
        setExpandedItems(prev =>
          prev.includes(item.title) ? prev : [...prev, item.title]
        )
      }
    })
  }, [pathname, filteredSidebarItems])

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {collapsed ? "CA" : "CA Lobby"}
          </h2>
          <div className="space-y-1">
            {filteredSidebarItems.map((item, index) => {
              const Icon = item.icon

              if (item.children) {
                const isExpanded = expandedItems.includes(item.title)
                const hasActiveChild = item.children.some(child =>
                  pathname === child.href || pathname.startsWith(child.href)
                )

                return (
                  <div key={index}>
                    <Button
                      variant={hasActiveChild ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        hasActiveChild && "bg-muted font-medium"
                      )}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          {item.title}
                          <span className="ml-auto">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </>
                      )}
                    </Button>

                    {!collapsed && isExpanded && (
                      <div className="ml-6 space-y-1 border-l pl-4">
                        {item.children.map((child, childIndex) => {
                          const ChildIcon = child.icon
                          return (
                            <Button
                              key={childIndex}
                              variant={pathname === child.href ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start text-sm",
                                pathname === child.href && "bg-muted font-medium"
                              )}
                              asChild
                            >
                              <Link href={child.href}>
                                <ChildIcon className="mr-2 h-3 w-3" />
                                {child.title}
                              </Link>
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Button
                  key={index}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-muted font-medium"
                  )}
                  asChild
                >
                  <Link href={item.href!}>
                    <Icon className="mr-2 h-4 w-4" />
                    {!collapsed && item.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}