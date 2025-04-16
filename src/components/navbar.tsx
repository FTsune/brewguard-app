"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  toggleSidebar: () => void
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-30">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}

        <div className="flex items-center gap-2 font-semibold">
          <div className="flex items-center justify-center bg-teal rounded-full p-1.5">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg">BrewGuard</span>
        </div>

        {/* Desktop navigation */}
        <nav className="ml-auto hidden md:flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-teal after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300"
          >
            Home
          </Link>
          <Link href="/dataset" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Dataset
          </Link>
          <Link href="/map" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Map
          </Link>
          <Link href="/team" className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal">
            Team
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-md z-20">
          <nav className="flex flex-col p-4">
            <Link
              href="/"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/dataset"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dataset
            </Link>
            <Link
              href="/map"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              href="/team"
              className="py-2 px-4 text-sm font-medium hover:bg-teal/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Team
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}