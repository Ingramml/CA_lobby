"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AssociationBreakdownChartProps {
  data?: Array<{
    name: string
    value: number
    count: number
    percentage: number
  }>
  loading?: boolean
  title?: string
  description?: string
}

const defaultData = [
  {
    name: "Business Associations",
    value: 12500000,
    count: 125,
    percentage: 35.2,
  },
  {
    name: "Professional Services",
    value: 8900000,
    count: 95,
    percentage: 25.1,
  },
  {
    name: "Trade Unions",
    value: 6200000,
    count: 78,
    percentage: 17.5,
  },
  {
    name: "Non-Profit Organizations",
    value: 4100000,
    count: 55,
    percentage: 11.6,
  },
  {
    name: "Government Entities",
    value: 2800000,
    count: 42,
    percentage: 7.9,
  },
  {
    name: "Other",
    value: 950000,
    count: 25,
    percentage: 2.7,
  },
]

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
]

export function AssociationBreakdownChart({
  data = defaultData,
  loading = false,
  title = "Lobbying by Association Type",
  description = "Breakdown of lobbying activities by organization type",
}: AssociationBreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-64 w-64 bg-gray-200 rounded-full mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Association Type
              </span>
              <span className="font-bold text-muted-foreground">
                {data.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Total Amount
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Number of Organizations
              </span>
              <span className="font-bold">
                {formatNumber(data.count)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Percentage
              </span>
              <span className="font-bold">
                {data.percentage}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="40%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatNumber(data.reduce((sum, item) => sum + item.count, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Organizations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {data.length}
            </p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}