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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  DownloadIcon,
  TrashIcon,
  PlayIcon,
} from 'lucide-react'

const uploadSchema = z.object({
  dataType: z.string().min(1, "Please select a data type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  quarter: z.string().min(1, "Please select a quarter"),
})

type UploadFormValues = z.infer<typeof uploadSchema>

// Mock data for upload history
const uploadHistory = [
  {
    id: "UPL-001",
    filename: "lobbying_data_q3_2024.csv",
    dataType: "Lobbying Activities",
    size: "2.4 MB",
    uploadDate: "2024-09-15 14:30",
    status: "completed",
    records: 1245,
    errors: 0,
    warnings: 3,
  },
  {
    id: "UPL-002",
    filename: "payment_data_q3_2024.csv",
    dataType: "Payment Records",
    size: "1.8 MB",
    uploadDate: "2024-09-14 09:15",
    status: "completed",
    records: 892,
    errors: 0,
    warnings: 0,
  },
  {
    id: "UPL-003",
    filename: "organization_updates.csv",
    dataType: "Organization Data",
    size: "456 KB",
    uploadDate: "2024-09-13 16:45",
    status: "failed",
    records: 0,
    errors: 15,
    warnings: 0,
  },
  {
    id: "UPL-004",
    filename: "lobbyist_registrations.csv",
    dataType: "Lobbyist Data",
    size: "632 KB",
    uploadDate: "2024-09-12 11:20",
    status: "processing",
    records: 234,
    errors: 0,
    warnings: 1,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircleIcon className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    case 'processing':
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <PlayIcon className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircleIcon className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// const formatFileSize = (size: string) => size
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DataUploadPage() {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      dataType: "",
      description: "",
      quarter: "",
    },
  })

  const onSubmit = (data: UploadFormValues) => {
    console.log("Upload data:", data)
    console.log("Selected files:", selectedFiles)
    // Handle file upload logic here
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload lobbying data files to the system for processing and analysis
        </p>
      </div>

      {/* Upload Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Select or drag and drop CSV files containing lobbying data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files up to 50MB
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Files:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Configuration</CardTitle>
            <CardDescription>
              Configure the upload settings and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dataType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lobbying-activities">Lobbying Activities</SelectItem>
                          <SelectItem value="payment-records">Payment Records</SelectItem>
                          <SelectItem value="organization-data">Organization Data</SelectItem>
                          <SelectItem value="lobbyist-data">Lobbyist Data</SelectItem>
                          <SelectItem value="client-data">Client Data</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of data you're uploading
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quarter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="q3-2024">Q3 2024</SelectItem>
                          <SelectItem value="q2-2024">Q2 2024</SelectItem>
                          <SelectItem value="q1-2024">Q1 2024</SelectItem>
                          <SelectItem value="q4-2023">Q4 2023</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the reporting period for this data
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
                          placeholder="Describe the data being uploaded..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a brief description of the data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={selectedFiles.length === 0}>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Start Upload
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
          <CardDescription>
            Important information about data formatting and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV files with comma-separated values</li>
                <li>• UTF-8 encoding required</li>
                <li>• First row must contain column headers</li>
                <li>• Maximum file size: 50MB per file</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">Required Columns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Organization Name</li>
                <li>• Lobbyist Name</li>
                <li>• Client Name</li>
                <li>• Payment Amount</li>
                <li>• Reporting Period</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Data Validation</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  All uploaded data will be automatically validated. Files with errors will be rejected and
                  detailed error reports will be provided for correction.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            Recent file uploads and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Upload ID</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-mono text-sm">
                      {upload.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{upload.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.dataType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{upload.size}</TableCell>
                    <TableCell>{getStatusBadge(upload.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{upload.records.toLocaleString()} records</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {upload.errors > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {upload.errors} errors
                          </Badge>
                        )}
                        {upload.warnings > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            {upload.warnings} warnings
                          </Badge>
                        )}
                        {upload.errors === 0 && upload.warnings === 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            No issues
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(upload.uploadDate)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}