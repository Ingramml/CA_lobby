"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LobbyingTrendsChartProps {
  data?: Array<{
    period: string
    totalAmount: number
    numberOfLobbying: number
    averageAmount: number
  }>
  loading?: boolean
  title?: string
  description?: string
}

const defaultData = [
  {
    period: "2020-Q1",
    totalAmount: 12500000,
    numberOfLobbying: 450,
    averageAmount: 27778,
  },
  {
    period: "2020-Q2",
    totalAmount: 11200000,
    numberOfLobbying: 425,
    averageAmount: 26353,
  },
  {
    period: "2020-Q3",
    totalAmount: 13800000,
    numberOfLobbying: 520,
    averageAmount: 26538,
  },
  {
    period: "2020-Q4",
    totalAmount: 15200000,
    numberOfLobbying: 580,
    averageAmount: 26207,
  },
  {
    period: "2021-Q1",
    totalAmount: 14100000,
    numberOfLobbying: 540,
    averageAmount: 26111,
  },
  {
    period: "2021-Q2",
    totalAmount: 16500000,
    numberOfLobbying: 620,
    averageAmount: 26613,
  },
  {
    period: "2021-Q3",
    totalAmount: 17800000,
    numberOfLobbying: 680,
    averageAmount: 26176,
  },
  {
    period: "2021-Q4",
    totalAmount: 19200000,
    numberOfLobbying: 720,
    averageAmount: 26667,
  },
]

export function LobbyingTrendsChart({
  data = defaultData,
  loading = false,
  title = "Lobbying Activity Trends",
  description = "Total spending and activity over time",
}: LobbyingTrendsChartProps) {
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
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-sm fill-muted-foreground"
              />
              <YAxis
                yAxisId="amount"
                orientation="left"
                tickFormatter={formatCurrency}
                className="text-sm fill-muted-foreground"
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tickFormatter={formatNumber}
                className="text-sm fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Period
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {label}
                            </span>
                          </div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex flex-col">
                              <span
                                className="text-[0.70rem] uppercase"
                                style={{ color: entry.color }}
                              >
                                {entry.dataKey === 'totalAmount' && 'Total Amount'}
                                {entry.dataKey === 'numberOfLobbying' && 'Number of Activities'}
                                {entry.dataKey === 'averageAmount' && 'Average Amount'}
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: entry.color }}
                              >
                                {entry.dataKey === 'totalAmount' && formatCurrency(entry.value as number)}
                                {entry.dataKey === 'numberOfLobbying' && formatNumber(entry.value as number)}
                                {entry.dataKey === 'averageAmount' && formatCurrency(entry.value as number)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                yAxisId="amount"
                type="monotone"
                dataKey="totalAmount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Total Amount"
              />
              <Line
                yAxisId="count"
                type="monotone"
                dataKey="numberOfLobbying"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                name="Number of Activities"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}