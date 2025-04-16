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
import { logger } from "@/lib/logger"

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

    logger.info("File selected for upload", {
      context: "image-upload",
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    })

    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      const errorMsg = "Please upload a JPG or PNG image"
      logger.warn(errorMsg, {
        context: "image-upload",
        data: { fileType: file.type },
      })
      setUploadError(errorMsg)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "File size exceeds 10MB limit"
      logger.warn(errorMsg, {
        context: "image-upload",
        data: { fileSize: file.size },
      })
      setUploadError(errorMsg)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImage(imageUrl)
      setProcessedImage(null)
      setDetectionResults(null)

      logger.info("Image loaded successfully", { context: "image-upload" })
      processImageWithBackend(imageUrl)
    }
    reader.onerror = (e) => {
      const errorMsg = "Error reading file"
      logger.error(errorMsg, new Error(reader.error?.message || "Unknown file read error"), {
        context: "image-upload",
      })
      setUploadError(errorMsg)
    }
    reader.readAsDataURL(file)
  }, [])

  // Fix the API endpoint URL and improve error handling
  const processImageWithBackend = async (imageUrl: string) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setApiError(null)

    logger.info("Starting image processing", { context: "image-processing" })

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

      logger.info("Sending image to backend for processing", {
        context: "image-processing",
        data: { modelType, detectionType, confidence, overlap },
      })

      // Use the correct API endpoint URL
      const response = await fetch("https://brewguard.onrender.com/api/detect", {
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
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        const errorMessage = errorData.error || `Failed to process image: ${response.status} ${response.statusText}`

        logger.error(`Backend API error: ${errorMessage}`, new Error(errorMessage), {
          context: "image-processing",
          data: {
            status: response.status,
            statusText: response.statusText,
          },
        })

        throw new Error(errorMessage)
      }

      const data = await response.json()

      logger.info("Image processed successfully", {
        context: "image-processing",
        data: {
          detectionsCount: data.detections?.length || 0,
        },
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessedImage(data.processedImage)
      setDetectionResults(data.detections)
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

      logger.error("Error processing image", error instanceof Error ? error : new Error(errorMessage), {
        context: "image-processing",
        data: { errorMessage },
      })

      setApiError(errorMessage)

      // For development/demo purposes, you might want to add mock data when the API is unavailable
      if (process.env.NODE_ENV !== "production" && errorMessage.includes("Failed to fetch")) {
        setApiError(
          `${errorMessage} - The API server might be offline. In a production environment, ensure the backend is running.`,
        )
      }
    } finally {
      setIsProcessing(false)
      logger.info("Image processing completed", { context: "image-processing" })
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      logger.info("File dropped for upload", { context: "image-upload" })

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      logger.info("File selected via input", { context: "image-upload" })

      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect],
  )

  const triggerFileInput = () => {
    logger.info("File input triggered", { context: "ui" })

    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50/30 dark:bg-gray-800/30">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">BrewGuard</h1>
          <Badge
            variant="outline"
            className={`${isProcessing ? "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" : "bg-teal/10 text-teal border-teal/20 dark:bg-[#00fecb]/10 dark:text-[#00fecb] dark:border-[#00fecb]/20"} px-3 py-1`}
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

        <Card className="overflow-hidden border-none shadow-md dark:bg-gray-900 dark:text-gray-100">
          <div className="h-1 bg-gradient-to-r from-teal-light via-teal to-teal-dark dark:from-[#00fecb]/70 dark:via-[#00fecb] dark:to-[#00fecb]/90"></div>
          <CardContent className="p-6 space-y-6">
            {!originalImage && (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 p-1 rounded-full bg-teal/10 dark:bg-[#00fecb]/10">
                    <CheckCircle2 className="h-5 w-5 text-teal dark:text-[#00fecb]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Instructions</h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
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
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal dark:bg-[#00fecb] text-xs font-medium text-white dark:text-gray-900">
                        {index + 1}
                      </span>
                      <span className="text-sm pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-100 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>For best results, use clear images in good lighting conditions with minimal background noise</p>
                </div>
              </>
            )}

            {apiError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-100 dark:border-red-800">
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
                  ? "border-teal dark:border-[#00fecb] bg-teal/5 dark:bg-[#00fecb]/5"
                  : uploadError
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30"
                    : "border-dashed border-gray-300 dark:border-gray-700"
              } rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-teal dark:hover:border-[#00fecb] hover:bg-teal/5 dark:hover:bg-[#00fecb]/5`}
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
                      ? "bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400"
                      : isDragging
                        ? "bg-teal dark:bg-[#00fecb] text-white dark:text-gray-900 animate-pulse"
                        : "bg-teal/10 dark:bg-[#00fecb]/10 text-teal dark:text-[#00fecb]"
                  } p-3 transition-colors duration-300`}
                >
                  {uploadError ? <FileWarning className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                </div>
                <h3 className="text-lg font-medium">{uploadError ? "Upload Error" : "Upload Image"}</h3>
                {uploadError ? (
                  <p className="text-sm text-red-500 dark:text-red-400">{uploadError}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">Supports JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>
              <Button className="mt-5 bg-teal hover:bg-teal-dark dark:bg-[#00fecb] dark:text-gray-900 dark:hover:bg-[#00fecb]/80 transition-colors">
                Select File
              </Button>
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
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center gap-3 bg-white dark:bg-gray-900">
                  <h3 className="font-medium">Original Image</h3>
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={originalImage || "/placeholder.svg"}
                      alt="Original coffee leaf"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center gap-3 bg-white dark:bg-gray-900">
                  <h3 className="font-medium">Detection Results</h3>
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
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
                          <Loader2 className="h-8 w-8 text-teal dark:text-[#00fecb] animate-spin" />
                        ) : (
                          <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            <ImageIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {detectionResults && detectionResults.length > 0 && (
              <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
                <div className="bg-teal/5 dark:bg-[#00fecb]/5 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-teal dark:text-[#00fecb]">Detection Results</h3>
                </div>

                <Tabs defaultValue="summary" className="p-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal dark:text-[#00fecb]">
                          {detectionResults.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Diseases Detected</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal dark:text-[#00fecb]">
                          {Math.max(...detectionResults.map((d) => d.confidence))}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Highest Confidence</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal dark:text-[#00fecb]">
                          {Math.round(detectionResults.reduce((sum, d) => sum + d.area, 0))}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Affected Area</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {detectionResults.map((disease, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: disease.color }} />
                          <div className="flex-1 text-sm font-medium">{disease.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {disease.confidence}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    {detectionResults.map((disease, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
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

                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
