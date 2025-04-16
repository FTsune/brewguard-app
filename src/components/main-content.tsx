"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef, useCallback } from "react"
import { Upload, ImageIcon, AlertCircle, Leaf, CheckCircle2, Loader2, FileWarning } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DetectionResult = {
  name: string
  confidence: number
  area: number
  description: string
  color: string
}

export function MainContent() {
  const [isDragging, setIsDragging] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [detectionResults, setDetectionResults] = useState<DetectionResult[] | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null)
    setApiError(null)

    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      setUploadError("Please upload a JPG or PNG image")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImage(imageUrl)
      setProcessedImage(null)
      setDetectionResults(null)

      processImageWithBackend(imageUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const processImageWithBackend = async (imageUrl: string) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setApiError(null)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 95 ? 95 : newProgress
      })
    }, 300)

    try {
      const modelType = "yolo11m-full-leaf"
      const detectionType = "disease"
      const confidence = 50
      const overlap = 50

      const response = await fetch("http://localhost:5000/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageUrl,
          modelType,
          detectionType,
          confidence,
          overlap,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process image")
      }

      const data = await response.json()

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessedImage(data.processedImage)
      setDetectionResults(data.detections)
    } catch (error) {
      clearInterval(progressInterval)
      setApiError(error instanceof Error ? error.message : "An unknown error occurred")
      console.error("Error processing image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect],
  )

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">BrewGuard</h1>
          <Badge
            variant="outline"
            className={`${isProcessing ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-teal/10 text-teal border-teal/20"} px-3 py-1`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
              </>
            ) : (
              <>
                <Leaf className="mr-1 h-3 w-3" /> Ready to Analyze
              </>
            )}
          </Badge>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-1 bg-gradient-to-r from-teal-light via-teal to-teal-dark"></div>
          <CardContent className="p-6 space-y-6">
            {!originalImage && (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 p-1 rounded-full bg-teal/10">
                    <CheckCircle2 className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Instructions</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Follow these steps to detect coffee leaf diseases
                    </p>
                  </div>
                </div>

                <ol className="list-none space-y-3 ml-4">
                  {[
                    "Configure the model settings in the sidebar",
                    "Upload an image of coffee leaves for analysis",
                    "The system will detect diseases based on your configuration",
                    "Results will display detected diseases, affected areas, and confidence scores",
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-medium text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>For best results, use clear images in good lighting conditions with minimal background noise</p>
                </div>
              </>
            )}

            {apiError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Backend Error</p>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            <div
              className={`flex flex-col items-center justify-center border-2 ${
                isDragging
                  ? "border-teal bg-teal/5"
                  : uploadError
                    ? "border-red-300 bg-red-50"
                    : "border-dashed border-gray-300"
              } rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-teal hover:bg-teal/5`}
              onDragEnter={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleFileInputChange}
              />

              <div className="flex flex-col items-center gap-3">
                <div
                  className={`rounded-full ${
                    uploadError
                      ? "bg-red-100 text-red-500"
                      : isDragging
                        ? "bg-teal text-white animate-pulse"
                        : "bg-teal/10 text-teal"
                  } p-3 transition-colors duration-300`}
                >
                  {uploadError ? <FileWarning className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                </div>
                <h3 className="text-lg font-medium">{uploadError ? "Upload Error" : "Upload Image"}</h3>
                {uploadError ? (
                  <p className="text-sm text-red-500">{uploadError}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>
              <Button className="mt-5 bg-teal hover:bg-teal-dark transition-colors">Select File</Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing image...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

{originalImage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-3 bg-white">
                  <h3 className="font-medium">Original Image</h3>
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={originalImage || "/placeholder.svg"}
                      alt="Original coffee leaf"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-3 bg-white">
                  <h3 className="font-medium">Detection Results</h3>
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100">
                    {processedImage ? (
                      <Image
                        src={processedImage || "/placeholder.svg"}
                        alt="Processed coffee leaf"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {isProcessing ? (
                          <Loader2 className="h-8 w-8 text-teal animate-spin" />
                        ) : (
                          <div className="p-2 rounded-full bg-gray-200">
                            <ImageIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {detectionResults && detectionResults.length > 0 && (
              <div className="mt-6 border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="bg-teal/5 p-4 border-b border-gray-200">
                  <h3 className="font-medium text-teal">Detection Results</h3>
                </div>

                <Tabs defaultValue="summary" className="p-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal">{detectionResults.length}</div>
                        <div className="text-xs text-gray-500">Diseases Detected</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal">
                          {Math.max(...detectionResults.map((d) => d.confidence))}%
                        </div>
                        <div className="text-xs text-gray-500">Highest Confidence</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal">
                          {Math.round(detectionResults.reduce((sum, d) => sum + d.area, 0))}%
                        </div>
                        <div className="text-xs text-gray-500">Affected Area</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {detectionResults.map((disease, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: disease.color }} />
                          <div className="flex-1 text-sm font-medium">{disease.name}</div>
                          <div className="text-sm text-gray-500">{disease.confidence}% confidence</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    {detectionResults.map((disease, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="p-3 text-white font-medium" style={{ backgroundColor: disease.color }}>
                          {disease.name}
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-sm">{disease.description}</p>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Confidence</span>
                              <span>{disease.confidence}%</span>
                            </div>
                            <Progress value={disease.confidence} className="h-2" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Affected Area</span>
                              <span>{disease.area}%</span>
                            </div>
                            <Progress value={disease.area} className="h-2" />
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            <strong>Recommendation:</strong> For {disease.name} with {disease.confidence}% confidence,
                            consider treatment with appropriate fungicides and improved plant spacing for better air
                            circulation.
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
