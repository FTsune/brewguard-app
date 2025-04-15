"use client"

import { useState } from "react"
import { ChevronDown, Settings, Database, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Sidebar() {
  const [modelType, setModelType] = useState("yolo11m-full-leaf")
  const [detectionType, setDetectionType] = useState("disease")
  const [confidence, setConfidence] = useState([50])
  const [overlap, setOverlap] = useState([50])
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="relative flex h-full">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-80 opacity-100"
        } border-r bg-gray-50/50 flex flex-col h-full`}
      >
        <div className="p-6 flex flex-col gap-6 overflow-auto h-full">
          <Collapsible defaultOpen className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between p-2 font-semibold text-teal hover:bg-teal/10 group transition-all"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  MODEL CONFIGURATION
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-1 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Disease Model Type
                </label>
                <Select value={modelType} onValueChange={setModelType}>
                  <SelectTrigger className="border-gray-200 focus:ring-teal focus:border-teal">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yolo11m-full-leaf">YOLO11m - Full Leaf</SelectItem>
                    <SelectItem value="spots-full-leaf">Spots + Full Leaf</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Detection Type
                </label>
                <Select value={detectionType} onValueChange={setDetectionType}>
                  <SelectTrigger className="border-gray-200 focus:ring-teal focus:border-teal">
                    <SelectValue placeholder="Select detection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disease">Disease</SelectItem>
                    <SelectItem value="leaf">Leaf</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between p-2 font-semibold text-teal hover:bg-teal/10 group transition-all"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  ADVANCED SETTINGS
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 px-1 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium leading-none">Model Confidence</label>
                  <span className="text-sm text-teal font-medium">{confidence}%</span>
                </div>
                <Slider
                  value={confidence}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={setConfidence}
                  className="[&>span]:bg-teal [&>span]:h-2 [&>span]:rounded-full [&>span[data-orientation=horizontal]]:h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium leading-none">Overlap Threshold</label>
                  <span className="text-sm text-teal font-medium">{overlap}%</span>
                </div>
                <Slider
                  value={overlap}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={setOverlap}
                  className="[&>span]:bg-teal [&>span]:h-2 [&>span]:rounded-full [&>span[data-orientation=horizontal]]:h-2"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="mt-auto">
            <div className="rounded-lg bg-gradient-to-br from-teal to-teal-light p-4 text-white shadow-md">
              <h3 className="font-medium mb-2">Pro Tip</h3>
              <p className="text-xs opacity-90">
                Higher confidence values increase precision but may miss some detections. Balance according to your
                needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md z-10 hover:bg-teal hover:text-white transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )
}