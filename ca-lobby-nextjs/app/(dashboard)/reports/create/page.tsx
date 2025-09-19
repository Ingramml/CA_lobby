"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  FileTextIcon,
  SettingsIcon,
  PlayIcon,
  SaveIcon,
  EyeIcon,
  CalendarIcon,
  BarChartIcon,
  TrendingUpIcon,
  PieChartIcon,
} from 'lucide-react'

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  reportType: z.string().min(1, "Please select a report type"),
  category: z.string().min(1, "Please select a category"),
  period: z.string().min(1, "Please select a reporting period"),
  dateRange: z.object({
    from: z.string().min(1, "Start date is required"),
    to: z.string().min(1, "End date is required"),
  }),
  includeCharts: z.boolean().default(true),
  includeTableData: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
})

type ReportFormValues = z.infer<typeof reportSchema>

const reportTypes = [
  {
    id: "summary",
    name: "Summary Report",
    description: "Comprehensive overview of lobbying activities",
    icon: FileTextIcon,
  },
  {
    id: "trend",
    name: "Trend Analysis",
    description: "Analysis of trends over time periods",
    icon: TrendingUpIcon,
  },
  {
    id: "category",
    name: "Category Breakdown",
    description: "Breakdown by industry or category",
    icon: PieChartIcon,
  },
  {
    id: "impact",
    name: "Impact Assessment",
    description: "Assessment of lobbying impact on policy",
    icon: BarChartIcon,
  },
]

const categories = [
  "Healthcare",
  "Technology",
  "Energy",
  "Finance",
  "Education",
  "Transportation",
  "Environment",
  "Agriculture",
  "Defense",
  "All Categories",
]

export default function CreateReportPage() {
  const [selectedReportType, setSelectedReportType] = React.useState<string>("")
  const [isGenerating, setIsGenerating] = React.useState(false)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      reportType: "",
      category: "",
      period: "",
      dateRange: {
        from: "",
        to: "",
      },
      includeCharts: true,
      includeTableData: true,
      includeSummary: true,
    },
  })

  const onSubmit = async (data: ReportFormValues) => {
    setIsGenerating(true)
    console.log("Creating report:", data)

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000))

    setIsGenerating(false)
    // Handle report generation logic here
  }

  const saveDraft = () => {
    console.log("Saving draft:", form.getValues())
    // Handle save draft logic here
  }

  const previewReport = () => {
    console.log("Previewing report:", form.getValues())
    // Handle preview logic here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Report</h1>
          <p className="text-muted-foreground">
            Build custom lobbying reports with specific criteria and visualizations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={saveDraft}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={previewReport}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide basic details about your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a descriptive title for your report"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a clear and descriptive title for your report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Provide a detailed description of what this report covers"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain what data and insights this report will include
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Type</CardTitle>
              <CardDescription>
                Choose the type of analysis you want to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {reportTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedReportType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedReportType(type.id)
                        form.setValue('reportType', type.id)
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-6 w-6 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Data Selection</CardTitle>
              <CardDescription>
                Configure the data scope and filters for your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category.toLowerCase().replace(' ', '-')}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the industry or category to focus on
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reporting Period</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="q3-2024">Q3 2024</SelectItem>
                            <SelectItem value="q2-2024">Q2 2024</SelectItem>
                            <SelectItem value="q1-2024">Q1 2024</SelectItem>
                            <SelectItem value="2024">Full Year 2024</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the time period for analysis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateRange.from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateRange.to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Report Content Options */}
          <Card>
            <CardHeader>
              <CardTitle>Report Content</CardTitle>
              <CardDescription>
                Choose what to include in your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="includeSummary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Executive Summary
                          </FormLabel>
                          <FormDescription>
                            Include a high-level summary of key findings
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeCharts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Charts and Visualizations
                          </FormLabel>
                          <FormDescription>
                            Include graphs, charts, and visual representations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeTableData"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Detailed Data Tables
                          </FormLabel>
                          <FormDescription>
                            Include detailed tabular data and statistics
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview/Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Preview of your report configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Report Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedReportType ?
                      reportTypes.find(t => t.id === selectedReportType)?.name || 'Not selected'
                      : 'Not selected'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Category</h4>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('category') || 'Not selected'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Time Period</h4>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('period') || 'Not selected'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Included Content</h4>
                  <div className="space-y-1 mt-2">
                    {form.watch('includeSummary') && (
                      <Badge variant="secondary" className="text-xs mr-1">
                        Executive Summary
                      </Badge>
                    )}
                    {form.watch('includeCharts') && (
                      <Badge variant="secondary" className="text-xs mr-1">
                        Charts
                      </Badge>
                    )}
                    {form.watch('includeTableData') && (
                      <Badge variant="secondary" className="text-xs mr-1">
                        Data Tables
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated Generation Time</CardTitle>
              <CardDescription>
                Based on your selections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3-5 mins</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Complex reports with charts may take longer
                </p>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Button
                type="submit"
                className="w-full"
                disabled={isGenerating || !selectedReportType}
              >
                {isGenerating ? (
                  <>
                    <SettingsIcon className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}